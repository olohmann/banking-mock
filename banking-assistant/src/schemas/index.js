import { z } from 'zod';

/**
 * User ID validation schema
 */
export const userIdSchema = z
  .string()
  .regex(/^[A-Z0-9]{8,16}$/, 'User ID must be 8-16 alphanumeric characters');

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

/**
 * Account type enum schema
 */
export const accountTypeSchema = z.enum(['checking', 'savings', 'credit', 'loan']);

/**
 * Account status enum schema
 */
export const accountStatusSchema = z.enum(['active', 'inactive', 'suspended', 'closed']);

/**
 * Banking account schema
 */
export const bankingAccountSchema = z.object({
  accountId: accountIdSchema,
  userId: userIdSchema,
  accountType: accountTypeSchema,
  status: accountStatusSchema,
  balance: z.number(),
  currency: z.string().length(3),
  accountName: z.string(),
  createdAt: z.string().datetime(),
  lastActivity: z.string().datetime(),
});

/**
 * Query parameters schema for listing accounts
 */
export const listAccountsQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 50, 'Limit must be between 1 and 50'),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .refine((val) => val >= 0, 'Offset must be non-negative'),
  status: z
    .string()
    .optional()
    .refine(
      (val) => !val || ['active', 'inactive', 'suspended', 'closed'].includes(val),
      'Invalid status',
    ),
  accountType: z
    .string()
    .optional()
    .refine(
      (val) => !val || ['checking', 'savings', 'credit', 'loan'].includes(val),
      'Invalid account type',
    ),
});

/**
 * Paginated accounts response schema
 */
export const paginatedAccountsResponseSchema = z.object({
  data: z.array(bankingAccountSchema),
  pagination: z.object({
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
  }),
});
