/**
 * Mock banking data service
 */

/**
 * Mock account balances
 */
const MOCK_BALANCES = {
  ACC1234567890: { balance: 15420.50, currency: 'USD' },
  ACC9876543210: { balance: 8750.25, currency: 'EUR' },
  ACC5555666677: { balance: 125000.00, currency: 'USD' },
  ACC1111222233: { balance: 2500.75, currency: 'GBP' },
};

/**
 * Mock transaction templates
 */
const TRANSACTION_TEMPLATES = [
  { description: 'Coffee Shop Purchase', amount: -4.50, type: 'debit' },
  { description: 'Grocery Store', amount: -67.23, type: 'debit' },
  { description: 'Gas Station', amount: -45.00, type: 'debit' },
  { description: 'Salary Deposit', amount: 3500.00, type: 'credit' },
  { description: 'ATM Withdrawal', amount: -100.00, type: 'debit' },
  { description: 'Online Transfer', amount: -250.00, type: 'debit' },
  { description: 'Interest Payment', amount: 12.50, type: 'credit' },
  { description: 'Restaurant Bill', amount: -89.75, type: 'debit' },
  { description: 'Refund', amount: 25.00, type: 'credit' },
  { description: 'Subscription Fee', amount: -9.99, type: 'debit' },
];

/**
 * Get account balance for a given account ID
 * @param {string} accountId - The account identifier
 * @returns {Object|null} Account balance object or null if not found
 */
export const getAccountBalance = (accountId) => {
  const mockBalance = MOCK_BALANCES[accountId];
  
  if (!mockBalance) {
    return null;
  }

  return {
    accountId,
    balance: mockBalance.balance,
    currency: mockBalance.currency,
    lastUpdated: new Date().toISOString(),
  };
};

/**
 * Generate mock transactions for an account
 * @param {string} accountId - The account identifier
 * @param {number} limit - Number of transactions to return
 * @param {number} offset - Number of transactions to skip
 * @returns {Object} Transactions response object
 */
export const getAccountTransactions = (accountId, limit = 10, offset = 0) => {
  const balance = MOCK_BALANCES[accountId];
  
  if (!balance) {
    return null;
  }

  // Generate deterministic transactions based on account ID
  const seed = accountId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const totalTransactions = 50; // Mock total count
  
  const transactions = [];
  let currentBalance = balance.balance;

  for (let i = offset; i < Math.min(offset + limit, totalTransactions); i += 1) {
    const templateIndex = (seed + i) % TRANSACTION_TEMPLATES.length;
    const template = TRANSACTION_TEMPLATES[templateIndex];
    
    // Add some randomness to amounts
    const variance = (((seed + i) % 100) - 50) / 100; // -0.5 to 0.5
    const amount = Math.round((template.amount * (1 + variance * 0.1)) * 100) / 100;
    
    // Generate date (more recent = lower index)
    const daysAgo = i + 1;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    currentBalance -= amount; // Reverse calculation for historical balance
    
    transactions.push({
      id: `TXN${accountId.slice(-4)}${String(i + 1).padStart(4, '0')}`,
      accountId,
      amount,
      currency: balance.currency,
      description: template.description,
      type: template.type,
      date: date.toISOString(),
      balance: Math.round(currentBalance * 100) / 100,
    });
  }

  return {
    accountId,
    transactions,
    pagination: {
      limit,
      offset,
      total: totalTransactions,
    },
  };
};

/**
 * Check if account exists
 * @param {string} accountId - The account identifier
 * @returns {boolean} True if account exists
 */
export const accountExists = (accountId) => Boolean(MOCK_BALANCES[accountId]);
