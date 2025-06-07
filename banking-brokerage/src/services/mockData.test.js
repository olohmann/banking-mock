import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  createBrokerageAccount,
  getBrokerageAccountsByUserId,
  getBrokerageAccountById,
  brokerageAccountExists,
  userExists,
  getAllUserIds,
} from './mockData.js';

describe('Mock data service', () => {
  test('createBrokerageAccount creates a new account', () => {
    const accountData = {
      userId: 'TESTUSER1',
      accountType: 'individual',
      initialDeposit: 1000,
      tradingPermissions: ['stocks'],
      riskTolerance: 'moderate',
    };

    const account = createBrokerageAccount(accountData);

    assert.ok(account.accountId.startsWith('BRK'));
    assert.strictEqual(account.userId, 'TESTUSER1');
    assert.strictEqual(account.accountType, 'individual');
    assert.strictEqual(account.balance, 1000);
    assert.strictEqual(account.status, 'pending');
  });

  test('getBrokerageAccountsByUserId returns user accounts', () => {
    const result = getBrokerageAccountsByUserId('USER1234');

    assert.ok(Array.isArray(result.data));
    assert.ok(result.data.length > 0);
    assert.ok(result.pagination);
    assert.strictEqual(typeof result.pagination.total, 'number');

    // All returned accounts should belong to the user
    result.data.forEach((account) => {
      assert.strictEqual(account.userId, 'USER1234');
    });
  });

  test('getBrokerageAccountsByUserId applies filters', () => {
    const result = getBrokerageAccountsByUserId('USER1234', {
      status: 'active',
      accountType: 'individual',
    });

    result.data.forEach((account) => {
      assert.strictEqual(account.status, 'active');
      assert.strictEqual(account.accountType, 'individual');
    });
  });

  test('getBrokerageAccountsByUserId handles pagination', () => {
    const result = getBrokerageAccountsByUserId('USER1234', {
      limit: 1,
      offset: 0,
    });

    assert.strictEqual(result.data.length, 1);
    assert.strictEqual(result.pagination.limit, 1);
    assert.strictEqual(result.pagination.offset, 0);
  });

  test('getBrokerageAccountById returns specific account', () => {
    const account = getBrokerageAccountById('BRK1A2B3C4D5');

    assert.ok(account);
    assert.strictEqual(account.accountId, 'BRK1A2B3C4D5');
  });

  test('getBrokerageAccountById returns null for non-existent account', () => {
    const account = getBrokerageAccountById('NONEXISTENT');

    assert.strictEqual(account, null);
  });

  test('brokerageAccountExists checks account existence', () => {
    assert.strictEqual(brokerageAccountExists('BRK1A2B3C4D5'), true);
    assert.strictEqual(brokerageAccountExists('NONEXISTENT'), false);
  });

  test('userExists checks if user has accounts', () => {
    assert.strictEqual(userExists('USER1234'), true);
    assert.strictEqual(userExists('NONEXISTENT'), false);
  });

  test('getAllUserIds returns unique user IDs', () => {
    const userIds = getAllUserIds();

    assert.ok(Array.isArray(userIds));
    assert.ok(userIds.length > 0);
    assert.ok(userIds.includes('USER1234'));
    assert.ok(userIds.includes('USER5678'));
  });
});
