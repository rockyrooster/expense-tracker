'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { CATEGORY_COLORS, formatCurrency } from '@/lib/utils';

interface Props {
  data: { name: string; value: number }[];
  isDark?: boolean;
}

export default function SpendingChart({ data, isDark = false }: Props) {
  if (data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={95}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={2}
          stroke={isDark ? '#1e293b' : '#ffffff'}
        >
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={CATEGORY_COLORS[entry.name] || '#94a3b8'}
            />
          ))}
          <Label
            content={({ viewBox }) => {
              const { cx, cy } = viewBox as { cx: number; cy: number };
              return (
                <g>
                  <text x={cx} y={cy - 4} textAnchor="middle" fill={isDark ? '#f8fafc' : '#0f172a'} fontSize={17} fontWeight={800}>
                    {formatCurrency(total)}
                  </text>
                  <text x={cx} y={cy + 14} textAnchor="middle" fill={isDark ? '#64748b' : '#94a3b8'} fontSize={11}>
                    Total
                  </text>
                </g>
              );
            }}
          />
        </Pie>

        <Tooltip
          formatter={(value) => typeof value === 'number' ? formatCurrency(value) : value}
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          itemStyle={{ color: '#e2e8f0' }}
          labelStyle={{ color: '#94a3b8', marginBottom: '2px' }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
