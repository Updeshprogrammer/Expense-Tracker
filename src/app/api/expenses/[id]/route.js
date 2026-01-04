// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import { getExpensesCollection } from '@/lib/db';
// import { ObjectId } from 'mongodb';

// // GET - Get single expense
// export async function GET(request, { params }) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const expensesCollection = await getExpensesCollection();
//     const expense = await expensesCollection.findOne({
//       _id: new ObjectId(params.id),
//       userId: session.user.id,
//     });

//     if (!expense) {
//       return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
//     }

//     return NextResponse.json(expense);
//   } catch (error) {
//     console.error('Error fetching expense:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// // PUT - Update expense
// export async function PUT(request, { params }) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const body = await request.json();
//     const { title, description, amount, category, date, receipt } = body;

//     const expensesCollection = await getExpensesCollection();
//     const updateData = {};

//     if (title) updateData.title = title;
//     if (description !== undefined) updateData.description = description;
//     if (amount) updateData.amount = parseFloat(amount);
//     if (category) updateData.category = category;
//     if (date) updateData.date = new Date(date);
//     if (receipt !== undefined) updateData.receipt = receipt;

//     updateData.updatedAt = new Date();

//     const result = await expensesCollection.updateOne(
//       { _id: new ObjectId(params.id), userId: session.user.id },
//       { $set: updateData }
//     );

//     if (result.matchedCount === 0) {
//       return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
//     }

//     const updatedExpense = await expensesCollection.findOne({
//       _id: new ObjectId(params.id),
//     });

//     return NextResponse.json(updatedExpense);
//   } catch (error) {
//     console.error('Error updating expense:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// // DELETE - Delete expense
// export async function DELETE(request, { params }) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const expensesCollection = await getExpensesCollection();
//     const result = await expensesCollection.deleteOne({
//       _id: new ObjectId(params.id),
//       userId: session.user.id,
//     });

//     if (result.deletedCount === 0) {
//       return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
//     }

//     return NextResponse.json({ message: 'Expense deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting expense:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getExpensesCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';

// GET - Get single expense
export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ FIX: await params
    const { id } = await context.params;

    const expensesCollection = await getExpensesCollection();
    const expense = await expensesCollection.findOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update expense
export async function PUT(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ FIX: await params
    const { id } = await context.params;

    const body = await request.json();
    const { title, description, amount, category, date, receipt } = body;

    const expensesCollection = await getExpensesCollection();
    const updateData = {};

    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (category) updateData.category = category;
    if (date) updateData.date = new Date(date);
    if (receipt !== undefined) updateData.receipt = receipt;

    updateData.updatedAt = new Date();

    const result = await expensesCollection.updateOne(
      { _id: new ObjectId(id), userId: session.user.id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    const updatedExpense = await expensesCollection.findOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete expense
export async function DELETE(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ FIX: await params
    const { id } = await context.params;

    const expensesCollection = await getExpensesCollection();
    const result = await expensesCollection.deleteOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
