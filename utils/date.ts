/**
 * Date utility functions for the app.
 * Avoids external date libraries to keep bundle size small.
 */

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateShort(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function toISODate(date: Date): string {
  return date.toISOString();
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function daysBetween(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const ms = endDate.getTime() - startDate.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function isDateInPast(isoDate: string): boolean {
  return new Date(isoDate) < new Date();
}

export function getDateInputValue(isoDate?: string): string {
  const date = isoDate ? new Date(isoDate) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseInputDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}
