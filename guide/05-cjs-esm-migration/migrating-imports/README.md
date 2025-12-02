---
description: Guide on migrating imports from CommonJS to ESM.
---

# Migrating imports from CommonJS to ESM

When migrating a CommonJS module that loads other modules to ESM, replace `require()` with `import` statements. This chapter shows common replacements, caveats, and workarounds.

Examples in this chapter can be found [here](https://github.com/nodejs/package-examples/blob/main/guide/05-cjs-esm-migration/migrating-imports/).

## Migrating `require()` to static `import`

Most of the time, the `require()` calls can be replaced with static `import` statements. For importing the entire module, using the `import defaultExport from 'module'` syntax usually suffices:

```js
// before/node_modules/my-module/index.js
const fs = require('fs');  // default export of Node.js built-in module
const pkg = require('pkg');  // default export of a third-party package
```

Convert to ESM:

```js
// after/node_modules/my-module/index.js
import fs from 'node:fs';  // default export of Node.js built-in module
import pkg from 'pkg';  // default export of a third-party package
```

For destructuring from `require()`, it's typical to migrate to `import { namedExport } from 'module'`. This helps with tree-shaking during bundling and Node.js can check for missing named exports when the module is loaded.

```js
// before/node_modules/my-module/index.js
const { join } = require('path');  // Named export of Node.js built-in module
const { foo } = require('pkg');  // Named export of a third-party package
```

```js
// after/node_modules/my-module/index.js
import { join } from 'node:path';  // Named export of Node.js built-in module
import { foo } from 'pkg';  // Named export of a third-party package
```

If the provider is CommonJS, its exports can only be imported by name if the names are detectable for ESM imports. See the [CommonJS interoperability guide](../../04-cjs-esm-interop/shipping-cjs-for-esm/README.md#named-imports-from-commonjs-in-esm) for details. If the provider does not expose detectable names, destructure from the default export instead.

```js
// before/node_modules/my-module/index.js
// In CommonJS, this works, because the destructuring happens at run time.
const { bar } = require('cjs-pkg-with-undetectable-name');
```

```js
// after/node_modules/my-module/import-undetectable-invalid.js
// In ESM, this throws a SyntaxError, because named import validation happens
// at module linking time and needs to be static.
import { bar } from 'cjs-pkg-with-undetectable-name';
```

```js
// after/node_modules/my-module/index.js
// To work around undetectable names from CJS, the ESM importer can destructure
// from the default export, which is the `module.exports` object of the CommonJS module.
// CommonJS modules always have a default export, so this always works.
import cjsPkg from 'cjs-pkg-with-undetectable-name';
const { bar } = cjsPkg;  // The destructuring happens at run time again.
```

## Include file extensions in import paths

When using `require()`, it is possible to load a file without specifying its extension - in that case Node.js would try to append different supported extensions to the path and load the first one that exists on the file system. For example:

```js
// before/node_modules/my-module/load-without-extension.js
const lib = require('./lib');  // If lib.js exists in the same directory, it will load ./lib.js
```

With `import`, however, extension probing is not supported; specify the extension during migration:

```js
// after/node_modules/my-module/load-without-extension.js
// Throws ERR_MODULE_NOT_FOUND because it only attempts to load a file with the exact name './lib'
import lib from './lib';
```

```js
// after/node_modules/my-module/index.js
// It would only work with a proper path specifying the extension:
import lib from './lib.js';
```

## Directory imports are not supported

When using `require()`, if the path used is a directory, Node.js would also look for `index.js` under it and load it if it exists.

```js
// before/node_modules/my-module/index.js
const utils = require('./utils-dir'); // If utils-dir/index.js exists, it will load ./utils-dir/index.js
```

Node.js `import` does not load directories; specify the file path during migration:

```js
// after/node_modules/my-module/import-dir.js
// Throws ERR_UNSUPPORTED_DIR_IMPORT because import does not support loading directories
import utils from './utils-dir';
```

```js
// after/node_modules/my-module/index.js
// It would only work with a proper path extended into the filename
import utils from './utils-dir/index.js'
```

## Migrating from dynamic `require()`

Module loading that is done through `require()` can usually be replaced with static `import` statements, as described in the previous section. At times, however, the module may have to perform module loading conditionally or on-demand. There are a few options for this.

### Loading Node.js built-ins synchronously and dynamically

If dynamic loading must be synchronous and the module is a Node.js built‑in, consider using `process.getBuiltinModule()` (Node.js v20.16.0+ / v22.3.0+). This is particularly handy if the module may be used in environments other than Node.js and it does not need to support older, end-of-life Node.js versions. For example:

```js
// before/node_modules/my-module/kernel-info.js
const isRunningAsCommonJSInNode =
  (typeof module === 'object' && module.exports && typeof require === 'function');

function getKernelInfo() { // A synchronous API that has to remain synchronous
  if (isRunningAsCommonJSInNode) {
    // Running on Node.js as CommonJS, load the 'os' built-in via require().
    const os = require('os');
    return os.version();
  } else {
    return 'unknown';
  }
}

if (isRunningAsCommonJSInNode) {
  module.exports = { getKernelInfo };
} else {
  // Other ways to export in non-CommonJS environments
}
```

Can be migrated to ESM like this:

```js
// after/node_modules/my-module/kernel-info.js
const isRunningOnNode =
  (typeof process === 'object' && typeof process.getBuiltinModule === 'function');
function getKernelInfo() {  // A synchronous API that has to remain synchronous
  if (isRunningOnNode) {
    // Running on Node.js as ESM, load the 'os' built-in via getBuiltinModule().
    const os = process.getBuiltinModule('os');
    return os.version();
  } else {
    return 'unknown';
  }
}
export { getKernelInfo };
```

### Loading other modules synchronously and dynamically

If the dynamic loading needs to be both synchronous and used to load non-built-in modules, in ESM in Node.js, a `require()` function can be created from the `module.createRequire()` built-in. For example this:

```js
// before/node_modules/my-module/initialize-plugin-sync.js
function initializePluginsSync(plugins) {  // Synchronous API that must remain synchronous.
  const results = [];
  for (const pluginName of plugins) {  //
    const plugin = require(`./sync-plugins/${pluginName}.js`);  // dynamic require()
    results.push(plugin.initialize());  // The plugin initialize() is synchronous
  }
  return results;
}
module.exports = { initializePluginsSync };
```

can be migrated to ESM like this:

```js
// after/node_modules/my-module/initialize-plugin-sync.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

function initializePluginsSync(plugins) {  // Synchronous API that must remain synchronous.
  const results = [];
  for (const pluginName of plugins) {  //
    const plugin = require(`./sync-plugins/${pluginName}.js`);  // dynamic require()
    results.push(plugin.initialize());  // The plugin initialize() is synchronous
  }
  return results;
}
export { initializePluginsSync };
```

### Loading other modules asynchronously and dynamically

If it is acceptable to perform the dynamic loading asynchronously, the [dynamic `import()` expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) can be used. For example, if the CommonJS module previously looked like this:

```js
// before/node_modules/my-module/initialize-plugin-async.js
async function initializePlugins(plugins) {  // Async API that can be async.
  const results = [];
  for (const pluginName of plugins) {
    const plugin = require(`./async-plugins/${pluginName}.js`);  // dynamic require()
    results.push(await plugin.initialize());  // The plugin initialize() is already asynchronous
  }
  return results;
}
module.exports = { initializePlugins };
```

It can be migrated to ESM like this:

```js
// after/node_modules/my-module/initialize-plugin-async.js
async function initializePlugins(plugins) {  // Async API that can be async.
  const results = [];
  for (const pluginName of plugins) {
    const plugin = await import(`./async-plugins/${pluginName}.js`);  // require() -> await import()
    results.push(await plugin.initialize());  // The plugin initialize() is already asynchronous
  }
  return results;
}
export { initializePlugins };
```
