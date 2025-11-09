import assert from 'node:assert';

import { pkg, foo, bar, utils, lib } from 'my-module';
import { after, before, describe, it } from 'node:test';
import { once } from 'node:events';

describe('migrating-imports', () => {
  describe('before', () => {
    describe('before-migrations', () => {
      it('works with default export of a third-party package', () => {
        assert.strictEqual(pkg.foo, 'from pkg');
      });
      it('works with named exports of a third-party package', () => {
        assert.strictEqual(foo, 'from pkg');
      });
      it('works with directory imports', () => {
        assert.strictEqual(utils.value, 'from utils-dir');
      });
      it('works with undetectable named imports from CommonJS', () => {
        assert.strictEqual(bar, 'from cjs-pkg-with-undetectable-name');
      });
      it('works with extensionless exports', () => {
        assert.strictEqual(lib.value, 'from lib');
      });

      it('works with synchronous dynamic import of builtins', async () => {
        const { getKernelInfo } = await import('my-module/kernel-info');
        const kernelInfo = getKernelInfo();
        assert.strictEqual(typeof kernelInfo, 'string');
      });

      it('works with synchronous dynamic import of user modules', async () => {
        const { readAndDecodeSync } = await import('my-module/read-decode');
        const syncData = readAndDecodeSync('test-format');
        assert.deepStrictEqual(syncData, {result: "sync-test-data"});
      });

      describe('asynchronous dynamic imports', async () => {
        const { server } = await import('./test-server.mjs');
        before(async () => {
          server.listen(0);
          await once(server, 'listening');
        });
        after(() => {
          server.close();
        });

        it('works with asynchronous dynamic import of user modules', async () => {
          const { downloadAndDecode } = await import('my-module/download-decode');
          const asyncData = await downloadAndDecode(`127.0.0.1:${server.address().port}`, 'test-format');
          assert.deepStrictEqual(asyncData, {result: "async-test-data"});
        });
      });
    });
  });
});
