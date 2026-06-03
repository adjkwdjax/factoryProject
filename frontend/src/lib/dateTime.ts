import { format } from 'date-fns';

const minuteMs = 60 * 1000;
const hourMs = 60 * minuteMs;
const dayMs = 24 * hourMs;

export const toUtcIsoFromLocalInput = (value: string): string => {
  if (!value) return value;
  return new Date(value).toISOString();
};

export const formatLocalDateTime = (value: string): string => {
  return format(new Date(value), 'dd.MM.yyyy HH:mm');
};

export const toLocalDateTimeInput = (value: string): string => {
  if (!value) return value;
  return format(new Date(value), "yyyy-MM-dd'T'HH:mm");
};

const formatDuration = (milliseconds: number): string => {
  const totalMinutes = Math.max(1, Math.ceil(Math.abs(milliseconds) / minuteMs));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days) parts.push(`${days} д`);
  if (hours) parts.push(`${hours} ч`);
  if (!days && minutes) parts.push(`${minutes} мин`);

  return parts.join(' ');
};

export const getDeadlineTimeText = (deadline: string, completedAt?: string | null): string => {
  const deadlineTime = new Date(deadline).getTime();
  const compareTime = completedAt ? new Date(completedAt).getTime() : Date.now();
  const diff = deadlineTime - compareTime;

  if (Number.isNaN(deadlineTime) || Number.isNaN(compareTime)) return 'не указано';
  if (diff < 0) return `просрочена на ${formatDuration(diff)}`;
  if (diff <= dayMs) return `осталось ${formatDuration(diff)}`;
  return `осталось ${formatDuration(diff)}`;
};
