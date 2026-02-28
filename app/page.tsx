'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Expense, FilterState } from '@/lib/types';
import { getExpenses, saveExpenses } from '@/lib/storage';
import { generateId, exportToCSV, formatCurrency, getThisMonthTotal, CATEGORY_COLORS, CATEGORY_ICONS, lightenHex } from '@/lib/utils';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import CloudExportDrawer from '@/components/CloudExportDrawer';

const SpendingChart = dynamic(() => import('@/components/SpendingChart'), { ssr: false });

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filter, setFilter] = useState<FilterState>({ category: 'All', dateFrom: '', dateTo: '' });
  const [isDark, setIsDark] = useState(false);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    setExpenses(getExpenses());
    // Read saved theme preference; default to light
    const saved = localStorage.getItem('theme');
    const dark = saved === 'dark';
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleSave = (data: Omit<Expense, 'id' | 'createdAt'>) => {
    let updated: Expense[];
    if (editingExpense) {
      updated = expenses.map(e => e.id === editingExpense.id ? { ...e, ...data } : e);
    } else {
      const newExpense: Expense = { ...data, id: generateId(), createdAt: new Date().toISOString() };
      updated = [newExpense, ...expenses];
    }
    setExpenses(updated);
    saveExpenses(updated);
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleDelete = (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    saveExpenses(updated);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => {
        if (filter.category !== 'All' && e.category !== filter.category) return false;
        if (filter.dateFrom && e.date < filter.dateFrom) return false;
        if (filter.dateTo && e.date > filter.dateTo) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, filter]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    expenses.forEach(e => { totals[e.category] = (totals[e.category] || 0) + e.amount; });
    return Object.entries(totals).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  const totalAll = expenses.reduce((sum, e) => sum + e.amount, 0);
  const thisMonth = getThisMonthTotal(expenses);
  const categoriesUsed = new Set(expenses.map(e => e.category)).size;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-950 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 transition-colors">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">ExpenseTracker</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{expenses.length} expense{expenses.length !== 1 ? 's' : ''} tracked</p>
          </div>
          <div className="flex gap-2 items-center">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
              aria-label="Toggle theme"
            >
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button
              onClick={() => setShowExport(true)}
              disabled={expenses.length === 0}
              className="px-3 py-2 text-sm border rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent active:scale-95"
            >
              📤 Export
            </button>
            <button
              onClick={() => { setEditingExpense(null); setShowForm(true); }}
              className="px-4 py-2 text-sm border-2 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 dark:hover:text-white transition-all font-medium active:scale-95"
            >
              + Add Expense
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total All Time" value={formatCurrency(totalAll)} />
          <StatCard label="This Month" value={formatCurrency(thisMonth)} />
          <StatCard label="Total Expenses" value={expenses.length.toString()} />
          <StatCard label="Categories Used" value={categoriesUsed.toString()} />
        </div>

        {/* Chart + category breakdown */}
        {expenses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-950/30 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Spending by Category</h2>
              <SpendingChart data={categoryTotals} />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Category Breakdown</h2>
              <div className="space-y-3">
                {categoryTotals.map(({ name, value }) => {
                  const pct = totalAll > 0 ? (value / totalAll) * 100 : 0;
                  const color = CATEGORY_COLORS[name] || '#94a3b8';
                  return (
                    <div key={name}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                          <span>{CATEGORY_ICONS[name]}</span>
                          {name}
                        </span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(value)}</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${pct}%`, background: `linear-gradient(to right, ${color}, ${lightenHex(color, 0.55)})` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Expense list */}
        <ExpenseList
          expenses={filteredExpenses}
          filter={filter}
          onFilterChange={setFilter}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

      {/* Cloud export drawer */}
      {showExport && (
        <CloudExportDrawer expenses={expenses} onClose={() => setShowExport(false)} />
      )}

      {/* Add/Edit modal */}
      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingExpense(null); }}
        />
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-default">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}
