---
description: Guide on migrating package.json in CommonJS packages to ESM.
---

# Migrating package.json for a CommonJS package

Examples in this chapter can be found [here](https://github.com/nodejs/package-examples/blob/main/guide/05-cjs-esm-migration/migrating-package-json/).

## The `"type"` field

If ESM code is in `.js` files, add `"type": "module"` in the nearest `package.json` so Node.js treats `.js` as ESM.

For example, a CommonJS package might look like this before migration:

```
my-logger/
├── index.js     // Contains CommonJS code
└── package.json  // Either contains "type": "commonjs",
                  // or does not have "type" field and relies on the "commonjs" default
```

After migration, if ESM source remains in `.js`, explicitly set `"type": "module"` so Node.js loads `.js` files as ESM:

```
my-logger/
├── index.js     // Migrated to ESM code now
└── package.json  // Needs to explicitly specify "type": "module" now
```

If you can’t set `"type": "module"`, use the `.mjs` extension for migrated files. This helps during gradual migrations when some `.js` files remain CommonJS.

```
my-logger/
├── index.mjs     // Migrated to ESM code now
├── utils.js      // Still CommonJS, pending migration
└── package.json  // Either contains "type": "commonjs",
                  // or does not have "type" field and relies on the "commonjs" default
```

## The `"engines"` field

As mentioned in the [chapter about shipping ESM for CommonJS consumers](../../04-cjs-esm-interop/shipping-esm-for-cjs/README.md#engines), use the `"engines"` field to limit installs to Node.js versions that support `require(esm)`. Many packages bump the major version when dropping older Node.js support. For example:

```json
{
  "name": "my-logger",
  "version": "2.0.0",  // bumped from 1.x to 2.0.0
  "type": "module",  // switched to ESM in .js files
  "exports": {
    ".": "./index.js",
    "./package.json": "./package.json"
  },
  "engines": {
    // Requires Node.js versions with require(esm) support
    "node": "^20.19.0 || >=22.12.0"
  }
}
```

This practice is optional but common among packages migrating from CommonJS to ESM.
