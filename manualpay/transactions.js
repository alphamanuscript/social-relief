const { randomBytes } = require('crypto');
const { getDb } = require('./db');

function generateId() {
  return randomBytes(16).toString('hex');
}

const STATUS_PENDING = 'pending';
const STATUS_SUCCESS = 'success';
const STATUS_FAILED = 'failed';
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
      status: STATUS_SUCCESS,
      updatedAt: now
    }
  }, {
    returnOriginal: false
  });

  return result.value;
}

async function failTransaction(id, failureReason) {
  const db = getDb();

  const now = new Date();
  const result = await db.collection(COLL).findOneAndUpdate({
    _id: id
  }, {
    $set: {
      failureReason,
      status: STATUS_FAILED,
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
  return db.collection(COLL).find({ status }).sort({ updatedAt: -1 }).toArray();
}

/**
 * 
 * @param {string} id 
 */
async function findById(id) {
  const db = getDb();
  const res = await db.collection(COLL).findOne({ _id: id });
  return res;
}

exports.createTransaction = createTransaction;
exports.completeTransaction = completeTransaction;
exports.failTransaction = failTransaction;
exports.findByStatus = findByStatus;
exports.findById = findById;
exports.STATUS_SUCCESS = STATUS_SUCCESS;
exports.STATUS_PENDING = STATUS_PENDING;
exports.STATUS_FAILED = STATUS_FAILED;
