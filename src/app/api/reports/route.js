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
    const format = searchParams.get('format') || 'json'; // json, pdf, excel
    const month = searchParams.get('month');
    const year = searchParams.get('year') || new Date().getFullYear();
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const expensesCollection = await getExpensesCollection();
    let query = { userId: session.user.id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (month && year) {
      const start = new Date(year, parseInt(month) - 1, 1);
      const end = new Date(year, parseInt(month), 0, 23, 59, 59);
      query.date = { $gte: start, $lte: end };
    } else if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31, 23, 59, 59);
      query.date = { $gte: start, $lte: end };
    }

    const expenses = await expensesCollection
      .find(query)
      .sort({ date: -1 })
      .toArray();

    // Category summary
    const categorySummary = expenses.reduce((acc, exp) => {
      const cat = exp.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + exp.amount;
      return acc;
    }, {});

    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const report = {
      period: month && year
        ? `${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`
        : year
        ? year.toString()
        : 'All Time',
      totalExpenses: totalAmount,
      totalCount: expenses.length,
      categorySummary: Object.entries(categorySummary).map(([category, amount]) => ({
        category,
        amount,
      })),
      expenses: expenses.map((exp) => ({
        title: exp.title,
        description: exp.description,
        amount: exp.amount,
        category: exp.category,
        date: exp.date,
      })),
    };

    if (format === 'json') {
      return NextResponse.json(report);
    }

    // For PDF/Excel, return JSON for now (client-side generation)
    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

