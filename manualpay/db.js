const mongodb = require('mongodb');

/**
 * @type {mongodb.Db}
 */
let db;

exports.initDb = async function(dbHost, dbName) {
  if (!db) {
    const conn = await mongodb.connect(dbHost, { useUnifiedTopology: true });
    db = conn.db(dbName);
  }
}

exports.getDb = function() {
  if (!db) {
    throw new Error('DB connection not initialized');
  }

  return db;
}
