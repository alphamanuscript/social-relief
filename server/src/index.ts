import * as express from 'express';
import * as cors from 'cors';
import { MongoClient, Db } from 'mongodb';

let db: Db;
const PORT = 3000;
const DB_URL = 'mongodb://localhost:27017/lockdown';
const app = express();
app.use(express.json());
app.use(cors());

async function initDb() {
  const client = new MongoClient(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  db = client.db('lockdown');

  await db.dropCollection('users');
  await db.collection('users').insertOne({
    userId: 'userid',
    accountId: 'acc1',
    phone: '0711223344',
    email: 'john@mailer.com'
  });

  await db.dropCollection('beneficiaries');
  await db.collection('beneficiaries').insertOne({
    _id: 'beneficiaryid',
    phone: '0705975787',
    nominatedBy: 'acc1'
  });

  await db.dropCollection('transactions');
  await db.collection('transactions').insertMany([
    {
      _id: 'tx1',
      type: 'deposit',
      amount: 1000,
      from: '',
      to: 'acc1'
    },
    {
      _id: 'tx2',
      type: 'deposit',
      amount: 500,
      from: '',
      to: 'acc1'
    },
    {
      _id: 'tx3',
      type: 'donation',
      amount: 1000,
      from: 'acc1',
      to: 'acc2'
    },
    {
      _id: 'tx4',
      type: 'deposit',
      amount: 6000,
      from: '',
      to: 'acc1'
    },
    {
      _id: 'tx5',
      type: 'donation',
      amount: 1000,
      from: 'acc1',
      to: 'acc2'
    },
    {
      _id: 'tx6',
      type: 'donation',
      amount: 500,
      from: 'acc1',
      to: 'acc3'
    },
  ]);
}

app.get('/', (req, res) => {
  res.status(200).send({ ok: true });
});


app.post('/login', async (req, res) => {
  const userId = req.body.uid;
  console.log('Logging user in...', userId);
  const result = await db.collection('users').findOne({ userId });
  return res.status(200).json(result);
});

app.post('/deposit', async (req, res) => {
  console.log('Depositing', req.body);
  const result = await db.collection('transactions').insert(req.body);
  return res.status(200).json(result.ops[0]);
});

app.post('/beneficiaries', async (req, res) => {
  const beneficiary = req.body;
  const result = await db.collection('beneficiaries').insert(req.body);
  return res.status(200).json(result.ops[0]);
});

app.get('/beneficiaries', async (req, res) => {
  const accountId = req.get('Authorization');
  const result2 = await db.collection('beneficiaries').find({ nominatedBy: accountId }).toArray();
  return res.status(200).json(result2);
});

app.get('/transactions', async (req, res) => {
  const accountId = req.get('Authorization');
  const result = await db.collection('transactions').find({ 
    $or: [{ from: accountId}, { to: accountId }]
   }).toArray();
  return res.status(200).json(result);
});

async function startApp() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);
    });
  }
  catch (e) {
    console.error(e.message);
  }
}

startApp();