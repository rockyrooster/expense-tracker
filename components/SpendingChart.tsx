'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { CATEGORY_COLORS, formatCurrency, lightenHex } from '@/lib/utils';

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
        <defs>
          {data.map((entry) => {
            const color = CATEGORY_COLORS[entry.name] || '#94a3b8';
            const gradId = `grad-${entry.name.replace(/\s+/g, '-')}`;
            return (
              <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="0" y2="240" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={lightenHex(color, 0.5)} />
                <stop offset="100%" stopColor={color} />
              </linearGradient>
            );
          })}
        </defs>

        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={95}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={`url(#grad-${entry.name.replace(/\s+/g, '-')})`}
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
