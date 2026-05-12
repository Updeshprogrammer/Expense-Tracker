'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { formatCurrency } from '@/lib/currency';
import { useCurrency } from '@/hooks/useCurrency';
import {
  DashboardSkeleton,
  ChartSkeleton,
} from '@/components/skeletons/DashboardSkeleton';

const DashboardChart = dynamic(() => import('./DashboardChart'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

export default function Dashboard() {
  const { data: session } = useSession();
  const { currency } = useCurrency();
  const [stats, setStats] = useState({
    totalExpenses: 0,
    monthlyExpenses: 0,
    categoryCount: 0,
    budget: null,
    categoryData: [],
  });
  const [loading, setLoading] = useState(true);
  const [isMobileChart, setIsMobileChart] = useState(false);

  useEffect(() => {
    if (session) {
      fetchStats();
    }
  }, [session]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobileChart(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const fetchStats = async () => {
    try {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const [expensesRes, budgetRes, analyticsRes] = await Promise.all([
        fetch(`/api/expenses?month=${month}&year=${year}`),
        fetch(`/api/budgets?month=${month}&year=${year}`),
        fetch(`/api/analytics?type=category&month=${month}&year=${year}`),
      ]);

      const [expenses, budgetData, analytics] = await Promise.all([
        expensesRes.json(),
        budgetRes.json(),
        analyticsRes.json(),
      ]);

      const expenseRows = Array.isArray(expenses) ? expenses : [];
      const monthlyTotal = expenseRows.reduce((sum, exp) => sum + exp.amount, 0);

      setStats({
        totalExpenses: analytics.total || 0,
        monthlyExpenses: monthlyTotal,
        categoryCount: analytics.categoryData?.length || 0,
        budget: budgetData,
        categoryData: analytics.categoryData || [],
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const budgetPercentage = stats.budget?.percentage || 0;
  const isOverBudget = budgetPercentage > 100;

  const statCards = [
    {
      title: 'Monthly Expenses',
      value: formatCurrency(stats.monthlyExpenses, currency),
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
    },
    {
      title: 'Categories',
      value: stats.categoryCount.toString(),
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
    },
    {
      title: 'Monthly Budget',
      value: stats.budget?.budget?.amount
        ? formatCurrency(stats.budget.budget.amount, currency)
        : 'Not set',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
    },
    {
      title: 'Budget Status',
      value: stats.budget?.percentage
        ? `${stats.budget.percentage.toFixed(1)}%`
        : 'N/A',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: isOverBudget
        ? 'from-red-500 to-red-600'
        : stats.budget?.percentage > 80
        ? 'from-yellow-500 to-yellow-600'
        : 'from-green-500 to-green-600',
      bgGradient: isOverBudget
        ? 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20'
        : stats.budget?.percentage > 80
        ? 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20'
        : 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
      textColor: isOverBudget
        ? 'text-red-600 dark:text-red-400'
        : stats.budget?.percentage > 80
        ? 'text-yellow-600 dark:text-yellow-400'
        : 'text-green-600 dark:text-green-400',
    },
  ];

  return (
    <div className="pb-2 pt-2 sm:py-8 sm:pb-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-4xl sm:mb-2">
          Welcome back, {session?.user?.name?.split(' ')[0]}!
          <span className="ml-1 inline-block sm:ml-2" aria-hidden="true">
            👋
          </span>
        </h1>
        <p className="mt-1 text-base text-gray-600 dark:text-gray-400 sm:text-lg">
          Here&apos;s an overview of your expenses
        </p>
      </div>

      {/* Stats Grid — single column on phones for readability */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`rounded-2xl border border-gray-200 bg-gradient-to-br ${card.bgGradient} p-5 shadow-lg backdrop-blur-sm transition-transform active:scale-[0.99] dark:border-gray-700 sm:p-6 sm:hover:-translate-y-1 sm:hover:shadow-xl`}
          >
            <div className="mb-3 flex items-center justify-between sm:mb-4">
              <div
                className={`rounded-xl bg-gradient-to-br ${card.gradient} p-2.5 shadow-lg sm:p-3`}
              >
                <div className="text-white [&_svg]:h-6 [&_svg]:w-6">{card.icon}</div>
              </div>
            </div>
            <div>
              <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400 sm:text-sm sm:normal-case sm:tracking-normal">
                {card.title}
              </p>
              <p
                className={`text-xl font-bold tabular-nums sm:text-2xl lg:text-3xl ${
                  card.textColor || 'text-gray-900 dark:text-white'
                }`}
              >
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Budget Alert */}
      {isOverBudget && (
        <div className="mb-6 rounded-xl border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-red-100 p-4 shadow-lg dark:from-red-900/20 dark:to-red-800/20 sm:mb-8 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-1">
                Budget Exceeded!
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400">
                You have exceeded your monthly budget. Consider reviewing your expenses.
              </p>
            </div>
          </div>
        </div>
      )}

      {stats.categoryData && stats.categoryData.length > 0 && (
        <DashboardChart
          categoryData={stats.categoryData}
          currency={currency}
          isMobileChart={isMobileChart}
        />
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:p-8">
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white sm:mb-6 sm:text-2xl">
            Quick Actions
          </h2>
          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard/expenses/new"
              className="flex min-h-[48px] touch-manipulation items-center justify-between rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/40 transition active:opacity-90 sm:py-4 sm:hover:scale-[1.02] sm:hover:from-blue-700 sm:hover:to-purple-700"
            >
              <span>Add New Expense</span>
              <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
            <Link
              href="/dashboard/budget"
              className="flex min-h-[48px] touch-manipulation items-center rounded-xl bg-gray-100 px-5 py-3.5 text-base font-semibold text-gray-800 transition active:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:active:bg-gray-600 sm:py-4 sm:hover:bg-gray-200 dark:sm:hover:bg-gray-600"
            >
              Set Monthly Budget
            </Link>
            <Link
              href="/dashboard/analytics"
              className="flex min-h-[48px] touch-manipulation items-center rounded-xl bg-gray-100 px-5 py-3.5 text-base font-semibold text-gray-800 transition active:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:active:bg-gray-600 sm:py-4 sm:hover:bg-gray-200 dark:sm:hover:bg-gray-600"
            >
              View Analytics
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:p-8">
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white sm:mb-6 sm:text-2xl">
            Recent Activity
          </h2>
          <div className="py-6 text-center sm:py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <p className="mt-4 text-gray-600 dark:text-gray-400 mb-4">
              View your recent expenses
            </p>
            <Link
              href="/dashboard/expenses"
              className="inline-flex min-h-[44px] touch-manipulation items-center justify-center gap-2 rounded-lg px-3 py-2 text-base font-semibold text-blue-600 active:bg-blue-50 dark:text-blue-400 dark:active:bg-blue-950/40 sm:hover:text-blue-700 dark:sm:hover:text-blue-300"
            >
              View all expenses
              <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
