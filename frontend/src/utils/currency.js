/**
 * Currency utilities and constants
 */

// Currency data - Comprehensive list of world currencies
export const CURRENCIES = [
  // Major currencies (most used)
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  
  // Asia Pacific
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar' },
  { code: 'NPR', symbol: 'Rs', name: 'Nepalese Rupee' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee' },
  { code: 'AFN', symbol: '؋', name: 'Afghan Afghani' },
  { code: 'MMK', symbol: 'K', name: 'Myanmar Kyat' },
  { code: 'KHR', symbol: '៛', name: 'Cambodian Riel' },
  { code: 'LAK', symbol: '₭', name: 'Lao Kip' },
  { code: 'BND', symbol: 'B$', name: 'Brunei Dollar' },
  { code: 'MOP', symbol: 'MOP$', name: 'Macanese Pataca' },
  
  // Middle East
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'QAR', symbol: '﷼', name: 'Qatari Riyal' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
  { code: 'BHD', symbol: 'د.ب', name: 'Bahraini Dinar' },
  { code: 'OMR', symbol: '﷼', name: 'Omani Rial' },
  { code: 'JOD', symbol: 'د.ا', name: 'Jordanian Dinar' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
  { code: 'IQD', symbol: 'ع.د', name: 'Iraqi Dinar' },
  { code: 'IRR', symbol: '﷼', name: 'Iranian Rial' },
  { code: 'LBP', symbol: '£', name: 'Lebanese Pound' },
  { code: 'SYP', symbol: '£', name: 'Syrian Pound' },
  { code: 'YER', symbol: '﷼', name: 'Yemeni Rial' },
  
  // Europe
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'ISK', symbol: 'kr', name: 'Icelandic Króna' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev' },
  { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna' },
  { code: 'RSD', symbol: 'дин', name: 'Serbian Dinar' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'BAM', symbol: 'KM', name: 'Bosnia-Herzegovina Mark' },
  { code: 'MKD', symbol: 'ден', name: 'Macedonian Denar' },
  { code: 'ALL', symbol: 'L', name: 'Albanian Lek' },
  { code: 'MDL', symbol: 'L', name: 'Moldovan Leu' },
  { code: 'GEL', symbol: '₾', name: 'Georgian Lari' },
  { code: 'AMD', symbol: '֏', name: 'Armenian Dram' },
  { code: 'AZN', symbol: '₼', name: 'Azerbaijani Manat' },
  { code: 'BYN', symbol: 'Br', name: 'Belarusian Ruble' },
  
  // Americas
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'ARS', symbol: 'AR$', name: 'Argentine Peso' },
  { code: 'CLP', symbol: 'CL$', name: 'Chilean Peso' },
  { code: 'COP', symbol: 'COL$', name: 'Colombian Peso' },
  { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol' },
  { code: 'VES', symbol: 'Bs.', name: 'Venezuelan Bolívar' },
  { code: 'UYU', symbol: '$U', name: 'Uruguayan Peso' },
  { code: 'PYG', symbol: '₲', name: 'Paraguayan Guarani' },
  { code: 'BOB', symbol: 'Bs.', name: 'Bolivian Boliviano' },
  { code: 'CRC', symbol: '₡', name: 'Costa Rican Colón' },
  { code: 'GTQ', symbol: 'Q', name: 'Guatemalan Quetzal' },
  { code: 'HNL', symbol: 'L', name: 'Honduran Lempira' },
  { code: 'NIO', symbol: 'C$', name: 'Nicaraguan Córdoba' },
  { code: 'PAB', symbol: 'B/.', name: 'Panamanian Balboa' },
  { code: 'DOP', symbol: 'RD$', name: 'Dominican Peso' },
  { code: 'CUP', symbol: '$', name: 'Cuban Peso' },
  { code: 'JMD', symbol: 'J$', name: 'Jamaican Dollar' },
  { code: 'TTD', symbol: 'TT$', name: 'Trinidad & Tobago Dollar' },
  { code: 'BBD', symbol: 'Bds$', name: 'Barbadian Dollar' },
  { code: 'BSD', symbol: 'B$', name: 'Bahamian Dollar' },
  { code: 'BZD', symbol: 'BZ$', name: 'Belize Dollar' },
  { code: 'HTG', symbol: 'G', name: 'Haitian Gourde' },
  
  // Africa
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'EGP', symbol: '£', name: 'Egyptian Pound' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham' },
  { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr' },
  { code: 'XOF', symbol: 'CFA', name: 'West African CFA Franc' },
  { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc' },
  { code: 'AOA', symbol: 'Kz', name: 'Angolan Kwanza' },
  { code: 'MZN', symbol: 'MT', name: 'Mozambican Metical' },
  { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha' },
  { code: 'BWP', symbol: 'P', name: 'Botswanan Pula' },
  { code: 'MUR', symbol: '₨', name: 'Mauritian Rupee' },
  { code: 'TND', symbol: 'د.ت', name: 'Tunisian Dinar' },
  { code: 'DZD', symbol: 'د.ج', name: 'Algerian Dinar' },
  { code: 'LYD', symbol: 'ل.د', name: 'Libyan Dinar' },
  { code: 'SDG', symbol: 'ج.س.', name: 'Sudanese Pound' },
  { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc' },
  { code: 'MWK', symbol: 'MK', name: 'Malawian Kwacha' },
  { code: 'SOS', symbol: 'Sh', name: 'Somali Shilling' },
  { code: 'SCR', symbol: '₨', name: 'Seychellois Rupee' },
  { code: 'MGA', symbol: 'Ar', name: 'Malagasy Ariary' },
  
  // Oceania
  { code: 'FJD', symbol: 'FJ$', name: 'Fijian Dollar' },
  { code: 'PGK', symbol: 'K', name: 'Papua New Guinean Kina' },
  { code: 'WST', symbol: 'WS$', name: 'Samoan Tala' },
  { code: 'TOP', symbol: 'T$', name: 'Tongan Paʻanga' },
  { code: 'VUV', symbol: 'Vt', name: 'Vanuatu Vatu' },
  { code: 'SBD', symbol: 'SI$', name: 'Solomon Islands Dollar' },
  
  // Central Asia
  { code: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge' },
  { code: 'UZS', symbol: 'so\'m', name: 'Uzbekistani Som' },
  { code: 'TJS', symbol: 'ЅМ', name: 'Tajikistani Somoni' },
  { code: 'KGS', symbol: 'с', name: 'Kyrgyzstani Som' },
  { code: 'TMT', symbol: 'm', name: 'Turkmenistani Manat' },
  { code: 'MNT', symbol: '₮', name: 'Mongolian Tugrik' },
  
  // Other
  { code: 'BTC', symbol: '₿', name: 'Bitcoin' },
  { code: 'XAU', symbol: 'Au', name: 'Gold (troy ounce)' },
  { code: 'XAG', symbol: 'Ag', name: 'Silver (troy ounce)' }
];

// Format currency function
export const formatCurrency = (amount, currency) => {
  // Ensure amount is a number
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  
  const currencyObj = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  // Currencies that don't use decimal places
  const noDecimalCurrencies = [
    'JPY', 'KRW', 'VND', 'IDR', 'CLP', 'PYG', 'UGX', 'KHR', 
    'XOF', 'XAF', 'RWF', 'MGA', 'VUV', 'GNF', 'ISK', 'BIF'
  ];

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
