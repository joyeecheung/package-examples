
//! [doc]
let a;
function runOnlyWhenUsed() {
  a = require('./a.mjs');
//! [doc]
  console.log('Loaded lazily:', a.getValue());
}

exports.runOnlyWhenUsed = runOnlyWhenUsed;
