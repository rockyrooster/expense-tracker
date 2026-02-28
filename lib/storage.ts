import { Expense } from './types';

const KEY = 'expense-tracker-data';

export function getExpenses(): Expense[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  localStorage.setItem(KEY, JSON.stringify(expenses));
}
