import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getBudgetsCollection, getExpensesCollection } from '@/lib/db';

// GET - Get budget for current month
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || new Date().getMonth() + 1;
    const year = searchParams.get('year') || new Date().getFullYear();

    const budgetsCollection = await getBudgetsCollection();
    const budget = await budgetsCollection.findOne({
      userId: session.user.id,
      month: parseInt(month),
      year: parseInt(year),
    });

    // Calculate total expenses for the month
    const expensesCollection = await getExpensesCollection();
    const start = new Date(year, parseInt(month) - 1, 1);
    const end = new Date(year, parseInt(month), 0, 23, 59, 59);

    const expenses = await expensesCollection
      .find({
        userId: session.user.id,
        date: { $gte: start, $lte: end },
      })
      .toArray();

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return NextResponse.json({
      budget: budget || null,
      totalExpenses,
      remaining: budget ? budget.amount - totalExpenses : null,
      percentage: budget ? (totalExpenses / budget.amount) * 100 : null,
    });
  } catch (error) {
    console.error('Error fetching budget:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create or update budget
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, month, year } = await request.json();

    if (!amount || !month || !year) {
      return NextResponse.json(
        { error: 'Amount, month, and year are required' },
        { status: 400 }
      );
    }

    const budgetsCollection = await getBudgetsCollection();
    
    const result = await budgetsCollection.updateOne(
      {
        userId: session.user.id,
        month: parseInt(month),
        year: parseInt(year),
      },
      {
        $set: {
          userId: session.user.id,
          amount: parseFloat(amount),
          month: parseInt(month),
          year: parseInt(year),
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    const budget = await budgetsCollection.findOne({
      userId: session.user.id,
      month: parseInt(month),
      year: parseInt(year),
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

