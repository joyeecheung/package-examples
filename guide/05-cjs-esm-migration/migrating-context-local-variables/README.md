---
description: Guide on migrating context-local variables in CommonJS to ESM.
---

# Migrating context-local variables in CommonJS

Examples in this chapter can be found [here](https://github.com/nodejs/package-examples/blob/main/guide/05-cjs-esm-migration/migrating-context-local-variables/).

CommonJS context-local variables aren’t available in ESM; use `import.meta` instead.

| CommonJS | ESM Equivalent | Minimum Node.js Version |
|----------|----------------|------------------------|
| `__filename` | `import.meta.filename` | v20.11.0 / v21.2.0 |
| `__dirname` | `import.meta.dirname` | v20.11.0 / v21.2.0 |
| `require.main` | `import.meta.main` | v22.18.0 / v24.2.0 |
| `require.resolve` | `import.meta.resolve` | v12.16.2+ |

For older versions of Node.js where `import.meta.filename` and `import.meta.dirname` are not available, `import.meta.url` can be used to derive the filename and dirname using `fileURLToPath()` from `node:url`.

```js
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

The CommonJS `module` and `exports` variables do not exist in ESM, and there’s no direct equivalent for export introspection. In ESM, declare exports with `export` statements. See [Migrating exports](../migrating-exports/README.md) for details.
