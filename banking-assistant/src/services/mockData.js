/**
 * Mock banking data service
 */

// In-memory storage for demo purposes
const bankingAccounts = new Map();

/**
 * Mock account data with user associations
 */
const sampleAccounts = [
  {
    accountId: 'ACC1234567890',
    userId: 'USER1234',
    accountType: 'checking',
    status: 'active',
    balance: 15420.50,
    currency: 'USD',
    accountName: 'Primary Checking',
    createdAt: '2024-01-10T08:00:00.000Z',
    lastActivity: '2025-06-07T10:30:00.000Z',
  },
  {
    accountId: 'ACC9876543210',
    userId: 'USER1234',
    accountType: 'savings',
    status: 'active',
    balance: 8750.25,
    currency: 'USD',
    accountName: 'Emergency Savings',
    createdAt: '2024-01-10T08:15:00.000Z',
    lastActivity: '2025-06-05T16:22:00.000Z',
  },
  {
    accountId: 'ACC5555666677',
    userId: 'USER5678',
    accountType: 'checking',
    status: 'active',
    balance: 125000.00,
    currency: 'USD',
    accountName: 'Business Checking',
    createdAt: '2024-02-15T10:30:00.000Z',
    lastActivity: '2025-06-06T14:45:00.000Z',
  },
  {
    accountId: 'ACC1111222233',
    userId: 'USER5678',
    accountType: 'credit',
    status: 'active',
    balance: -2500.75,
    currency: 'USD',
    accountName: 'Platinum Credit Card',
    createdAt: '2024-03-01T12:00:00.000Z',
    lastActivity: '2025-06-07T09:15:00.000Z',
  },
];

// Initialize mock data
sampleAccounts.forEach((account) => {
  bankingAccounts.set(account.accountId, account);
});

/**
 * Legacy mock balances for backward compatibility
 */
const MOCK_BALANCES = {
  ACC1234567890: { balance: 15420.50, currency: 'USD' },
  ACC9876543210: { balance: 8750.25, currency: 'USD' },
  ACC5555666677: { balance: 125000.00, currency: 'USD' },
  ACC1111222233: { balance: -2500.75, currency: 'USD' },
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

/**
 * Get banking accounts for a specific user
 * @param {string} userId - User identifier
 * @param {Object} options - Query options
 * @param {number} [options.limit=10] - Maximum number of accounts to return
 * @param {number} [options.offset=0] - Number of accounts to skip
 * @param {string} [options.status] - Filter by account status
 * @param {string} [options.accountType] - Filter by account type
 * @returns {Object} Paginated list of banking accounts
 */
export const getBankingAccountsByUserId = (userId, options = {}) => {
  const {
    limit = 10,
    offset = 0,
    status,
    accountType,
  } = options;

  // Filter accounts by user ID
  const userAccounts = Array.from(bankingAccounts.values()).filter(
    (account) => account.userId === userId,
  );

  // Apply additional filters
  let filteredAccounts = userAccounts;

  if (status) {
    filteredAccounts = filteredAccounts.filter((account) => account.status === status);
  }

  if (accountType) {
    filteredAccounts = filteredAccounts.filter((account) => account.accountType === accountType);
  }

  // Sort by creation date (newest first)
  filteredAccounts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = filteredAccounts.length;
  const paginatedAccounts = filteredAccounts.slice(offset, offset + limit);

  return {
    data: paginatedAccounts,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  };
};

/**
 * Get a specific banking account by ID
 * @param {string} accountId - Account identifier
 * @returns {Object|null} Banking account or null if not found
 */
export const getBankingAccountById = (accountId) => bankingAccounts.get(accountId) || null;

/**
 * Check if a user exists (simplified check based on existing accounts)
 * @param {string} userId - User identifier
 * @returns {boolean} True if user has at least one account
 */
export const userExists = (userId) => {
  const accounts = Array.from(bankingAccounts.values());
  return accounts.some((account) => account.userId === userId);
};

/**
 * Get all unique user IDs (for testing purposes)
 * @returns {Array<string>} Array of user IDs
 */
export const getAllUserIds = () => {
  const userIds = new Set();
  bankingAccounts.forEach((account) => {
    userIds.add(account.userId);
  });
  return Array.from(userIds);
};
