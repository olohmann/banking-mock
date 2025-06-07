import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { getAccountBalance, getAccountTransactions, accountExists } from '../services/mockData.js';

describe('Mock Data Service', () => {
  describe('getAccountBalance', () => {
    it('should return balance for valid account', () => {
      const result = getAccountBalance('ACC1234567890');
      
      assert.strictEqual(result.accountId, 'ACC1234567890');
      assert.strictEqual(result.balance, 15420.50);
      assert.strictEqual(result.currency, 'USD');
      assert.ok(result.lastUpdated);
    });

    it('should return null for non-existent account', () => {
      const result = getAccountBalance('INVALID123');
      assert.strictEqual(result, null);
    });
  });

  describe('getAccountTransactions', () => {
    it('should return transactions for valid account', () => {
      const result = getAccountTransactions('ACC1234567890', 5, 0);
      
      assert.strictEqual(result.accountId, 'ACC1234567890');
      assert.strictEqual(result.transactions.length, 5);
      assert.strictEqual(result.pagination.limit, 5);
      assert.strictEqual(result.pagination.offset, 0);
      assert.strictEqual(result.pagination.total, 50);
    });

    it('should return null for non-existent account', () => {
      const result = getAccountTransactions('INVALID123', 5, 0);
      assert.strictEqual(result, null);
    });

    it('should handle pagination correctly', () => {
      const result = getAccountTransactions('ACC1234567890', 3, 10);
      
      assert.strictEqual(result.transactions.length, 3);
      assert.strictEqual(result.pagination.offset, 10);
    });

    it('should generate consistent transactions for same account', () => {
      const result1 = getAccountTransactions('ACC1234567890', 5, 0);
      const result2 = getAccountTransactions('ACC1234567890', 5, 0);
      
      assert.deepStrictEqual(result1.transactions, result2.transactions);
    });
  });

  describe('accountExists', () => {
    it('should return true for valid account', () => {
      assert.strictEqual(accountExists('ACC1234567890'), true);
    });

    it('should return false for invalid account', () => {
      assert.strictEqual(accountExists('INVALID123'), false);
    });
  });
});
