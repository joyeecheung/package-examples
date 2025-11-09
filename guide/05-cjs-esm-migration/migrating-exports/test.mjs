import { describe, it } from 'node:test';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert';
import { join } from 'node:path';

describe('migrating-exports', () => {
  describe('before', () => {
    it('named-only can be required from CommonJS', () => {
      const result = spawnSync(process.execPath, ['app-named-only.cjs'], {
        cwd: join(import.meta.dirname, 'before'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert.match(result.stdout, /\[LOG\] Hello from CommonJS/);
    });

    it('named-only can be imported from ESM', () => {
      const result = spawnSync(process.execPath, ['app-named-only.mjs'], {
        cwd: join(import.meta.dirname, 'before'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert.match(result.stdout, /\[LOG\] Hello from ESM/);
    });

    it('named-only-object-literal can be required from CommonJS', () => {
      const result = spawnSync(process.execPath, ['app-named-only-object-literal.cjs'], {
        cwd: join(import.meta.dirname, 'before'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert.match(result.stdout, /\[LOG\] Hello from CommonJS/);
    });

    it('named-only-object-literal can be imported from ESM', () => {
      const result = spawnSync(process.execPath, ['app-named-only-object-literal.mjs'], {
        cwd: join(import.meta.dirname, 'before'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert.match(result.stdout, /\[LOG\] Hello from ESM/);
    });

    it('default-export can be required from CommonJS', () => {
      const result = spawnSync(process.execPath, ['app-default-export.cjs'], {
        cwd: join(import.meta.dirname, 'before'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert.match(result.stdout, /\[LOG\] Hello from CommonJS/);
    });

    it('default-export can be imported from ESM', () => {
      const result = spawnSync(process.execPath, ['app-default-export.mjs'], {
        cwd: join(import.meta.dirname, 'before'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert.match(result.stdout, /\[LOG\] Hello from ESM/);
    });

    it('default-and-named can be required from CommonJS', () => {
      const result = spawnSync(process.execPath, ['app-default-and-named.cjs'], {
        cwd: join(import.meta.dirname, 'before'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert.match(result.stdout, /\[LOG\] Hello from CommonJS/);
      assert.match(result.stdout, /\[LOG\] Created new instance/);
    });

    it('default-and-named can be imported from ESM', () => {
      const result = spawnSync(process.execPath, ['app-default-and-named.mjs'], {
        cwd: join(import.meta.dirname, 'before'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert.match(result.stdout, /\[LOG\] Hello from ESM/);
      assert.match(result.stdout, /\[LOG\] Created new instance/);
    });
  });

  describe('after', () => {
    it('named-only can be required from CommonJS', () => {
      const result = spawnSync(process.execPath, ['app-named-only.cjs'], {
        cwd: join(import.meta.dirname, 'after'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert.match(result.stdout, /\[LOG\] Hello from CommonJS/);
    });

    it('named-only can be imported from ESM', () => {
      const result = spawnSync(process.execPath, ['app-named-only.mjs'], {
        cwd: join(import.meta.dirname, 'after'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert.match(result.stdout, /\[LOG\] Hello from ESM/);
    });

    it('named-only-object-literal can be required from CommonJS', () => {
      const result = spawnSync(process.execPath, ['app-named-only-object-literal.cjs'], {
        cwd: join(import.meta.dirname, 'after'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert.match(result.stdout, /\[LOG\] Hello from CommonJS/);
    });

    it('named-only-object-literal can be imported from ESM', () => {
      const result = spawnSync(process.execPath, ['app-named-only-object-literal.mjs'], {
        cwd: join(import.meta.dirname, 'after'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert.match(result.stdout, /\[LOG\] Hello from ESM/);
    });

    it('default-export can be required from CommonJS', () => {
      const result = spawnSync(process.execPath, ['app-default-export.cjs'], {
        cwd: join(import.meta.dirname, 'after'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert.match(result.stdout, /\[LOG\] Hello from CommonJS/);
    });

    it('default-export can be imported from ESM', () => {
      const result = spawnSync(process.execPath, ['app-default-export.mjs'], {
        cwd: join(import.meta.dirname, 'after'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert.match(result.stdout, /\[LOG\] Hello from ESM/);
    });

    it('default-export-naive can be required from CommonJS', () => {
      const result = spawnSync(process.execPath, ['app-default-export-naive.cjs'], {
        cwd: join(import.meta.dirname, 'after'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert.match(result.stdout, /\[LOG\] Hello from CommonJS/);
    });

    it('default-export-naive can be imported from ESM', () => {
      const result = spawnSync(process.execPath, ['app-default-export-naive.mjs'], {
        cwd: join(import.meta.dirname, 'after'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert.match(result.stdout, /\[LOG\] Hello from ESM/);
    });

    it('default-and-named can be required from CommonJS', () => {
      const result = spawnSync(process.execPath, ['app-default-and-named.cjs'], {
        cwd: join(import.meta.dirname, 'after'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert.match(result.stdout, /\[LOG\] Hello from CommonJS/);
      assert.match(result.stdout, /\[LOG\] Created new instance/);
    });

    it('default-and-named can be imported from ESM', () => {
      const result = spawnSync(process.execPath, ['app-default-and-named.mjs'], {
        cwd: join(import.meta.dirname, 'after'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert.match(result.stdout, /\[LOG\] Hello from ESM/);
      assert.match(result.stdout, /\[LOG\] Created new instance/);
    });
  });
});
