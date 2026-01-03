import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUsersCollection, getExpensesCollection, getBudgetsCollection } from '@/lib/db';

// GET - Get admin analytics (admin only)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usersCollection = await getUsersCollection();
    const expensesCollection = await getExpensesCollection();
    const budgetsCollection = await getBudgetsCollection();

    // Get total counts
    const totalUsers = await usersCollection.countDocuments();
    const totalExpenses = await expensesCollection.countDocuments();
    const totalBudgets = await budgetsCollection.countDocuments();

    // Get all expenses for analytics
    const allExpenses = await expensesCollection.find({}).toArray();
    const totalExpenseAmount = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Get all budgets
    const allBudgets = await budgetsCollection.find({}).toArray();
    const totalBudgetAmount = allBudgets.reduce((sum, budget) => sum + budget.amount, 0);

    // Category-wise breakdown
    const categoryData = allExpenses.reduce((acc, exp) => {
      const cat = exp.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + exp.amount;
      return acc;
    }, {});

    const categoryBreakdown = Object.entries(categoryData).map(([category, amount]) => ({
      category,
      amount,
      count: allExpenses.filter(exp => (exp.category || 'Uncategorized') === category).length,
    })).sort((a, b) => b.amount - a.amount);

    // Monthly breakdown (last 12 months)
    const monthlyData = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = 0;
    }

    allExpenses.forEach((exp) => {
      const date = new Date(exp.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[key] !== undefined) {
        monthlyData[key] += exp.amount;
      }
    });

    const monthlyBreakdown = Object.entries(monthlyData).map(([period, amount]) => ({
      period,
      amount,
    }));

    return NextResponse.json({
      totalUsers,
      totalExpenses,
      totalBudgets,
      totalExpenseAmount,
      totalBudgetAmount,
      categoryBreakdown,
      monthlyBreakdown,
    });
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

