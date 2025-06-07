import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import {
  accountIdSchema,
  transactionQuerySchema,
  userIdSchema,
  listAccountsQuerySchema,
  accountTypeSchema,
  accountStatusSchema,
} from './index.js';

describe('Validation Schemas', () => {
  describe('accountIdSchema', () => {
    it('should validate correct account ID', () => {
      const validIds = ['ACC1234567890', 'BANK1234567890123456'];
      
      validIds.forEach((id) => {
        assert.doesNotThrow(() => accountIdSchema.parse(id));
      });
    });

    it('should reject invalid account IDs', () => {
      const invalidIds = ['acc123', '123456789', 'ABC!@#$%^&*()', 'A', ''];
      
      invalidIds.forEach((id) => {
        assert.throws(() => accountIdSchema.parse(id));
      });
    });
  });

  describe('transactionQuerySchema', () => {
    it('should parse valid query parameters', () => {
      const result = transactionQuerySchema.parse({
        limit: '20',
        offset: '10',
      });
      
      assert.strictEqual(result.limit, 20);
      assert.strictEqual(result.offset, 10);
    });

    it('should apply defaults for missing parameters', () => {
      const result = transactionQuerySchema.parse({});
      
      assert.strictEqual(result.limit, 10);
      assert.strictEqual(result.offset, 0);
    });

    it('should reject invalid limit values', () => {
      assert.throws(() => transactionQuerySchema.parse({ limit: '0' }));
      assert.throws(() => transactionQuerySchema.parse({ limit: '101' }));
      assert.throws(() => transactionQuerySchema.parse({ limit: 'invalid' }));
    });

    it('should reject invalid offset values', () => {
      assert.throws(() => transactionQuerySchema.parse({ offset: '-1' }));
      assert.throws(() => transactionQuerySchema.parse({ offset: 'invalid' }));
    });
  });

  describe('userIdSchema', () => {
    it('should validate correct user IDs', () => {
      const validIds = ['USER1234', 'ABC12345DEFG', 'A1B2C3D4'];
      
      validIds.forEach((id) => {
        assert.doesNotThrow(() => userIdSchema.parse(id));
      });
    });

    it('should reject invalid user IDs', () => {
      const invalidIds = ['user123', 'ABC!DEF', 'AB12345', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', ''];
      
      invalidIds.forEach((id) => {
        assert.throws(() => userIdSchema.parse(id));
      });
    });
  });

  describe('listAccountsQuerySchema', () => {
    it('should parse valid query parameters', () => {
      const result = listAccountsQuerySchema.parse({
        limit: '25',
        offset: '5',
        status: 'active',
        accountType: 'checking',
      });
      
      assert.strictEqual(result.limit, 25);
      assert.strictEqual(result.offset, 5);
      assert.strictEqual(result.status, 'active');
      assert.strictEqual(result.accountType, 'checking');
    });

    it('should apply defaults for missing parameters', () => {
      const result = listAccountsQuerySchema.parse({});
      
      assert.strictEqual(result.limit, 10);
      assert.strictEqual(result.offset, 0);
    });

    it('should reject invalid limit values', () => {
      assert.throws(() => listAccountsQuerySchema.parse({ limit: '0' }));
      assert.throws(() => listAccountsQuerySchema.parse({ limit: '51' }));
    });

    it('should reject invalid status values', () => {
      assert.throws(() => listAccountsQuerySchema.parse({ status: 'invalid' }));
    });

    it('should reject invalid account type values', () => {
      assert.throws(() => listAccountsQuerySchema.parse({ accountType: 'invalid' }));
    });
  });

  describe('accountTypeSchema', () => {
    it('should validate correct account types', () => {
      const validTypes = ['checking', 'savings', 'credit', 'loan'];
      
      validTypes.forEach((type) => {
        assert.doesNotThrow(() => accountTypeSchema.parse(type));
      });
    });

    it('should reject invalid account types', () => {
      const invalidTypes = ['investment', 'mortgage', 'invalid', ''];
      
      invalidTypes.forEach((type) => {
        assert.throws(() => accountTypeSchema.parse(type));
      });
    });
  });

  describe('accountStatusSchema', () => {
    it('should validate correct account statuses', () => {
      const validStatuses = ['active', 'inactive', 'suspended', 'closed'];
      
      validStatuses.forEach((status) => {
        assert.doesNotThrow(() => accountStatusSchema.parse(status));
      });
    });

    it('should reject invalid account statuses', () => {
      const invalidStatuses = ['pending', 'frozen', 'invalid', ''];
      
      invalidStatuses.forEach((status) => {
        assert.throws(() => accountStatusSchema.parse(status));
      });
    });
  });
});
