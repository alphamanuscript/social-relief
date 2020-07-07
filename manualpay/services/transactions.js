const { randomBytes } = require('crypto');
const { getDb } = require('../db');

function generateId() {
  return randomBytes(16).toString('hex');
}

const STATUS_PENDING = 'pending';
const STATUS_COMPLETE = 'complete';
const COLL = 'transactions';

/**
 * 
 * @param {object} data 
 * @param {number} data.amount
 * @param {string} data.recipientName
 * @param {string} data.recipientPhone
 * @param {string} data.socialReliefId
 */
async function createTransaction(data) {
  const db = getDb();
  const now = new Date();
  const _id = generateId();
  const toSave = { ...data, createdAt: now, updatedAt: now, status: STATUS_PENDING, _id };
  const res = await db.collection(COLL).insertOne(toSave);
  return res.ops[0];
}

/**
 * 
 * @param {string} id 
 * @param {string} reference 
 */
async function completeTransaction(id, reference) {
  const db = getDb();
  const now = new Date();
  const result = await db.collection(COLL).findOneAndUpdate({
    _id: id
  }, {
    $set: {
      reference: reference,
      status: STATUS_COMPLETE,
      updatedAt: now
    }
  }, {
    returnOriginal: false
  });

  return result.value;
}

/**
 * 
 * @param {string} status 
 */
async function findByStatus(status) {
  const db = getDb();
  return db.collection(COLL).find({ status }).toArray();
}

exports.createTransaction = createTransaction;
exports.completeTransaction = completeTransaction;
exports.findByStatus = findByStatus;
exports.STATUS_COMPLETE = STATUS_COMPLETE;
exports.STATUS_PENDING = STATUS_PENDING;