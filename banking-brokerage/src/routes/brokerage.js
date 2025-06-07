import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/index.js';
import {
  userIdSchema,
  brokerageAccountIdSchema,
  createBrokerageAccountSchema,
  listAccountsQuerySchema,
} from '../schemas/index.js';
import {
  createBrokerageAccount,
  getBrokerageAccountsByUserId,
  getBrokerageAccountById,
} from '../services/mockData.js';

const router = Router();

/**
 * Create a new brokerage account
 * @route POST /api/v1/brokerage/accounts
 * @body {Object} account - Account creation data
 * @returns {Object} Created brokerage account
 */
router.post(
  '/brokerage/accounts',
  validateRequest({
    body: createBrokerageAccountSchema,
  }),
  (req, res) => {
    try {
      const accountData = req.body;
      const newAccount = createBrokerageAccount(accountData);

      return res.status(201).json(newAccount);
    } catch (error) {
      console.error('Error creating brokerage account:', error);
      return res.status(500).json({
        error: 'Failed to create brokerage account',
      });
    }
  },
);

/**
 * Get brokerage accounts for a specific user
 * @route GET /api/v1/brokerage/users/:userId/accounts
 * @param {string} userId - User identifier
 * @query {number} [limit=10] - Number of accounts to return (1-50)
 * @query {number} [offset=0] - Number of accounts to skip
 * @query {string} [status] - Filter by account status
 * @query {string} [accountType] - Filter by account type
 * @returns {Object} Paginated list of brokerage accounts
 */
router.get(
  '/brokerage/users/:userId/accounts',
  validateRequest({
    params: z.object({ userId: userIdSchema }),
    query: listAccountsQuerySchema,
  }),
  (req, res) => {
    const { userId } = req.params;
    const { limit, offset, status, accountType } = req.query;

    try {
      const result = getBrokerageAccountsByUserId(userId, {
        limit,
        offset,
        status,
        accountType,
      });

      return res.json(result);
    } catch (error) {
      console.error('Error fetching brokerage accounts:', error);
      return res.status(500).json({
        error: 'Failed to fetch brokerage accounts',
      });
    }
  },
);

/**
 * Get a specific brokerage account by ID
 * @route GET /api/v1/brokerage/accounts/:accountId
 * @param {string} accountId - Brokerage account identifier
 * @returns {Object} Brokerage account details
 */
router.get(
  '/brokerage/accounts/:accountId',
  validateRequest({
    params: z.object({ accountId: brokerageAccountIdSchema }),
  }),
  (req, res) => {
    const { accountId } = req.params;

    try {
      const account = getBrokerageAccountById(accountId);

      if (!account) {
        return res.status(404).json({
          error: 'Brokerage account not found',
          accountId,
        });
      }

      return res.json(account);
    } catch (error) {
      console.error('Error fetching brokerage account:', error);
      return res.status(500).json({
        error: 'Failed to fetch brokerage account',
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
    service: 'banking-brokerage-mock',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;
