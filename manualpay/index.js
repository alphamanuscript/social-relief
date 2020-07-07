const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const { initDb } = require('./db');
const { createTransaction, completeTransaction, findByStatus, STATUS_COMPLETE, STATUS_PENDING } = require('./services/transactions');
const { Console } = require('console');

const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/manualpay_socialrelief';
const DB_NAME = process.env.DB_NAME || 'manualpay_socialrelief';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/webhooks/manualpay'
const PORT = (process.env.PORT && Number(process.env.PORT)) || 5000;

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', async (req, res) => {
  try {
    const transactions = await findByStatus(STATUS_PENDING)
    return res.render('pages/pending', { transactions });
  }
  catch (error) {
    return res.render('pages/error', { error });
  }
});

app.get('/completed', async (req, res) => {
  try {
    const transactions = await findByStatus(STATUS_COMPLETE);
    return res.render('pages/completed', { transactions });
  }
  catch (error) {
    return res.render('pages/error', { error });
  }
});

app.post('/complete-transaction', async (req, res) => {
  try {
    if (!req.body.id || !req.body.reference) throw new Error('Transaction id and reference are required');
    await completeTransaction(req.body.id, req.body.reference);
    // TODO send notification back to social relief
    return res.redirect('/');
  }
  catch (e) {
    return res.render('pages/error', { error: e });
  }
});


// API

app.post('/api/transactions', async (req, res) => {
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
