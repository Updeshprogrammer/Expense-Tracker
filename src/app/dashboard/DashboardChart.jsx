'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/lib/currency';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FFC658',
  '#FF7C7C',
];

export default function DashboardChart({
  categoryData,
  currency,
  isMobileChart,
}) {
  const chartHeight = isMobileChart ? 300 : 400;
  const pieOuterRadius = isMobileChart ? '78%' : 120;
  const pieLabel = isMobileChart
    ? false
    : ({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`;

  if (!categoryData?.length) return null;

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:mb-8 sm:p-6">
      <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white sm:mb-6 sm:text-2xl">
        Expenses by Category
      </h2>
      <div className="touch-pan-y [-webkit-overflow-scrolling:touch]">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart
            margin={{ top: 8, right: 8, bottom: isMobileChart ? 8 : 8, left: 8 }}
          >
            <Pie
              data={categoryData}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy={isMobileChart ? '42%' : '50%'}
              labelLine={false}
              label={pieLabel}
              outerRadius={pieOuterRadius}
              innerRadius={isMobileChart ? '42%' : 0}
              fill="#8884d8"
              paddingAngle={isMobileChart ? 2 : 0}
            >
              {categoryData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(value, currency)}
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid rgb(229 231 235)',
              }}
            />
            {isMobileChart && (
              <Legend
                layout="vertical"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: '12px', paddingTop: 8 }}
                formatter={(value, entry) => {
                  const amt =
                    entry?.payload?.amount ??
                    categoryData.find((d) => d.category === value)?.amount;
                  return amt != null
                    ? `${value} (${formatCurrency(amt, currency)})`
                    : String(value);
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
