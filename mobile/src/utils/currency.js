/**
 * Currency utilities - Reused from web app
 */

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs' },
];

export const formatCurrency = (amount, currencyCode) => {
  // Ensure amount is a number
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  
  const currencyObj = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

  // Currencies that don't use decimal places
  const noDecimalCurrencies = ['JPY', 'KRW', 'VND', 'IDR'];

  if (noDecimalCurrencies.includes(currencyCode)) {
    return `${currencyObj.symbol}${Math.round(numAmount)}`;
  }

  // Special formatting for some currencies
  if (currencyCode === 'NPR' || currencyCode === 'INR' || currencyCode === 'LKR' || currencyCode === 'PKR') {
    // For rupee-based currencies, format with 2 decimal places
    return `${currencyObj.symbol} ${numAmount.toFixed(2)}`;
  }

  return `${currencyObj.symbol}${numAmount.toFixed(2)}`;
};

export const getCurrencySymbol = (currencyCode) => {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  return currency ? currency.symbol : '$';
};
