import { Expense, Category } from './types';

export const CATEGORIES: Category[] = [
  'Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Other',
];

export const CATEGORY_COLORS: Record<string, string> = {
  Bills:          '#ef4444', // vivid red
  Transportation: '#22c55e', // vivid green
  Entertainment:  '#f59e0b', // amber
  Shopping:       '#ec4899', // pink
  Food:           '#f97316', // orange — distinct from violet Other
  Other:          '#8b5cf6', // violet
};

// Darker shades of each color, for readable text on the light-tint pill bg
export const CATEGORY_TEXT_COLORS: Record<string, string> = {
  Bills:          '#b91c1c', // red-700
  Transportation: '#15803d', // green-700
  Entertainment:  '#b45309', // amber-700
  Shopping:       '#be185d', // pink-700
  Food:           '#c2410c', // orange-700
  Other:          '#6d28d9', // violet-700
};

export function lightenHex(hex: string, factor = 0.45): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * factor);
  return `#${mix(r).toString(16).padStart(2, '0')}${mix(g).toString(16).padStart(2, '0')}${mix(b).toString(16).padStart(2, '0')}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getThisMonthTotal(expenses: Expense[]): number {
  const now = new Date();
  return expenses
    .filter(e => {
      const d = new Date(e.date + 'T12:00:00');
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);
}

export function exportToCSV(expenses: Expense[]): void {
  const headers = ['Date', 'Amount', 'Category', 'Description'];
  const rows = expenses.map(e => [
    e.date,
    e.amount.toFixed(2),
    e.category,
    `"${e.description.replace(/"/g, '""')}"`,
  ]);
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
