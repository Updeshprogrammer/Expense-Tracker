'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/currency';
import { useCurrency } from '@/hooks/useCurrency';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

export default function AnalyticsPage() {
  const { currency } = useCurrency();
  const [analytics, setAnalytics] = useState({
    monthly: [],
    yearly: [],
    category: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod, selectedMonth, selectedYear]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('type', selectedPeriod === 'monthly' ? 'monthly' : selectedPeriod);
      if (selectedPeriod === 'monthly') {
        params.append('month', selectedMonth);
      }
      params.append('year', selectedYear);

      const response = await fetch(`/api/analytics?${params.toString()}`);
      const data = await response.json();

      if (selectedPeriod === 'category') {
        setAnalytics({ ...analytics, category: data.categoryData || [] });
      } else {
        setAnalytics({
          ...analytics,
          [selectedPeriod]: data.breakdown || [],
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchYearlyAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?type=yearly&year=${selectedYear}`);
      const data = await response.json();
      setAnalytics({ ...analytics, yearly: data.breakdown || [] });
    } catch (error) {
      console.error('Error fetching yearly analytics:', error);
    }
  };

  useEffect(() => {
    if (selectedPeriod === 'yearly') {
      fetchYearlyAnalytics();
    }
  }, [selectedYear]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics & Reports
        </h1>
        <Link
          href="/dashboard/analytics/reports"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          Download Reports
        </Link>
      </div>

      {/* Period Selection */}
      <div className="bg-white shadow rounded-lg p-6 mb-6 dark:bg-gray-800">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              View Type
            </label>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="category">Category-wise</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Year
            </label>
            <input
              type="number"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              min="2020"
              max="2100"
            />
          </div>
          {selectedPeriod === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Month
              </label>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {new Date(selectedYear, month - 1).toLocaleString('default', {
                      month: 'long',
                    })}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {selectedPeriod === 'category' ? (
          <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Expenses by Category (Pie Chart)
            </h2>
            {analytics.category && analytics.category.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={analytics.category}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) =>
                      `${category}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {analytics.category.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value, currency)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-400">
                <p className="text-gray-500 dark:text-gray-400">No data available</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {selectedPeriod === 'monthly' ? 'Monthly Expenses' : 'Yearly Expenses'}
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analytics[selectedPeriod]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value, currency)} />
                <Legend />
                <Bar dataKey="amount" fill="#0088FE" name="Amount ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Summary Card */}
        <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Summary
          </h2>
          <div className="space-y-4">
            {selectedPeriod === 'category' ? (
              <div className="space-y-2">
                {analytics.category.map((item, index) => (
                  <div
                    key={item.category}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded dark:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded mr-2"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <span className="text-gray-900 dark:text-white">
                        {item.category}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(item.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {analytics[selectedPeriod].map((item) => (
                  <div
                    key={item.period}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded dark:bg-gray-700"
                  >
                    <span className="text-gray-900 dark:text-white">
                      {item.period}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(item.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

