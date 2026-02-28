'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface Props {
  expenses: Expense[];
  onClose: () => void;
}

type Destination = 'download' | 'email' | 'sheets' | 'dropbox' | 'onedrive';
type Schedule = 'none' | 'daily' | 'weekly' | 'monthly';

interface HistoryEntry {
  id: string;
  template: string;
  destination: string;
  recordCount: number;
  timestamp: string;
}

const TEMPLATES = [
  {
    id: 'tax',
    name: 'Tax Report',
    description: 'All expenses grouped by category, formatted for tax filing',
    icon: '🧾',
  },
  {
    id: 'monthly',
    name: 'Monthly Summary',
    description: 'Current month expenses with totals and category breakdown',
    icon: '📅',
  },
  {
    id: 'category',
    name: 'Category Analysis',
    description: 'Spending patterns and trends across all categories',
    icon: '📊',
  },
  {
    id: 'custom',
    name: 'Full Export',
    description: 'All expenses, all fields, no filters applied',
    icon: '📦',
  },
];

const DESTINATIONS = [
  { id: 'download', label: 'Download', icon: '⬇️', connected: true },
  { id: 'email', label: 'Email', icon: '📧', connected: true },
  { id: 'sheets', label: 'Google Sheets', icon: '📗', connected: false },
  { id: 'dropbox', label: 'Dropbox', icon: '📦', connected: false },
  { id: 'onedrive', label: 'OneDrive', icon: '☁️', connected: false },
] as const;

const HISTORY_KEY = 'expense-tracker-export-history';

function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 10)));
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function CloudExportDrawer({ expenses, onClose }: Props) {
  const [template, setTemplate] = useState('monthly');
  const [destination, setDestination] = useState<Destination>('download');
  const [schedule, setSchedule] = useState<Schedule>('none');
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [shareLink, setShareLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [tab, setTab] = useState<'export' | 'history' | 'integrations'>('export');

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const getFilteredExpenses = () => {
    const now = new Date();
    if (template === 'monthly') {
      return expenses.filter(e => {
        const d = new Date(e.date + 'T12:00:00');
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }
    return expenses;
  };

  const filtered = getFilteredExpenses();
  const totalAmount = filtered.reduce((sum, e) => sum + e.amount, 0);

  const selectedTemplate = TEMPLATES.find(t => t.id === template)!;
  const selectedDest = DESTINATIONS.find(d => d.id === destination)!;

  const handleExport = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    if (destination === 'download') {
      const rows = filtered.map(e => [e.date, e.category, e.amount.toFixed(2), `"${e.description}"`]);
      const csv = [['Date', 'Category', 'Amount', 'Description'], ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate.name.toLowerCase().replace(/ /g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess('File downloaded successfully');
    } else {
      setSuccess(`${selectedDest.label} export initiated — you would receive a confirmation shortly`);
    }

    const entry: HistoryEntry = {
      id: Date.now().toString(),
      template: selectedTemplate.name,
      destination: selectedDest.label,
      recordCount: filtered.length,
      timestamp: new Date().toISOString(),
    };
    const updated = [entry, ...history];
    setHistory(updated);
    saveHistory(updated);

    setLoading(false);
    setTimeout(() => { setSuccess(''); onClose(); }, 1800);
  };

  const generateShareLink = () => {
    const fake = `https://expensetracker.app/share/${Math.random().toString(36).slice(2, 10)}`;
    setShareLink(fake);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-md bg-white dark:bg-slate-800 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">☁️ Cloud Export</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{expenses.length} expenses · {formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))} total</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl w-8 h-8 flex items-center justify-center">×</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-700 px-5">
          {(['export', 'history', 'integrations'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 mr-5 text-sm font-medium border-b-2 transition-colors capitalize ${
                tab === t
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* EXPORT TAB */}
          {tab === 'export' && (
            <div className="p-5 space-y-6">

              {/* Templates */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Export Template</label>
                <div className="space-y-2">
                  {TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTemplate(t.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors ${
                        template === t.id
                          ? 'border-indigo-300 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                          : 'border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-xl">{t.icon}</span>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium ${template === t.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'}`}>{t.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.description}</p>
                      </div>
                      {template === t.id && (
                        <svg className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview summary */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 flex justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">{filtered.length} records</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(totalAmount)}</span>
              </div>

              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Send To</label>
                <div className="grid grid-cols-3 gap-2">
                  {DESTINATIONS.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setDestination(d.id as Destination)}
                      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-medium transition-colors relative ${
                        destination === d.id
                          ? 'border-indigo-300 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-xl">{d.icon}</span>
                      <span className="text-center leading-tight">{d.label}</span>
                      {!d.connected && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" title="Not connected" />
                      )}
                    </button>
                  ))}
                </div>
                {!selectedDest.connected && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">⚠️ {selectedDest.label} not connected — this will simulate the export flow</p>
                )}
              </div>

              {/* Schedule */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto-export Schedule</label>
                  <button
                    onClick={() => setScheduleEnabled(s => !s)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${scheduleEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${scheduleEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                {scheduleEnabled && (
                  <div className="flex gap-2">
                    {(['daily', 'weekly', 'monthly'] as Schedule[]).map(s => (
                      <button
                        key={s}
                        onClick={() => setSchedule(s)}
                        className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors capitalize ${
                          schedule === s
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Share link */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Share Link</label>
                {shareLink ? (
                  <div className="flex gap-2">
                    <input readOnly value={shareLink} className="flex-1 px-3 py-2 text-xs border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg" />
                    <button onClick={copyLink} className="px-3 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap">Copy</button>
                  </div>
                ) : (
                  <button
                    onClick={generateShareLink}
                    className="w-full py-2 text-sm border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                  >
                    Generate shareable link
                  </button>
                )}
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {tab === 'history' && (
            <div className="p-5">
              {history.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">No exports yet</div>
              ) : (
                <div className="space-y-2">
                  {history.map(entry => (
                    <div key={entry.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{entry.template}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          via {entry.destination} · {entry.recordCount} records
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{timeAgo(entry.timestamp)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* INTEGRATIONS TAB */}
          {tab === 'integrations' && (
            <div className="p-5 space-y-3">
              {DESTINATIONS.map(d => (
                <div key={d.id} className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-600 rounded-xl">
                  <span className="text-2xl">{d.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{d.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {d.connected ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                  <button className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    d.connected
                      ? 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                      : 'border-indigo-300 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                  }`}>
                    {d.connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {tab === 'export' && (
          <div className="p-5 border-t border-slate-100 dark:border-slate-700 space-y-2">
            {success && (
              <p className="text-sm text-green-600 dark:text-green-400 text-center">{success}</p>
            )}
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 px-4 py-2 text-sm border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={filtered.length === 0 || loading || !!success}
                className="flex-1 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Exporting…
                  </>
                ) : `Export via ${selectedDest.label}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
