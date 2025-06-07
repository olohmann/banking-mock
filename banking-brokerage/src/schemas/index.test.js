import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  userIdSchema,
  brokerageAccountIdSchema,
  accountTypeSchema,
  createBrokerageAccountSchema,
  listAccountsQuerySchema,
} from './index.js';

describe('Schema validation', () => {
  test('userIdSchema validates correct user IDs', () => {
    const validIds = ['USER1234', 'A1B2C3D4', 'USR12345678'];

    validIds.forEach((id) => {
      assert.doesNotThrow(() => userIdSchema.parse(id));
    });
  });

  test('userIdSchema rejects invalid user IDs', () => {
    const invalidIds = ['user123', 'A1B2C3D', 'USR12345678901234567'];

    invalidIds.forEach((id) => {
      assert.throws(() => userIdSchema.parse(id));
    });
  });

  test('brokerageAccountIdSchema validates correct account IDs', () => {
    const validIds = ['BRK12345678', 'BRKABC123DEF', 'BRK1A2B3C4D'];

    validIds.forEach((id) => {
      assert.doesNotThrow(() => brokerageAccountIdSchema.parse(id));
    });
  });

  test('brokerageAccountIdSchema rejects invalid account IDs', () => {
    const invalidIds = ['brk12345678', 'ABC12345678', 'BRK123'];

    invalidIds.forEach((id) => {
      assert.throws(() => brokerageAccountIdSchema.parse(id));
    });
  });

  test('accountTypeSchema validates enum values', () => {
    const validTypes = ['individual', 'joint', 'ira', 'roth_ira', 'business'];

    validTypes.forEach((type) => {
      assert.doesNotThrow(() => accountTypeSchema.parse(type));
    });

    assert.throws(() => accountTypeSchema.parse('invalid'));
  });

  test('createBrokerageAccountSchema validates complete request', () => {
    const validRequest = {
      userId: 'USER1234',
      accountType: 'individual',
      initialDeposit: 5000,
      tradingPermissions: ['stocks', 'options'],
      riskTolerance: 'moderate',
    };

    assert.doesNotThrow(() => createBrokerageAccountSchema.parse(validRequest));
  });

  test('listAccountsQuerySchema transforms and validates query params', () => {
    const query = { limit: '5', offset: '10' };
    const result = listAccountsQuerySchema.parse(query);

    assert.strictEqual(result.limit, 5);
    assert.strictEqual(result.offset, 10);
  });
});
