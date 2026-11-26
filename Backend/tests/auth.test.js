import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, makeToken, requireAuth } from '../middleware/auth.js';
test('passwords use salted scrypt and verify correctly', () => {
  const a = hashPassword('cafe-pass-001'), b = hashPassword('cafe-pass-001');
  assert.notEqual(a, b);
  assert.equal(verifyPassword('cafe-pass-001', a), true);
  assert.equal(verifyPassword('wrong', a), false);
  assert.equal(verifyPassword('cafe-pass-001', 'not-valid'), false);
});
test('signed sessions allow intended role and reject unauthorized roles', async () => {
  const session = { id: 3, role: 'cashier', full_name: 'Test Cashier' };
  const token = makeToken(session);
  const check = (roles, authorization) => new Promise(resolve => {
    const req = { headers: { authorization } }, res = {};
    requireAuth(...roles)(req, res, err => resolve({ err, user: req.user }));
  });
  const okay = await check(['cashier'], `Bearer ${token}`);
  assert.equal(okay.err, undefined);
  assert.equal(okay.user.id, 3);
  const forbidden = await check(['admin'], `Bearer ${token}`);
  assert.equal(forbidden.err.statusCode, 403);
  const invalid = await check(['cashier'], `Bearer ${token}bad`);
  assert.equal(invalid.err.statusCode, 401);
});
