'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/currency';
import { useCurrency } from '@/hooks/useCurrency';

export default function BudgetPage() {
  const { currency } = useCurrency();
  const [budget, setBudget] = useState(null);
  const [amount, setAmount] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBudget();
  }, [selectedMonth, selectedYear]);

  const fetchBudget = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/budgets?month=${selectedMonth}&year=${selectedYear}`
      );
      const data = await response.json();
      setBudget(data);
      if (data.budget) {
        setAmount(data.budget.amount.toString());
      } else {
        setAmount('');
      }
    } catch (error) {
      console.error('Error fetching budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          month: selectedMonth,
          year: selectedYear,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to set budget');
        return;
      }

      fetchBudget();
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const percentage = budget?.percentage || 0;
  const isOverBudget = percentage > 100;
  const isWarning = percentage > 80 && percentage <= 100;

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Budget Management
      </h1>

      {/* Month/Year Selection */}
      <div className="bg-white shadow rounded-lg p-6 mb-6 dark:bg-gray-800">
        <div className="flex flex-wrap gap-4 items-end">
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Form */}
        <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Set Monthly Budget
          </h2>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Budget Amount ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Set Budget'}
            </button>
          </form>
        </div>

        {/* Budget Status */}
        <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Budget Status
          </h2>
          {budget?.budget ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Budget
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(budget.budget.amount, currency)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Spent
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(budget.totalExpenses, currency)}
                  </span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Remaining
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      budget.remaining < 0
                        ? 'text-red-600'
                        : budget.remaining < budget.budget.amount * 0.2
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}
                  >
                    {formatCurrency(budget.remaining, currency)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Usage
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      isOverBudget
                        ? 'text-red-600'
                        : isWarning
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}
                  >
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                  <div
                    className={`h-4 rounded-full ${
                      isOverBudget
                        ? 'bg-red-600'
                        : isWarning
                        ? 'bg-yellow-600'
                        : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {isOverBudget && (
                <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 dark:bg-red-900/20">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        <strong>Budget Exceeded!</strong> You have exceeded your
                        monthly budget by{' '}
                        {formatCurrency(Math.abs(budget.remaining), currency)}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isWarning && !isOverBudget && (
                <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 dark:bg-yellow-900/20">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        <strong>Warning!</strong> You have used{' '}
                        {percentage.toFixed(1)}% of your budget. Consider
                        monitoring your expenses.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No budget set for this month. Set a budget to track your spending.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

