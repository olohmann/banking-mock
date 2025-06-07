/**
 * Mock brokerage data service
 */

// In-memory storage for demo purposes
const brokerageAccounts = new Map();

// Mock data for demonstration
const sampleAccounts = [
  {
    accountId: 'BRK1A2B3C4D5',
    userId: 'USER1234',
    accountType: 'individual',
    status: 'active',
    balance: 25750.5,
    availableBalance: 23750.5,
    currency: 'USD',
    tradingPermissions: ['stocks', 'options'],
    riskTolerance: 'moderate',
    createdAt: '2024-01-15T10:30:00.000Z',
    lastActivity: '2025-06-06T14:22:00.000Z',
  },
  {
    accountId: 'BRK2X3Y4Z5A6',
    userId: 'USER1234',
    accountType: 'ira',
    status: 'active',
    balance: 45250.75,
    availableBalance: 45250.75,
    currency: 'USD',
    tradingPermissions: ['stocks'],
    riskTolerance: 'conservative',
    createdAt: '2024-03-20T09:15:00.000Z',
    lastActivity: '2025-06-05T11:45:00.000Z',
  },
  {
    accountId: 'BRK3M4N5O6P7',
    userId: 'USER5678',
    accountType: 'individual',
    status: 'active',
    balance: 8975.25,
    availableBalance: 7450.25,
    currency: 'USD',
    tradingPermissions: ['stocks', 'crypto'],
    riskTolerance: 'aggressive',
    createdAt: '2024-05-10T16:45:00.000Z',
    lastActivity: '2025-06-07T09:12:00.000Z',
  },
];

// Initialize mock data
sampleAccounts.forEach((account) => {
  brokerageAccounts.set(account.accountId, account);
});

/**
 * Generate a unique brokerage account ID
 * @returns {string} Generated account ID
 */
const generateAccountId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'BRK';
  for (let i = 0; i < 9; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Create a new brokerage account
 * @param {Object} accountData - Account creation data
 * @returns {Object} Created brokerage account
 */
export const createBrokerageAccount = (accountData) => {
  const accountId = generateAccountId();
  const now = new Date().toISOString();

  const newAccount = {
    accountId,
    userId: accountData.userId,
    accountType: accountData.accountType,
    status: 'pending', // New accounts start as pending
    balance: accountData.initialDeposit || 0,
    availableBalance: accountData.initialDeposit || 0,
    currency: 'USD',
    tradingPermissions: accountData.tradingPermissions || ['stocks'],
    riskTolerance: accountData.riskTolerance || 'moderate',
    createdAt: now,
    lastActivity: now,
  };

  brokerageAccounts.set(accountId, newAccount);
  return newAccount;
};

/**
 * Get brokerage accounts for a specific user
 * @param {string} userId - User identifier
 * @param {Object} options - Query options
 * @param {number} [options.limit=10] - Maximum number of accounts to return
 * @param {number} [options.offset=0] - Number of accounts to skip
 * @param {string} [options.status] - Filter by account status
 * @param {string} [options.accountType] - Filter by account type
 * @returns {Object} Paginated list of brokerage accounts
 */
export const getBrokerageAccountsByUserId = (userId, options = {}) => {
  const { limit = 10, offset = 0, status, accountType } = options;

  // Filter accounts by user ID
  const userAccounts = Array.from(brokerageAccounts.values()).filter(
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
 * Get a specific brokerage account by ID
 * @param {string} accountId - Account identifier
 * @returns {Object|null} Brokerage account or null if not found
 */
export const getBrokerageAccountById = (accountId) => brokerageAccounts.get(accountId) || null;

/**
 * Check if a brokerage account exists
 * @param {string} accountId - Account identifier
 * @returns {boolean} True if account exists
 */
export const brokerageAccountExists = (accountId) => brokerageAccounts.has(accountId);

/**
 * Check if a user exists (simplified check based on existing accounts)
 * @param {string} userId - User identifier
 * @returns {boolean} True if user has at least one account
 */
export const userExists = (userId) =>
  Array.from(brokerageAccounts.values()).some((account) => account.userId === userId);

/**
 * Get all unique user IDs (for testing purposes)
 * @returns {Array<string>} Array of user IDs
 */
export const getAllUserIds = () => {
  const userIds = new Set();
  brokerageAccounts.forEach((account) => {
    userIds.add(account.userId);
  });
  return Array.from(userIds);
};
