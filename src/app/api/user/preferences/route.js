import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUsersCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';

// GET - Get user preferences
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usersCollection = await getUsersCollection();
    let user;
    
    try {
      user = await usersCollection.findOne(
        { _id: new ObjectId(session.user.id) },
        { projection: { currency: 1 } }
      );
    } catch (idError) {
      // If ObjectId conversion fails, try with string
      user = await usersCollection.findOne(
        { _id: session.user.id },
        { projection: { currency: 1 } }
      );
    }

    // If user doesn't have currency set, set default to INR
    if (user && !user.currency) {
      await usersCollection.updateOne(
        { _id: new ObjectId(session.user.id) },
        { $set: { currency: 'INR' } }
      );
      return NextResponse.json({ currency: 'INR' });
    }

    return NextResponse.json({
      currency: user?.currency || 'INR',
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update user preferences
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currency } = await request.json();

    if (!currency || !['USD', 'INR'].includes(currency)) {
      return NextResponse.json(
        { error: 'Invalid currency. Must be USD or INR' },
        { status: 400 }
      );
    }

    const usersCollection = await getUsersCollection();
    
    try {
      await usersCollection.updateOne(
        { _id: new ObjectId(session.user.id) },
        { $set: { currency } }
      );
    } catch (idError) {
      // If ObjectId conversion fails, try with string
      await usersCollection.updateOne(
        { _id: session.user.id },
        { $set: { currency } }
      );
    }

    return NextResponse.json({ message: 'Preferences updated successfully', currency });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

