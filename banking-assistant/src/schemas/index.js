import { z } from 'zod';

/**
 * Account ID validation schema
 */
export const accountIdSchema = z
  .string()
  .regex(/^[A-Z0-9]{10,20}$/, 'Account ID must be 10-20 alphanumeric characters');

/**
 * Query parameters schema for transactions
 */
export const transactionQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .refine((val) => val >= 0, 'Offset must be non-negative'),
});

/**
 * Account balance response schema
 */
export const accountBalanceSchema = z.object({
  accountId: z.string(),
  balance: z.number(),
  currency: z.string().length(3),
  lastUpdated: z.string().datetime(),
});

/**
 * Transaction schema
 */
export const transactionSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  amount: z.number(),
  currency: z.string().length(3),
  description: z.string(),
  type: z.enum(['debit', 'credit']),
  date: z.string().datetime(),
  balance: z.number(),
});

/**
 * Transactions response schema
 */
export const transactionsResponseSchema = z.object({
  accountId: z.string(),
  transactions: z.array(transactionSchema),
  pagination: z.object({
    limit: z.number(),
    offset: z.number(),
    total: z.number(),
  }),
});
