import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined, currency: string = 'USD'): string {
  if (amount === null || amount === undefined) return '-';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatDate(date: string | Date | null | undefined, format: string = 'DD.MM.YYYY'): string {
  if (!date) return '-';

  const d = typeof date === 'string' ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(d.getTime())) return '-';

  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();

  if (format === 'DD/MM/YYYY') {
    return `${day}/${month}/${year}`;
  } else if (format === 'DD.MM.YYYY') {
    return `${day}.${month}.${year}`;
  } else if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`;
  } else if (format === 'MM/DD/YYYY') {
    return `${month}/${day}/${year}`;
  }
  return `${day}.${month}.${year}`;
}

export function toISOString(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}
