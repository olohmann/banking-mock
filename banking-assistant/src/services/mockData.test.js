import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  getAccountBalance,
  getAccountTransactions,
  accountExists,
  getBankingAccountsByUserId,
  getBankingAccountById,
  userExists,
  getAllUserIds,
} from './mockData.js';

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

  describe('getBankingAccountsByUserId', () => {
    it('should return accounts for valid user', () => {
      const result = getBankingAccountsByUserId('USER1234');
      
      assert.strictEqual(result.data.length, 2);
      assert.strictEqual(result.pagination.total, 2);
      assert.strictEqual(result.data[0].userId, 'USER1234');
      assert.strictEqual(result.data[1].userId, 'USER1234');
    });

    it('should return empty array for non-existent user', () => {
      const result = getBankingAccountsByUserId('NONEXISTENT');
      
      assert.strictEqual(result.data.length, 0);
      assert.strictEqual(result.pagination.total, 0);
    });

    it('should handle pagination correctly', () => {
      const result = getBankingAccountsByUserId('USER1234', { limit: 1, offset: 0 });
      
      assert.strictEqual(result.data.length, 1);
      assert.strictEqual(result.pagination.limit, 1);
      assert.strictEqual(result.pagination.offset, 0);
      assert.strictEqual(result.pagination.hasMore, true);
    });

    it('should filter by account type', () => {
      const result = getBankingAccountsByUserId('USER1234', { accountType: 'checking' });
      
      assert.strictEqual(result.data.length, 1);
      assert.strictEqual(result.data[0].accountType, 'checking');
    });

    it('should filter by status', () => {
      const result = getBankingAccountsByUserId('USER1234', { status: 'active' });
      
      assert.strictEqual(result.data.length, 2);
      result.data.forEach((account) => {
        assert.strictEqual(account.status, 'active');
      });
    });
  });

  describe('getBankingAccountById', () => {
    it('should return account for valid account ID', () => {
      const result = getBankingAccountById('ACC1234567890');
      
      assert.strictEqual(result.accountId, 'ACC1234567890');
      assert.strictEqual(result.userId, 'USER1234');
      assert.strictEqual(result.accountType, 'checking');
    });

    it('should return null for non-existent account', () => {
      const result = getBankingAccountById('INVALID123');
      assert.strictEqual(result, null);
    });
  });

  describe('userExists', () => {
    it('should return true for valid user', () => {
      assert.strictEqual(userExists('USER1234'), true);
      assert.strictEqual(userExists('USER5678'), true);
    });

    it('should return false for non-existent user', () => {
      assert.strictEqual(userExists('NONEXISTENT'), false);
    });
  });

  describe('getAllUserIds', () => {
    it('should return all unique user IDs', () => {
      const result = getAllUserIds();
      
      assert.strictEqual(result.length, 2);
      assert.ok(result.includes('USER1234'));
      assert.ok(result.includes('USER5678'));
    });
  });
});
