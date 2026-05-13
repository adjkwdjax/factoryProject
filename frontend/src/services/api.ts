import { Task, User, Equipment, Incident, Message, Department } from '../lib/mockData';

const API_BASE_URL = 'http://localhost:8000/api';

const CSRF_HEADER_NAME = 'X-CSRFToken';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'TRACE']);

let csrfTokenCache: string | null = null;
let csrfTokenPromise: Promise<string> | null = null;

// Вспомогательная функция для обработки ошибок
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

const getRequestMethod = (options?: RequestInit) => {
  const method = options?.method?.toUpperCase() || 'GET';
  return method;
};

// Вспомогательная функция для обработки fetch ошибок
const fetchData = async (url: string, options?: RequestInit) => {
  try {
    const method = getRequestMethod(options);
    const headers = new Headers(options?.headers || {});

    if (!SAFE_METHODS.has(method) && !url.includes('/auth/csrf/')) {
      const csrfToken = await ensureCsrfToken();
      if (csrfToken) {
        headers.set(CSRF_HEADER_NAME, csrfToken);
      }
    }

    const response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers,
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Функция для получения CSRF токена из cookies
const getCsrfTokenFromCookie = (): string => {
  const name = 'csrftoken';
  let cookieValue = '';
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

const fetchCsrfTokenFromServer = async (): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/auth/csrf/`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.csrf_token || '';
};

const ensureCsrfToken = async (): Promise<string> => {
  const cachedToken = csrfTokenCache || getCsrfTokenFromCookie();
  if (cachedToken) {
    csrfTokenCache = cachedToken;
    return cachedToken;
  }

  if (!csrfTokenPromise) {
    csrfTokenPromise = fetchCsrfTokenFromServer()
      .then(token => {
        csrfTokenCache = token || getCsrfTokenFromCookie();
        return csrfTokenCache || '';
      })
      .catch(() => {
        csrfTokenCache = getCsrfTokenFromCookie();
        return csrfTokenCache || '';
      })
      .finally(() => {
        csrfTokenPromise = null;
      });
  }

  return csrfTokenPromise;
};

export const api = {
  // Authentication
  login: async (username: string, password: string): Promise<User | null> => {
    try {
      // Authenticate with the backend
      const authData = await fetchData(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (authData.user) {
        // Store token if provided
        if (authData.token) {
          localStorage.setItem('authToken', authData.token);
        }
        // After login the server may rotate CSRF token tied to the session.
        // Invalidate cache and fetch fresh token so subsequent unsafe requests use correct value.
        try {
          csrfTokenCache = null;
          await ensureCsrfToken();
        } catch (e) {
          // ignore token fetch errors here; subsequent requests will retry
        }
        return authData.user;
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await fetchData(`${API_BASE_URL}/auth/logout/`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      // Clear CSRF token cache after logout
      csrfTokenCache = null;
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const user = await fetchData(`${API_BASE_URL}/auth/me/`);
      return user;
    } catch (error) {
      // 401 Unauthorized - пользователь не авторизирован
      console.error('Get current user error:', error);
      throw error; // Позволяет AuthContext обработать это как нормальное состояние
    }
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    const data = await fetchData(`${API_BASE_URL}/users/`);
    return data.results || data;
  },
  
  addUser: async (user: Omit<User, 'id'>): Promise<User> => {
    // Ensure required User fields for backend: username, first_name, last_name
    const name = (user as any).name || '';
    const parts = name.trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    // generate a simple username from name (fallback to timestamp suffix to avoid collisions)
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `user`;
    const username = `${slug}-${Date.now().toString().slice(-4)}`;

    const payload: any = {
      username,
      first_name: firstName,
      last_name: lastName,
      email: (user as any).email || '',
      profile: {
        role: (user as any).role || 'WORKER',
        department_id: (user as any).departmentId || '',
      },
    };

    return fetchData(`${API_BASE_URL}/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  // Departments
  getDepartments: async (): Promise<Department[]> => {
    const data = await fetchData(`${API_BASE_URL}/departments/`);
    return data.results || data;
  },
  
  addDepartment: async (dept: Omit<Department, 'id'>): Promise<Department> => {
    return fetchData(`${API_BASE_URL}/departments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dept),
    });
  },

  // Equipment
  getEquipment: async (): Promise<Equipment[]> => {
    const data = await fetchData(`${API_BASE_URL}/equipment/`);
    return data.results || data;
  },
  
  addEquipment: async (eq: Omit<Equipment, 'id'>): Promise<Equipment> => {
    return fetchData(`${API_BASE_URL}/equipment/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eq),
    });
  },

  // Tasks
  getTasks: async (): Promise<Task[]> => {
    const data = await fetchData(`${API_BASE_URL}/tasks/`);
    return data.results || data;
  },
  
  addTask: async (task: Omit<Task, 'id' | 'comments'>): Promise<Task> => {
    const payload = {
      ...task,
      creator_id: task.creatorId,
      assignee_id: task.assigneeId,
      due_date: task.dueDate,
    };
    return fetchData(`${API_BASE_URL}/tasks/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  
  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const payload: any = { ...updates };
    if (updates.creatorId) payload.creator_id = updates.creatorId;
    if (updates.assigneeId) payload.assignee_id = updates.assigneeId;
    if (updates.dueDate) payload.due_date = updates.dueDate;
    
    return fetchData(`${API_BASE_URL}/tasks/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  
  deleteTask: async (id: string): Promise<void> => {
    await fetchData(`${API_BASE_URL}/tasks/${id}/`, {
      method: 'DELETE',
    });
  },
  
  addCommentToTask: async (taskId: string, authorId: string, text: string): Promise<Task> => {
    await fetchData(`${API_BASE_URL}/tasks/${taskId}/add_comment/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author_id: authorId, text }),
    });
    // Return updated task
    return fetchData(`${API_BASE_URL}/tasks/${taskId}/`);
  },

  // Incidents
  getIncidents: async (): Promise<Incident[]> => {
    const data = await fetchData(`${API_BASE_URL}/incidents/`);
    return data.results || data;
  },
  
  reportIncident: async (incident: Omit<Incident, 'id' | 'timestamp' | 'status'>): Promise<Incident> => {
    const payload = {
      ...incident,
      reporter_id: incident.reporterId,
      equipment_id: incident.equipmentId,
    };
    return fetchData(`${API_BASE_URL}/incidents/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  
  resolveIncident: async (id: string): Promise<void> => {
    await fetchData(`${API_BASE_URL}/incidents/${id}/resolve/`, {
      method: 'POST',
    });
  },

  // Messages
  getMessages: async (): Promise<Message[]> => {
    const data = await fetchData(`${API_BASE_URL}/messages/`);
    return data.results || data;
  },
  
  sendMessage: async (msg: Omit<Message, 'id' | 'timestamp'>): Promise<Message> => {
    const payload = {
      ...msg,
      sender_id: msg.senderId,
      receiver_id: msg.receiverId,
    };
    return fetchData(`${API_BASE_URL}/messages/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }
};
