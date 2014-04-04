
/**
 * Session Store initialization
 */

// module dependencies
var MemoryStore = require('express').session.MemoryStore;

exports.store = new MemoryStore();
