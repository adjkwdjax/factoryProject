import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User } from '../lib/mockData';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loginAs: (userId: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузить пользователей из БД и восстановить сессию
  useEffect(() => {
    const initAuth = async () => {
      try {
        const fetchedUsers = await api.getUsers();
        setUsers(fetchedUsers);
        
        // Попытаться восстановить текущего пользователя из сессии
        try {
          const currentUser = await api.getCurrentUser();
          if (currentUser) {
            setCurrentUser(currentUser);
          }
        } catch (e) {
          // 401 - пользователь не авторизирован, это нормально
          console.log("User not authenticated, showing login page");
        }
      } catch (e) {
        console.error("Failed to load users", e);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // Метод входа с логином и паролем
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const user = await api.login(username, password);
      if (user) {
        setCurrentUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Метод выхода
  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCurrentUser(null);
    }
  };

  // Быстрый вход как другой пользователь (для demo)
  const loginAs = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, loginAs, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
