import clientPromise from './mongodb';

export async function getDb() {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || 'expense-management');
}

export async function getUsersCollection() {
  const db = await getDb();
  return db.collection('users');
}

export async function getExpensesCollection() {
  const db = await getDb();
  return db.collection('expenses');
}

export async function getBudgetsCollection() {
  const db = await getDb();
  return db.collection('budgets');
}

export async function getCategoriesCollection() {
  const db = await getDb();
  return db.collection('categories');
}

