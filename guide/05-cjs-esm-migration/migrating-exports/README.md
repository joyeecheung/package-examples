---
description: Guide on migrating exports in CommonJS to ESM.
---

# Migrating exports in CommonJS

When migrating a CommonJS module to ESM, replace `module.exports` and `exports` assignments with ESM `export` syntax. This chapter covers common migration patterns and caveats caused by semantic differences between CommonJS and ESM.

Examples in this chapter can be found [here](https://github.com/nodejs/package-examples/blob/main/guide/05-cjs-esm-migration/migrating-exports/).

## Migrating `exports.foo = bar`

CommonJS modules often provide named exports by assigning properties to `exports`. These can be migrated with simple `export` statements. For example, if the CommonJS module contains:

```js
// before/node_modules/my-logger/named-only.js
exports.Logger = class Logger { /* Logger implementation */ }
```

Replace with ESM `export`:

```js
// after/node_modules/my-logger/named-only.js
export class Logger { /* Logger implementation */ }
// Equivalent to `export { Logger }` following the class definition
```

Aliases can be exported using the `export ... as ...` syntax:

```js
// before/node_modules/my-logger/named-only.js
exports.LoggerAlias = Logger;
```

```js
// after/node_modules/my-logger/named-only.js
export { Logger as LoggerAlias };
```

This keeps both ESM and CommonJS consumers working without changes (though or CommonJS consumers, they will now need to use a Node.js version that supports `require(esm)`):

```js
// before/app.mjs & after/app.mjs
import pkg from 'my-logger/named-only';
// pkg is the module.exports object before the migration, and the namespace
// object after the migration.
const { Logger, LoggerAlias } = pkg;
// Or
import { Logger, LoggerAlias } from 'my-logger/named-only';
```

```js
// before/app.cjs & after/app.cjs
const pkg = require('my-logger/named-only');
// pkg is the module.exports object before the migration, and the namespace
// object after the migration.
const { Logger, LoggerAlias } = pkg;
// Or
const { Logger, LoggerAlias } = require('my-logger/named-only');
```

## Migrating `module.exports = { foo, ... }`

CommonJS modules can also provide named exports by reassigning `module.exports` to an object literal. These can be migrated with `export default { ... }`. For example:

```js
// before/node_modules/my-logger/named-only-object-literal.js
class Logger { /* Logger implementation */ }
module.exports = { Logger };
```

Replace with:

```js
// after/node_modules/my-logger/named-only-object-literal.js
class Logger { /* Logger implementation */ }
export default { Logger };  // For import pkg from ...
export { Logger };  // For import { Logger } from ... and const { Logger } = require(...)
```

This keeps both ESM and CommonJS consumers working; the code below remains unchanged before and after migration:

```js
// before/app-named-only-object-literal.mjs & after/app-named-only-object-literal.mjs
import pkg from 'my-logger/named-only-object-literal';
// pkg is the module.exports object before the migration, and the namespace
// object after the migration.
const { Logger } = pkg;
// Or
import { Logger } from 'my-logger/named-only-object-literal';
```

```js
// before/app-named-only-object-literal.cjs & after/app-named-only-object-literal.cjs
const pkg = require('my-logger/named-only-object-literal');
// pkg is the module.exports object before the migration, and the namespace
// object after the migration.
const { Logger } = pkg;
// Or
const { Logger } = require('my-logger/named-only-object-literal');
```

## Migrating other `module.exports` reassignments

When the CommonJS module reassigns `module.exports` to something other than a mere object literal, the semantic differences between ESM and CommonJS modules come into play. For example, suppose the module exports only a logger instance as `module.exports`:

```js
// before/node_modules/my-logger/default-export.js
class Logger { /* Logger implementation */ }
module.exports = new Logger();
```

```js
// before/app-default-export.mjs
import logger from 'my-logger/default-export';
```

```js
// before/app-default-export.cjs
const logger = require('my-logger/default-export');
```

When migrating to ESM, to maintain compatibility for the ESM consumers, it will need to use `export default`:

```js
// after/node_modules/my-logger/default-export-naive.js
class Logger { /* Logger implementation */ }
export default new Logger();
```

```js
// after/app-default-export-naive.mjs
import logger from 'my-logger/default-export-naive';
logger.log('Hello from ESM');
```

This, however, would break `require()`. In ESM, the `logger` instance is exposed as the `default` property of the namespace object (per the spec):

```js
// after/app-default-export-naive.cjs
{
  const logger = require('my-logger/default-export-naive');
  // If it tries to use the logger instance directly, it would fail, because the value
  // returned by require() is actually the namespace object:
  // { default: Logger {} }
  logger.log('Hello from CommonJS'); // This would throw a TypeError.
}

{
  const { default: logger } = require('my-logger/default-export-naive');
  // After a naive migration, CommonJS consumer code would need to be updated to:
  logger.log('Hello from CommonJS'); // This would work.
}
```

To address this disparity, Node.js recognizes a special `'module.exports'` named export for ESM modules. When provided, `require(esm)` returns its value directly instead of the namespace object.

```js
// after/node_modules/my-logger/default-export.js
class Logger { /* Logger implementation */ }
const logger = new Logger();
export default logger;
// Adding this overrides what require(esm) returns to maintain backward compatibility
export { logger as 'module.exports' };
```

```js
// after/app-default-export.cjs
// Unlike after/app-default-export-naive.cjs, this is the same as before/app-default-export.cjs
// `require()` returns the 'module.exports' named export instead if it exists
const logger = require('my-logger/default-export');
logger.log('Hello from CommonJS');
```

```js
// after/app-default-export.mjs
// Same as before/app-default-export.mjs
import logger from 'my-logger/default-export';
logger.log('Hello from ESM');
```

## Migrating a module with both default and named exports

If a CommonJS package previously provides both default and named exports:

```js
// before/node_modules/my-logger/default-and-named.js
class Logger { /* Logger implementation */ }
const logger = new Logger();
module.exports = logger;
module.exports.Logger = Logger;  // For ESM named export detection to work
```

Which means its ESM consumers have been loading it like this:

```js
// before/app-default-and-named.mjs
import logger from 'my-logger/default-and-named';
import { Logger } from 'my-logger/default-and-named';
```

And its CommonJS consumers have been loading it like this:

```js
// before/app-default-and-named.cjs
const logger = require('my-logger/default-and-named');
const { Logger } = require('my-logger/default-and-named');
```

When migrating to ESM, to preserve compatibility for all consumers, it can use a `'module.exports'` override for `require(esm)`.

```js
// after/node_modules/my-logger/default-and-named.js
class Logger { /* Logger implementation */ }
const logger = new Logger();
logger.Logger = Logger;  // Migrated from module.exports.Logger = Logger;

export default logger;  // Necessary for `import logger from 'my-logger'`
export { Logger };  // Necessary for `import { Logger } from 'my-logger'`
export { logger as 'module.exports' };  // Necessary for `const logger = require('my-logger')`
```

This way, both ESM and CommonJS consumers can remain unchanged after the migration.
