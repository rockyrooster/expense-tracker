'use client';

import { Expense, FilterState, Category } from '@/lib/types';
import { CATEGORIES, CATEGORY_COLORS, formatCurrency, formatDate } from '@/lib/utils';
import CustomSelect from '@/components/CustomSelect';

interface Props {
  expenses: Expense[];
  filter: FilterState;
  onFilterChange: (f: FilterState) => void;
  onEdit: (e: Expense) => void;
  onDelete: (id: string) => void;
}

export default function ExpenseList({ expenses, filter, onFilterChange, onEdit, onDelete }: Props) {
  const hasActiveFilters = filter.category !== 'All' || filter.dateFrom || filter.dateTo;

  const controlBase = 'px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
      {/* Filter bar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-wrap gap-3 items-center">
        <CustomSelect
          value={filter.category}
          onChange={val => onFilterChange({ ...filter, category: val as Category | 'All' })}
          options={[
            { value: 'All', label: 'All Categories' },
            ...CATEGORIES.map(c => ({ value: c, label: c })),
          ]}
          className="min-w-[160px]"
        />

        <input
          type="date"
          value={filter.dateFrom}
          onChange={e => onFilterChange({ ...filter, dateFrom: e.target.value })}
          className={controlBase}
        />
        <span className="text-slate-400 dark:text-slate-500 text-sm">to</span>
        <input
          type="date"
          value={filter.dateTo}
          onChange={e => onFilterChange({ ...filter, dateTo: e.target.value })}
          className={controlBase}
        />

        {hasActiveFilters && (
          <button
            onClick={() => onFilterChange({ category: 'All', dateFrom: '', dateTo: '' })}
            className="text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* List */}
      {expenses.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {hasActiveFilters ? 'No expenses match your filters' : 'No expenses yet — add your first one!'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50 dark:divide-slate-700">
          {expenses.map(expense => (
            <div
              key={expense.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{expense.description}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(expense.date)} · {expense.category}</p>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex-shrink-0">
                {formatCurrency(expense.amount)}
              </p>
              <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(expense)}
                  className="px-2 py-1 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this expense?')) onDelete(expense.id);
                  }}
                  className="px-2 py-1 text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer total */}
      {expenses.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
          </p>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
          </p>
        </div>
      )}
    </div>
  );
}
