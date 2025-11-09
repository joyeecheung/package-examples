---
description: Guide on migrating exports in CommonJS to ESM.
---

# Migrating exports in CommonJS

When migrating a CommonJS module to ESM, there are two main considerations:

1. Migrating `exports` and `module.exports` access to [the `export` syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export).
2. Maintaining backward compatibility:
  - For ESM consumers: always provide a default export.
  - For CommonJS consumers: if `module.exports` was reassigned to a non-object literal, provide the special `'module.exports'` named export.

Examples in this chapter can be found [here](https://github.com/nodejs/package-examples/blob/main/guide/05-cjs-esm-migration/migrating-exports/).

## Translating to `export` syntax

Start by replacing assignments to `exports` or `module.exports` with ESM `export` syntax.

### Translating `exports.foo = ...` or `module.exports.foo = ...` to named exports

CommonJS modules often expose named exports by assigning properties to `exports` or `module.exports`. Migrate these using [named exports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export#using_named_exports). For example, if a CommonJS module contains:

```js
// before/node_modules/my-module/named-only.js
class Foo { /* ... */ }

exports.Foo = Foo;
exports.bar = 'bar';
```

This translates to direct `export` statements:

```js
// after/node_modules/my-module/named-only.js
export class Foo { /* ... */ };
export const bar = 'bar';
```

Export aliases using the `export ... as ...` syntax:

```js
// before/node_modules/my-module/named-only.js
exports.FooAlias = Foo;
```

```js
// after/node_modules/my-module/named-only.js
export { Foo as FooAlias };
```

### Translating `module.exports = { foo, ... }`

Some modules provide named exports by reassigning `module.exports` to an object literal. Translate this with `export { ... }`. For example:

```js
// before/node_modules/my-module/named-only-object-literal.js
class Baz { /* ... */ }
module.exports = { Baz };
```

Translate to:

```js
// after/node_modules/my-module/named-only-object-literal.js
class Baz { /* ... */ }
export { Baz };
```

### Translating `module.exports = ...` that is not an object literal

If `module.exports` is set to a value that is not an object literal, use the [`export default` syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export#using_the_default_export). For example:

```js
// before/node_modules/my-module/default-export.js
module.exports = function qux() {};
```

Translate to ESM as follows:

```js
// after/node_modules/my-module/default-export.js
export default function qux() {};
```

Note: Syntax translation alone isn’t enough here. See the [maintaining backward compatibility section](#for-commonjs-consumers-if-moduleexports-was-reassigned-to-a-non-object-literal) for additional steps.

### Re-exporting default exports from internal modules

CommonJS modules can re-export from other modules by assigning properties from the required module to `exports` or `module.exports`. Translate these to ESM [`export ... from` statements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export#using_export_from).

For example, to re-export defaults from internal modules:

```js
// before/node_modules/my-module/re-export-defaults.js
exports.foo = require('./foo.js');
exports.bar = require('./bar.js');
```

Translate to ESM:

```js
// after/node_modules/my-module/re-export-defaults.js
export { default as foo } from './foo.js';
export { default as bar } from './bar.js';
```

### Re-exporting named exports from internal modules

CommonJS modules can re-export selected named exports from another module:

```js
// before/node_modules/my-module/re-export-names.js
const { name1, name2 } = require('./names.js');
exports.name1 = name1;
exports.name2 = name2;
```

Translate to ESM:

```js
// after/node_modules/my-module/re-export-names.js
export { name1, name2 } from './names.js';
```

### Re-exporting all exports from internal modules

CommonJS modules may re-export all exports from another module:

```js
// before/node_modules/my-module/re-export-all.js
module.exports = require('./named-only-object-literal.js');
```

To migrate to ESM, use `export * from` for named exports and add `export { default } from` for the default export omitted by `export * from`:

```js
// after/node_modules/my-module/re-export-all.js
export * from './named-only-object-literal.js';
export { default } from './named-only-object-literal.js';
```

### Aggregating named exports from multiple modules

If the CommonJS module aggregates exports from multiple internal modules:

```js
// before/node_modules/my-module/re-export-aggregate.js
module.exports = {
  ...require('./debug-names.js'),
  ...require('./log-names.js'),
};
```

Translate to ESM:

```js
// after/node_modules/my-module/re-export-aggregate.js
export * from './debug-names.js';
export * from './log-names.js';
```

## Maintaining backward compatibility

### For ESM consumers: always provide a default export

When ESM consumers import a CommonJS module, the `module.exports` object is always available as a default export. To maintain compatibility for ESM consumers, always provide a default export, even if it seemingly only provides named exports.

Consider the following CommonJS module:

```js
// before/node_modules/my-module/named-only.js
class Foo { /* ... */ }

exports.Foo = Foo;
exports.bar = 'bar';
exports.FooAlias = Foo;
```

If we stop after converting only the named exports:

```js
// before/node_modules/my-module/named-only-partial.js
export class Foo { /* ... */ };
export const bar = 'bar';
export { Foo as FooAlias };
```

this would break ESM consumers that have been using a default import from the CommonJS version:

```js
// after/app-importing-default-from-named-only-partial.js
// This would break unless 'my-module' provides a default export during the migration
import myModule from 'my-module/named-only-partial';
```

Maintain ESM compatibility by adding a default export:

```js
// after/node_modules/my-module/named-only.js
export class Foo { /* ... */ };
export const bar = 'bar';
export { Foo as FooAlias };
export default { Foo, bar, FooAlias: Foo };  // To be backward compatible with ESM consumers.
```

```js
// after/app-importing-default-from-named-only.js
import myModule from 'my-module/named-only';
```

### For CommonJS consumers: if `module.exports` was reassigned to a non-object-literal

If the CommonJS module previously reassigned `module.exports` to a value, unless that value is an object literal with static names (in which case, it essentially only contained named exports, and the `module.exports` value itself is likely not significant), CommonJS consumers would expect to `require()` to continue to return that value.

For example, if the CommonJS module contained:

```js
// before/node_modules/my-module/default-export.js
module.exports = function qux() {};
```

as mentioned before, this is typically migrated to ESM like below.

```js
// after/node_modules/my-module/default-export-partial.js
export default function qux() {};
```

This is done so that ESM consumers can continue importing the function as the default export:

```js
// after/app-importing-default-export.mjs
import qux from 'my-module/default-export-partial';  // so this continues to work.
```

However, as discussed in [the ESM interoperability guide](../../04-cjs-esm-interop/shipping-esm-for-cjs/README.md#how-esm-exports-map-to-requireesm), per the ESM specification, the default export of that ESM would only be available as the `'default'` property on the module namespace object, which is returned by `require(esm)` directly by default:

```js
// after/app-requiring-default-export-partial.cjs
// The returned value is actually { default: [Function: qux] }
const qux = require('my-module/default-export-partial');
qux(); // Throws TypeError: qux is not a function
```

To address this disparity, Node.js recognizes a special `'module.exports'` named export for ESM. When provided, `require(esm)` returns its value directly instead of the module namespace object.

```js
// after/node_modules/my-module/default-export.js
export default function qux() {};
export { qux as 'module.exports' };  // To be backward compatible with CommonJS consumers.
```

```js
// after/app-requiring-default-export.cjs
const qux = require('my-module/default-export');  // Returns the 'module.exports' named export.
qux(); // Now it works as expected.
```

## Dynamic exports

Dynamically-added exports cannot be directly translated to ESM. ESM exports are static and must be known at compile time. Instead, use a static export shape with `undefined` placeholders and conditionally initialize the bindings.

For example, this CommonJS pattern:

```js
// before/node_modules/my-module/dynamic-exports.js
exports.initialize = function(type) {
  if (type === 'foo') {
    exports.foo = function() { /* ... */ };
  } else {
    exports.bar = function() { /* ... */ };
  }
};
// foo and bar are only added as exports when initialized.
```

cannot be directly migrated to ESM. However, it can be restructured if consumers do not require uninitialized exports to be absent from the export list:

```js
// after/node_modules/my-module/dynamic-exports.js
export let foo;
export let bar;
export function initialize(type) {
  if (type === 'foo') {
    foo = function() { /* ... */ };
  } else {
    bar = function() { /* ... */ };
  }
}
// foo and bar will always be present as named exports, but may be undefined until initialized.
export default { foo, bar, initialize };
```

```js
// before/app-using-dynamic-exports.mjs
import myModule from 'my-module/dynamic-exports';
console.log('foo' in myModule); // false
console.log('bar' in myModule); // false
myModule.initialize('foo');
console.log('foo' in myModule); // true
console.log('bar' in myModule); // false
```

```js
// after/app-using-dynamic-exports.mjs
import myModule from 'my-module/dynamic-exports';
console.log('foo' in myModule); // true, even though it's undefined
console.log('bar' in myModule); // true, even though it's undefined
myModule.initialize('foo');
console.log('foo' in myModule); // true
console.log('bar' in myModule); // true
```
