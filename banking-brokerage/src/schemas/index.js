import { z } from 'zod';

/**
 * User ID validation schema
 */
export const userIdSchema = z
  .string()
  .regex(/^[A-Z0-9]{8,16}$/, 'User ID must be 8-16 alphanumeric characters');

/**
 * Brokerage account ID validation schema
 */
export const brokerageAccountIdSchema = z
  .string()
  .regex(
    /^BRK[A-Z0-9]{8,12}$/,
    'Brokerage account ID must start with BRK followed by 8-12 alphanumeric characters',
  );

/**
 * Account type enum schema
 */
export const accountTypeSchema = z.enum(['individual', 'joint', 'ira', 'roth_ira', 'business']);

/**
 * Create brokerage account request schema
 */
export const createBrokerageAccountSchema = z.object({
  userId: userIdSchema,
  accountType: accountTypeSchema,
  initialDeposit: z
    .number()
    .min(0, 'Initial deposit must be non-negative')
    .max(10000000, 'Initial deposit cannot exceed $10M'),
  tradingPermissions: z.array(z.enum(['stocks', 'options', 'crypto', 'forex'])).default(['stocks']),
  riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']).default('moderate'),
});

/**
 * Brokerage account response schema
 */
export const brokerageAccountSchema = z.object({
  accountId: brokerageAccountIdSchema,
  userId: userIdSchema,
  accountType: accountTypeSchema,
  status: z.enum(['pending', 'active', 'suspended', 'closed']),
  balance: z.number(),
  availableBalance: z.number(),
  currency: z.string().length(3),
  tradingPermissions: z.array(z.string()),
  riskTolerance: z.string(),
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
      (val) => !val || ['pending', 'active', 'suspended', 'closed'].includes(val),
      'Invalid status',
    ),
  accountType: z
    .string()
    .optional()
    .refine(
      (val) => !val || ['individual', 'joint', 'ira', 'roth_ira', 'business'].includes(val),
      'Invalid account type',
    ),
});

/**
 * Paginated response schema
 */
export const paginatedResponseSchema = z.object({
  data: z.array(brokerageAccountSchema),
  pagination: z.object({
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
  }),
});
