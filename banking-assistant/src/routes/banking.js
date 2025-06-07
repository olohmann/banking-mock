import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/index.js';
import { accountIdSchema, transactionQuerySchema } from '../schemas/index.js';
import { getAccountBalance, getAccountTransactions, accountExists } from '../services/mockData.js';

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
 * Health check endpoint
 * @route GET /api/v1/health
 * @returns {Object} Service health status
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;
