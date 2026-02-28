'use client';

import { useState } from 'react';
import { Expense, Category } from '@/lib/types';
import { CATEGORIES } from '@/lib/utils';
import { X } from 'lucide-react';
import CustomSelect from '@/components/CustomSelect';

interface Props {
  expense: Expense | null;
  onSave: (data: Omit<Expense, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

interface FormErrors {
  amount?: string;
  date?: string;
  description?: string;
}

export default function ExpenseForm({ expense, onSave, onClose }: Props) {
  const today = new Date().toISOString().split('T')[0];

  const [amount, setAmount] = useState(expense ? expense.amount.toString() : '');
  const [date, setDate] = useState(expense ? expense.date : today);
  const [category, setCategory] = useState<Category>(expense ? expense.category : 'Food');
  const [description, setDescription] = useState(expense ? expense.description : '');
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      newErrors.amount = 'Enter a valid amount greater than 0';
    }
    if (!date) newErrors.date = 'Date is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    else if (description.length > 100) newErrors.description = 'Must be under 100 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      amount: parseFloat(parseFloat(amount).toFixed(2)),
      date,
      category,
      description: description.trim(),
    });
  };

  const inputBase = 'w-full px-3 py-2 border rounded-lg text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors';
  const inputBorder = (hasError: boolean) => hasError ? 'border-red-300 dark:border-red-500' : 'border-slate-300 dark:border-slate-600';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md transition-colors">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {expense ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className={`${inputBase} pl-7 pr-3 ${inputBorder(!!errors.amount)}`}
              />
            </div>
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className={`${inputBase} ${inputBorder(!!errors.date)}`}
            />
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <CustomSelect
              value={category}
              onChange={val => setCategory(val as Category)}
              options={CATEGORIES.map(c => ({ value: c, label: c }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What did you spend on?"
              maxLength={100}
              className={`${inputBase} ${inputBorder(!!errors.description)}`}
            />
            <div className="flex justify-between mt-1">
              {errors.description
                ? <p className="text-xs text-red-500">{errors.description}</p>
                : <span />
              }
              <p className="text-xs text-slate-400">{description.length}/100</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              {expense ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
