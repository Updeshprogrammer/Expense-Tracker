import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getExpensesCollection } from '@/lib/db';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'monthly'; // monthly, yearly, category
    const month = searchParams.get('month');
    const year = searchParams.get('year') || new Date().getFullYear();

    const expensesCollection = await getExpensesCollection();
    let query = { userId: session.user.id };

    if (type === 'monthly' && month) {
      const start = new Date(year, parseInt(month) - 1, 1);
      const end = new Date(year, parseInt(month), 0, 23, 59, 59);
      query.date = { $gte: start, $lte: end };
    } else if (type === 'yearly') {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31, 23, 59, 59);
      query.date = { $gte: start, $lte: end };
    } else if (type === 'category') {
      // For category type, filter by month if provided, otherwise use year
      if (month) {
        const start = new Date(year, parseInt(month) - 1, 1);
        const end = new Date(year, parseInt(month), 0, 23, 59, 59);
        query.date = { $gte: start, $lte: end };
      } else {
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31, 23, 59, 59);
        query.date = { $gte: start, $lte: end };
      }
    }

    const expenses = await expensesCollection.find(query).toArray();

    if (type === 'category') {
      const categoryData = expenses.reduce((acc, exp) => {
        const cat = exp.category || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + exp.amount;
        return acc;
      }, {});

      return NextResponse.json({
        categoryData: Object.entries(categoryData).map(([category, amount]) => ({
          category,
          amount,
        })),
        total: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      });
    }

    // Monthly or yearly breakdown
    const breakdown = {};
    expenses.forEach((exp) => {
      const date = new Date(exp.date);
      const key = type === 'monthly' 
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : `${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
      
      if (!breakdown[key]) {
        breakdown[key] = 0;
      }
      breakdown[key] += exp.amount;
    });

    return NextResponse.json({
      breakdown: Object.entries(breakdown).map(([period, amount]) => ({
        period,
        amount,
      })),
      total: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

