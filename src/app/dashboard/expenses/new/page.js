'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/hooks/useCurrency';

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

const inputClass =
  'min-h-[48px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500';

const labelClass = 'mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200';

export default function NewExpensePage() {
  const router = useRouter();
  const { currency } = useCurrency();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || DEFAULT_CATEGORIES);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });

    if (e.target.name === 'category') {
      setShowCustomCategory(value === 'Other');
      if (value !== 'Other') {
        setCustomCategoryName('');
      }
    }
  };

  const handleAddCustomCategory = async () => {
    if (!customCategoryName.trim()) {
      setError('Please enter a category name');
      return;
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: customCategoryName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to add category');
        return;
      }

      const newCategory = customCategoryName.trim();
      setCategories([...categories.filter((c) => c !== 'Other'), newCategory, 'Other']);
      setFormData({ ...formData, category: newCategory });
      setShowCustomCategory(false);
      setCustomCategoryName('');
      setError('');
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to create expense');
        return;
      }

      router.push('/dashboard/expenses');
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] sm:pb-6">
      {/* Top bar — thumb-friendly back + title */}
      <div className="mb-4 flex items-center gap-3 sm:mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition active:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:active:bg-gray-700"
          aria-label="Go back"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold leading-tight text-gray-900 dark:text-white sm:text-3xl">
            Add expense
          </h1>
          <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
            {currency} · today or any date
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        <form
          onSubmit={handleSubmit}
          id="new-expense-form"
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:p-8"
        >
          {error && (
            <div
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-200"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="title" className={labelClass}>
                Title *
              </label>
              <input
                id="title"
                type="text"
                name="title"
                required
                autoComplete="off"
                enterKeyHint="next"
                className={inputClass}
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                enterKeyHint="done"
                className={`${inputClass} min-h-[120px] resize-y py-3`}
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Stack on mobile — full width fields */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="amount" className={labelClass}>
                  Amount ({currency}) *
                </label>
                <input
                  id="amount"
                  type="number"
                  name="amount"
                  step="0.01"
                  inputMode="decimal"
                  required
                  enterKeyHint="next"
                  className={inputClass}
                  value={formData.amount}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="category" className={labelClass}>
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  className={`${inputClass} appearance-none bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10 dark:bg-gray-800`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  }}
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {showCustomCategory && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch">
                    <input
                      type="text"
                      placeholder="New category name"
                      className={inputClass}
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomCategory();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCategory}
                      className="min-h-[48px] shrink-0 touch-manipulation rounded-xl bg-emerald-600 px-5 py-3 text-base font-semibold text-white transition active:bg-emerald-700 sm:w-auto sm:px-6"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="date" className={labelClass}>
                Date *
              </label>
              <input
                id="date"
                type="date"
                name="date"
                required
                className={inputClass}
                value={formData.date}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Desktop / tablet actions in document flow */}
          <div className="mt-8 hidden gap-3 sm:flex sm:justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="min-h-[48px] touch-manipulation rounded-xl border border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              form="new-expense-form"
              className="min-h-[48px] touch-manipulation rounded-xl bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Save expense'}
            </button>
          </div>
        </form>
      </div>

      {/* Mobile: fixed action bar — easy thumb reach */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 p-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/95 sm:hidden">
        <div
          className="mx-auto flex max-w-2xl gap-3"
          style={{ paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))' }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            className="min-h-[48px] min-w-0 flex-1 touch-manipulation rounded-xl border border-gray-300 py-3 text-base font-semibold text-gray-800 active:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:active:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            form="new-expense-form"
            className="min-h-[48px] min-w-0 flex-[1.35] touch-manipulation rounded-xl bg-blue-600 py-3 text-base font-semibold text-white shadow-md active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
