import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/index.js';
import {
  userIdSchema,
  accountIdSchema,
  transactionQuerySchema,
  listAccountsQuerySchema,
} from '../schemas/index.js';
import {
  getAccountBalance,
  getAccountTransactions,
  accountExists,
  getBankingAccountsByUserId,
  getBankingAccountById,
} from '../services/mockData.js';

const router = Router();

/**
 * Get account balance
 * @route GET /api/v1/accounts/:accountId/balance
 * @param {string} accountId - Account identifier
 * @returns {Object} Account balance information
 */
router.get(
  '/accounts/:accountId/balance',
  validateRequest({
    params: z.object({ accountId: accountIdSchema }),
  }),
  (req, res) => {
    const { accountId } = req.params;
    
    const balance = getAccountBalance(accountId);
    
    if (!balance) {
      return res.status(404).json({
        error: 'Account not found',
        accountId,
      });
    }
    
    return res.json(balance);
  },
);

/**
 * Get account transactions
 * @route GET /api/v1/accounts/:accountId/transactions
 * @param {string} accountId - Account identifier
 * @query {number} [limit=10] - Number of transactions to return (1-100)
 * @query {number} [offset=0] - Number of transactions to skip
 * @returns {Object} Account transactions with pagination
 */
router.get(
  '/accounts/:accountId/transactions',
  validateRequest({
    params: z.object({ accountId: accountIdSchema }),
    query: transactionQuerySchema,
  }),
  (req, res) => {
    const { accountId } = req.params;
    const { limit, offset } = req.query;
    
    if (!accountExists(accountId)) {
      return res.status(404).json({
        error: 'Account not found',
        accountId,
      });
    }
    
    const transactions = getAccountTransactions(accountId, limit, offset);
    
    return res.json(transactions);
  },
);

/**
 * Get banking accounts for a specific user
 * @route GET /api/v1/users/:userId/accounts
 * @param {string} userId - User identifier
 * @query {number} [limit=10] - Number of accounts to return (1-50)
 * @query {number} [offset=0] - Number of accounts to skip
 * @query {string} [status] - Filter by account status
 * @query {string} [accountType] - Filter by account type
 * @returns {Object} Paginated list of banking accounts
 */
router.get(
  '/users/:userId/accounts',
  validateRequest({
    params: z.object({ userId: userIdSchema }),
    query: listAccountsQuerySchema,
  }),
  (req, res) => {
    const { userId } = req.params;
    const {
      limit,
      offset,
      status,
      accountType,
    } = req.query;

    try {
      const result = getBankingAccountsByUserId(userId, {
        limit,
        offset,
        status,
        accountType,
      });

      return res.json(result);
    } catch (error) {
      console.error('Error fetching banking accounts:', error);
      return res.status(500).json({
        error: 'Failed to fetch banking accounts',
      });
    }
  },
);

/**
 * Get a specific banking account by ID
 * @route GET /api/v1/accounts/:accountId
 * @param {string} accountId - Banking account identifier
 * @returns {Object} Banking account details
 */
router.get(
  '/accounts/:accountId',
  validateRequest({
    params: z.object({ accountId: accountIdSchema }),
  }),
  (req, res) => {
    const { accountId } = req.params;

    try {
      const account = getBankingAccountById(accountId);

      if (!account) {
        return res.status(404).json({
          error: 'Banking account not found',
          accountId,
        });
      }

      return res.json(account);
    } catch (error) {
      console.error('Error fetching banking account:', error);
      return res.status(500).json({
        error: 'Failed to fetch banking account',
      });
    }
  },
);

/**
 * Health check endpoint
 * @route GET /api/v1/health
 * @returns {Object} Service health status
 */
router.get('/health', (req, res) => {
  res.json({
    service: 'banking-assistant-mock',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;
