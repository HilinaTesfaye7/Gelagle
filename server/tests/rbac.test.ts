import { test, describe } from 'node:test';
import assert from 'node:assert';
import { Role } from '../src/rbac/roles.js';
import { Permission } from '../src/rbac/permissions.js';
import { hasPermission, getRolePermissions, ROLE_PERMISSIONS } from '../src/rbac/matrix.js';

describe('RBAC Centralized Permissions Matrix', () => {
  test('All 8 required roles exist in the matrix', () => {
    const roles = Object.keys(ROLE_PERMISSIONS);
    assert.strictEqual(roles.length, 8);
    assert.ok(roles.includes(Role.PROJECT_MANAGER));
    assert.ok(roles.includes(Role.PRODUCT_OWNER));
    assert.ok(roles.includes(Role.QA_LEAD));
    assert.ok(roles.includes(Role.QA_ENGINEER));
    assert.ok(roles.includes(Role.BACKEND_DEVELOPER));
    assert.ok(roles.includes(Role.FRONTEND_DEVELOPER));
    assert.ok(roles.includes(Role.DESIGNER));
    assert.ok(roles.includes(Role.OTHER));
  });

  test('PROJECT_MANAGER possesses broad administrative and project permissions', () => {
    assert.strictEqual(hasPermission(Role.PROJECT_MANAGER, Permission.PROJECT_CREATE), true);
    assert.strictEqual(hasPermission(Role.PROJECT_MANAGER, Permission.PROJECT_UPDATE), true);
    assert.strictEqual(hasPermission(Role.PROJECT_MANAGER, Permission.PROJECT_DELETE), true);
    assert.strictEqual(hasPermission(Role.PROJECT_MANAGER, Permission.MEMBER_INVITE), true);
    assert.strictEqual(hasPermission(Role.PROJECT_MANAGER, Permission.MEMBER_REMOVE), true);
    assert.strictEqual(hasPermission(Role.PROJECT_MANAGER, Permission.AUDIT_VIEW), true);
  });

  test('QA_LEAD has QA reporting and view permissions, but not project delete', () => {
    assert.strictEqual(hasPermission(Role.QA_LEAD, Permission.REPORT_CREATE), true);
    assert.strictEqual(hasPermission(Role.QA_LEAD, Permission.BUG_CREATE), true);
    assert.strictEqual(hasPermission(Role.QA_LEAD, Permission.BUG_UPDATE), true);
    assert.strictEqual(hasPermission(Role.QA_LEAD, Permission.PROJECT_DELETE), false);
    assert.strictEqual(hasPermission(Role.QA_LEAD, Permission.MEMBER_INVITE), false);
  });

  test('BACKEND_DEVELOPER has task, bug, and project view permissions', () => {
    assert.strictEqual(hasPermission(Role.BACKEND_DEVELOPER, Permission.PROJECT_VIEW), true);
    assert.strictEqual(hasPermission(Role.BACKEND_DEVELOPER, Permission.TASK_UPDATE), true);
    assert.strictEqual(hasPermission(Role.BACKEND_DEVELOPER, Permission.BUG_CREATE), true);
    assert.strictEqual(hasPermission(Role.BACKEND_DEVELOPER, Permission.PROJECT_DELETE), false);
    assert.strictEqual(hasPermission(Role.BACKEND_DEVELOPER, Permission.MEMBER_REMOVE), false);
  });
});
