// Currency utility
export const formatCurrency = (amount, currency = 'INR') => {
  if (currency === 'INR') {
    return `₹${amount.toFixed(2)}`;
  }
  return `$${amount.toFixed(2)}`;
};

export const getCurrencySymbol = (currency = 'INR') => {
  if (currency === 'INR') {
    return '₹';
  }
  return '$';
};

