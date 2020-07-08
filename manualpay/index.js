const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const { initDb } = require('./db');
const { TransactionNotifier } = require('./notifier');
const { createTransaction, completeTransaction, findByStatus, STATUS_SUCCESS, STATUS_PENDING, findById, failTransaction, STATUS_FAILED } = require('./transactions');

const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/manualpay_socialrelief';
const DB_NAME = process.env.DB_NAME || 'manualpay_socialrelief';
const BASE_PATH_SECRET = process.env.BASE_PATH_SECRET || '';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/webhooks/manualpay'
const PORT = (process.env.PORT && Number(process.env.PORT)) || 5000;

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const notifier = new TransactionNotifier(WEBHOOK_URL);


/**
 * 
 * @param {string} path 
 */
function getFullPath(path) {
  return `${BASE_PATH_SECRET}${path}`;
}

const router = express.Router();
app.use(getFullPath(''), router);

router.get('/', async (req, res) => {
  try {
    const transactions = await findByStatus(STATUS_PENDING)
    return res.render('pages/pending', { transactions, getFullPath });
  }
  catch (error) {
    return res.render('pages/error', { error, getFullPath });
  }
});

router.get('/completed', async (req, res) => {
  try {
    const transactions = await findByStatus(STATUS_SUCCESS);
    return res.render('pages/completed', { transactions, getFullPath });
  }
  catch (error) {
    return res.render('pages/error', { error, getFullPath });
  }
});

router.get('/failed', async (req, res) => {
  try {
    const transactions = await findByStatus(STATUS_FAILED);
    return res.render('pages/failed', { transactions, getFullPath });
  }
  catch (error) {
    return res.render('pages/error', { error, getFullPath });
  }
});

router.post('/complete-transaction', async (req, res) => {
  try {
    if (!req.body.id || !req.body.reference) throw new Error('Transaction id and reference are required');
    const tx = await completeTransaction(req.body.id, req.body.reference);
    // fire notification and move on immediately, if it fails, errors will be logged
    notifier.sendNotification(tx)
    return res.redirect(getFullPath('/'));
  }
  catch (e) {
    return res.render('pages/error', { error: e, getFullPath });
  }
});

router.post('/fail-transaction', async (req, res) => {
  try {
    if (!req.body.id) throw new Error('Transaction id is required');
    const tx = await failTransaction(req.body.id, req.body.failureReason || '');
    notifier.sendNotification(tx)
    return res.redirect(getFullPath('/'));
  }
  catch (e) {
    return res.render('pages/error', { error: e, getFullPath });
  }
});


// API

router.post('/api/transactions', async (req, res) => {
  try {
    console.log('Creating transaction', req.body);
    const tx = await createTransaction(req.body);
    console.log('Transaction created successfully', tx);
    res.status(200).json(tx);
  }
  catch (e) {
    console.error('Error creating transaction', e);
    res.status(400).json({
      error: e.message
    });
  }
});

router.get('/api/transactions/:id', async (req, res) => {
  try {
    console.log('Finding transacition', req.params.id);
    const tx = await findById(req.params.id);
    res.status(200).json(tx);
  }
  catch (e) {
    console.error('Error getting transaction', e);
    res.status(400).json({
      error: e.message
    });
  }
});

async function start() {
  try {
    console.log('Connecting to db...');
    await initDb(DB_URL, DB_NAME);

    console.log('Starting app...');

    app.listen(PORT, () => {
      console.log(`Manualpay listening on port ${PORT}`)
    });
  }
  catch (e) {
    console.error('Failed to start app', e);
  }
}


start();
