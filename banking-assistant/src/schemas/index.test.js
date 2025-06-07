import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { accountIdSchema, transactionQuerySchema } from '../schemas/index.js';

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
});
