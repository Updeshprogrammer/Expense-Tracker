import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getExpensesCollection, getBudgetsCollection } from '@/lib/db';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || new Date().getMonth() + 1;
    const year = searchParams.get('year') || new Date().getFullYear();

    const expensesCollection = await getExpensesCollection();
    const budgetsCollection = await getBudgetsCollection();

    // Get current month expenses
    const currentStart = new Date(year, parseInt(month) - 1, 1);
    const currentEnd = new Date(year, parseInt(month), 0, 23, 59, 59);
    const currentExpenses = await expensesCollection
      .find({
        userId: session.user.id,
        date: { $gte: currentStart, $lte: currentEnd },
      })
      .toArray();

    // Get previous month expenses for comparison
    const prevMonth = parseInt(month) === 1 ? 12 : parseInt(month) - 1;
    const prevYear = parseInt(month) === 1 ? parseInt(year) - 1 : year;
    const prevStart = new Date(prevYear, prevMonth - 1, 1);
    const prevEnd = new Date(prevYear, prevMonth, 0, 23, 59, 59);
    const prevExpenses = await expensesCollection
      .find({
        userId: session.user.id,
        date: { $gte: prevStart, $lte: prevEnd },
      })
      .toArray();

    // Get last 3 months for trend analysis
    const threeMonthsAgo = new Date(year, parseInt(month) - 3, 1);
    const recentExpenses = await expensesCollection
      .find({
        userId: session.user.id,
        date: { $gte: threeMonthsAgo, $lte: currentEnd },
      })
      .toArray();

    // Get budget
    const budget = await budgetsCollection.findOne({
      userId: session.user.id,
      month: parseInt(month),
      year: parseInt(year),
    });

    // Analyze spending patterns
    const insights = analyzeSpendingPatterns(
      currentExpenses,
      prevExpenses,
      recentExpenses,
      budget
    );

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function analyzeSpendingPatterns(currentExpenses, prevExpenses, recentExpenses, budget) {
  const suggestions = [];
  const insights = [];
  const warnings = [];

  // Calculate totals
  const currentTotal = currentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const prevTotal = prevExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const avgRecent = recentExpenses.length > 0
    ? recentExpenses.reduce((sum, exp) => sum + exp.amount, 0) / 3
    : 0;

  // Budget analysis
  if (budget) {
    const budgetPercentage = (currentTotal / budget.amount) * 100;
    const daysInMonth = new Date(budget.year, budget.month, 0).getDate();
    const currentDay = new Date().getDate();
    const expectedSpending = (budget.amount / daysInMonth) * currentDay;

    if (budgetPercentage > 100) {
      warnings.push({
        type: 'budget_exceeded',
        title: 'Budget Exceeded',
        message: `You've exceeded your budget by ${formatCurrency(currentTotal - budget.amount)}.`,
        severity: 'high',
        action: 'Review your expenses and consider adjusting your spending habits.',
      });
    } else if (budgetPercentage > 90) {
      warnings.push({
        type: 'budget_warning',
        title: 'Approaching Budget Limit',
        message: `You've used ${budgetPercentage.toFixed(1)}% of your budget.`,
        severity: 'medium',
        action: 'Monitor your spending closely for the rest of the month.',
      });
    }

    if (currentTotal > expectedSpending * 1.2) {
      suggestions.push({
        type: 'spending_pace',
        title: 'Spending Too Fast',
        message: `You're spending ${((currentTotal / expectedSpending - 1) * 100).toFixed(0)}% faster than your budget allows.`,
        suggestion: 'Consider reducing non-essential expenses to stay on track.',
        priority: 'high',
      });
    }
  }

  // Month-over-month comparison
  if (prevTotal > 0) {
    const changePercent = ((currentTotal - prevTotal) / prevTotal) * 100;
    if (changePercent > 20) {
      warnings.push({
        type: 'spending_increase',
        title: 'Significant Spending Increase',
        message: `Your spending increased by ${changePercent.toFixed(1)}% compared to last month.`,
        severity: 'medium',
        action: 'Review your expenses to identify the cause of this increase.',
      });
    } else if (changePercent < -15) {
      insights.push({
        type: 'spending_decrease',
        title: 'Great Job!',
        message: `You've reduced your spending by ${Math.abs(changePercent).toFixed(1)}% compared to last month.`,
        icon: '🎉',
      });
    }
  }

  // Category analysis
  const currentCategories = {};
  const prevCategories = {};

  currentExpenses.forEach((exp) => {
    const cat = exp.category || 'Uncategorized';
    currentCategories[cat] = (currentCategories[cat] || 0) + exp.amount;
  });

  prevExpenses.forEach((exp) => {
    const cat = exp.category || 'Uncategorized';
    prevCategories[cat] = (prevCategories[cat] || 0) + exp.amount;
  });

  // Find categories with significant increases
  Object.keys(currentCategories).forEach((category) => {
    const current = currentCategories[category];
    const previous = prevCategories[category] || 0;

    if (previous > 0) {
      const increase = ((current - previous) / previous) * 100;
      if (increase > 30 && current > currentTotal * 0.1) {
        suggestions.push({
          type: 'category_increase',
          title: `${category} Spending Alert`,
          message: `You're spending ${increase.toFixed(0)}% more on ${category} this month.`,
          suggestion: `Consider reviewing ${category.toLowerCase()} expenses and look for ways to reduce costs.`,
          priority: 'medium',
          category,
        });
      }
    } else if (current > currentTotal * 0.15) {
      suggestions.push({
        type: 'new_category',
        title: `New Spending Category: ${category}`,
        message: `${category} represents ${((current / currentTotal) * 100).toFixed(0)}% of your total spending.`,
        suggestion: 'Monitor this category to ensure it aligns with your budget goals.',
        priority: 'low',
        category,
      });
    }
  });

  // Find top spending categories
  const topCategories = Object.entries(currentCategories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  if (topCategories.length > 0) {
    insights.push({
      type: 'top_categories',
      title: 'Top Spending Categories',
      message: `Your top 3 categories are: ${topCategories.map(([cat]) => cat).join(', ')}`,
      data: topCategories.map(([category, amount]) => ({
        category,
        amount,
        percentage: ((amount / currentTotal) * 100).toFixed(1),
      })),
    });
  }

  // Daily spending pattern
  const dailySpending = {};
  currentExpenses.forEach((exp) => {
    const day = new Date(exp.date).getDate();
    dailySpending[day] = (dailySpending[day] || 0) + exp.amount;
  });

  const avgDaily = currentTotal / Object.keys(dailySpending).length || 0;
  const highSpendingDays = Object.entries(dailySpending)
    .filter(([, amount]) => amount > avgDaily * 2)
    .map(([day]) => parseInt(day));

  if (highSpendingDays.length > 0) {
    suggestions.push({
      type: 'spending_pattern',
      title: 'Irregular Spending Pattern',
      message: `You have unusually high spending on specific days (days: ${highSpendingDays.join(', ')}).`,
      suggestion: 'Try to spread out large purchases or review if these expenses were necessary.',
      priority: 'low',
    });
  }

  // Recurring expense detection
  const expenseFrequency = {};
  recentExpenses.forEach((exp) => {
    const key = `${exp.title?.toLowerCase()}-${exp.category}`;
    expenseFrequency[key] = (expenseFrequency[key] || 0) + 1;
  });

  const recurring = Object.entries(expenseFrequency)
    .filter(([, count]) => count >= 3)
    .map(([key]) => key);

  if (recurring.length > 0) {
    insights.push({
      type: 'recurring_expenses',
      title: 'Recurring Expenses Detected',
      message: `You have ${recurring.length} recurring expense pattern(s). Consider setting up automatic tracking.`,
      icon: '🔄',
    });
  }

  // Savings opportunity
  if (budget && currentTotal < budget.amount * 0.7) {
    const potentialSavings = budget.amount - currentTotal;
    insights.push({
      type: 'savings_opportunity',
      title: 'Savings Opportunity',
      message: `You're ${((potentialSavings / budget.amount) * 100).toFixed(0)}% under budget.`,
      suggestion: `You could save up to ${formatCurrency(potentialSavings)} this month if you maintain this pace.`,
      icon: '💰',
    });
  }

  // Average spending trend
  if (avgRecent > 0 && currentTotal > avgRecent * 1.15) {
    suggestions.push({
      type: 'trend_analysis',
      title: 'Above Average Spending',
      message: `Your current spending is ${((currentTotal / avgRecent - 1) * 100).toFixed(0)}% above your 3-month average.`,
      suggestion: 'Review your expenses to identify areas where you can cut back.',
      priority: 'medium',
    });
  }

  return {
    suggestions: suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }),
    insights,
    warnings,
    summary: {
      currentTotal,
      prevTotal,
      changePercent: prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0,
      budgetStatus: budget ? (currentTotal / budget.amount) * 100 : null,
    },
  };
}

function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

