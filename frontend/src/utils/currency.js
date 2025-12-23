/**
 * Currency utilities and constants
 */

// Currency data
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'NPR', symbol: 'Rs', name: 'Nepalese Rupee' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee' },
  { code: 'AFN', symbol: '؋', name: 'Afghan Afghani' }
];

// Format currency function
export const formatCurrency = (amount, currency) => {
  // Ensure amount is a number
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  
  const currencyObj = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  // Currencies that don't use decimal places
  const noDecimalCurrencies = ['JPY', 'KRW', 'VND', 'IDR'];

  if (noDecimalCurrencies.includes(currency)) {
    return `${currencyObj.symbol}${Math.round(numAmount)}`;
  }

  // Special formatting for some currencies
  if (currency === 'NPR' || currency === 'INR' || currency === 'LKR' || currency === 'PKR') {
    // For rupee-based currencies, format with 2 decimal places
    return `${currencyObj.symbol} ${numAmount.toFixed(2)}`;
  }

  return `${currencyObj.symbol}${numAmount.toFixed(2)}`;
};
