'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';
import { useCurrency } from '@/hooks/useCurrency';
import { ExpensesSkeleton } from '@/components/skeletons/ExpensesSkeleton';

const DEFAULT_CATEGORIES = [
  'Food',
  'Travel',
  'Rent',
  'Office',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Utilities',
  'Other',
];

function useDebounced(value, ms) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function ExpensesPage() {
  const { currency } = useCurrency();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    startDate: '',
    endDate: '',
  });
  const debouncedSearch = useDebounced(filters.search, 350);
  const categoriesFetched = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.category !== 'all') params.append('category', filters.category);
        if (debouncedSearch) params.append('search', debouncedSearch);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);

        const expenseUrl = `/api/expenses?${params.toString()}`;

        if (!categoriesFetched.current) {
          const [catRes, expRes] = await Promise.all([
            fetch('/api/categories'),
            fetch(expenseUrl),
          ]);
          if (cancelled) return;
          const catJson = await catRes.json();
          const expJson = await expRes.json();
          setCategories(catJson.categories || DEFAULT_CATEGORIES);
          setExpenses(Array.isArray(expJson) ? expJson : []);
          categoriesFetched.current = true;
        } else {
          const expRes = await fetch(expenseUrl);
          if (cancelled) return;
          const expJson = await expRes.json();
          setExpenses(Array.isArray(expJson) ? expJson : []);
        }
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setHasLoadedOnce(true);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, filters.category, filters.startDate, filters.endDate]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setExpenses((prev) => prev.filter((e) => e._id !== id));
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (!hasLoadedOnce && loading) {
    return <ExpensesSkeleton variant="full" />;
  }

  return (
    <div className="py-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Expenses
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track your expenses
          </p>
        </div>
        <Link
          href="/dashboard/expenses/new"
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-center text-base font-semibold text-white shadow-lg shadow-blue-500/50 transition-all hover:scale-105 hover:from-blue-700 hover:to-purple-700 sm:w-auto"
        >
          + Add Expense
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search
            </label>
            <input
              type="search"
              placeholder="Search expenses..."
              autoComplete="off"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Date
            </label>
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              End Date
            </label>
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {hasLoadedOnce && loading ? (
        <ExpensesSkeleton variant="content" />
      ) : (
        <>
          <div className="mb-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6 shadow-lg dark:border-blue-800 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-800 dark:text-blue-200">
                Total Expenses:
              </span>
              <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(totalAmount, currency)}
              </span>
            </div>
          </div>

          {expenses.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <p className="text-lg text-gray-500 dark:text-gray-400">
                No expenses found. Add your first expense to get started!
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {expenses.map((expense) => (
                      <tr key={expense._id}>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {expense.title}
                          </div>
                          {expense.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {expense.description}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {expense.category}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(expense.date), 'MMM dd, yyyy')}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(expense.amount, currency)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <Link
                            href={`/dashboard/expenses/${expense._id}/edit`}
                            className="mr-4 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(expense._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
