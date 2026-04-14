const fs = require('fs');

const originalReadFileSync = fs.readFileSync;
fs.readFileSync = function patchedReadFileSync(path, ...args) {
  try {
    return originalReadFileSync.call(this, path, ...args);
  } catch (err) {
    try {
      // Keep logging minimal and deterministic for diagnostics.
      console.error('[TRACE_READ_FAIL]', path);
    } catch (_) {
      // no-op
    }
    throw err;
  }
};
