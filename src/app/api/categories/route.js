import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCategoriesCollection } from '@/lib/db';

// GET - Get all categories (including custom ones)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categoriesCollection = await getCategoriesCollection();
    
    // Get default categories
    const defaultCategories = [
      'Food',
      'Travel',
      'Rent',
      'Office',
      'Entertainment',
      'Healthcare',
      'Shopping',
      'Utilities',
    ];

    // Get custom categories for this user
    const customCategories = await categoriesCollection
      .find({ userId: session.user.id })
      .toArray();

    const allCategories = [
      ...defaultCategories,
      ...customCategories.map(cat => cat.name),
      'Other',
    ];

    return NextResponse.json({ categories: allCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add custom category
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const categoryName = name.trim();

    // Check if category already exists
    const categoriesCollection = await getCategoriesCollection();
    const existing = await categoriesCollection.findOne({
      userId: session.user.id,
      name: categoryName,
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 400 }
      );
    }

    // Create custom category
    const result = await categoriesCollection.insertOne({
      userId: session.user.id,
      name: categoryName,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Category added successfully', category: { _id: result.insertedId, name: categoryName } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

