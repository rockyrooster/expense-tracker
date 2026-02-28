'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CATEGORY_COLORS, formatCurrency } from '@/lib/utils';

interface Props {
  data: { name: string; value: number }[];
}

export default function SpendingChart({ data }: Props) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => typeof value === 'number' ? formatCurrency(value) : value} />
        <Legend
          formatter={(value) => (
            <span style={{ fontSize: '11px', color: '#64748b' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
