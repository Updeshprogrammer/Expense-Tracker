import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUsersCollection, getExpensesCollection, getBudgetsCollection } from '@/lib/db';

// GET - Get all users (admin only)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usersCollection = await getUsersCollection();
    const users = await usersCollection
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    // Get additional stats for each user
    const expensesCollection = await getExpensesCollection();
    const budgetsCollection = await getBudgetsCollection();

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const userId = user._id.toString();
        
        // Get total expenses count and amount
        const expenses = await expensesCollection.find({ userId }).toArray();
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        
        // Get budgets
        const budgets = await budgetsCollection.find({ userId }).toArray();
        const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);

        return {
          ...user,
          _id: userId,
          totalExpenses: expenses.length,
          totalExpenseAmount: totalExpenses,
          totalBudget: totalBudget,
          budgetCount: budgets.length,
        };
      })
    );

    return NextResponse.json({
      users: usersWithStats,
      totalUsers: usersWithStats.length,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

