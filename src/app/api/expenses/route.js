import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getExpensesCollection } from '@/lib/db';

// GET - Fetch expenses with filters
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const expensesCollection = await getExpensesCollection();
    let query = { userId: session.user.id };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (month && year) {
      const start = new Date(year, parseInt(month) - 1, 1);
      const end = new Date(year, parseInt(month), 0, 23, 59, 59);
      query.date = { $gte: start, $lte: end };
    }

    const expenses = await expensesCollection
      .find(query)
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new expense
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, amount, category, date, receipt } = body;

    if (!title || !amount || !category || !date) {
      return NextResponse.json(
        { error: 'Title, amount, category, and date are required' },
        { status: 400 }
      );
    }

    const expensesCollection = await getExpensesCollection();
    const expense = {
      userId: session.user.id,
      title,
      description: description || '',
      amount: parseFloat(amount),
      category,
      date: new Date(date),
      receipt: receipt || null,
      createdAt: new Date(),
    };

    const result = await expensesCollection.insertOne(expense);
    expense._id = result.insertedId;

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

