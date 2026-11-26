import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOrderType } from '../utils/orderType.js';
test('checkout accepts Dine In and Take Out', () => {
  assert.equal(validateOrderType('dine_in'), 'dine_in');
  assert.equal(validateOrderType('take_out'), 'take_out');
});
test('checkout rejects missing and typed free-form order types', () => {
  for (const value of [undefined, '', null, 'Dine In', 'takeout', 'delivery']) {
    assert.throws(() => validateOrderType(value), { statusCode: 400 });
  }
});
