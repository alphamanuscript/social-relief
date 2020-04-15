import * as express from 'express';
import * as cors from 'cors';
import { MongoClient, Db } from 'mongodb';

let db: Db;
const PORT = 3000;
const DB_URL = 'mongodb://localhost:27017/lockdown';
const app = express();
app.use(express.json());
app.use(cors());

export const generateId = (): string => {
  return Math.floor(Math.random() * 10000).toString();
};

async function initDb() {
  const client = new MongoClient(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  db = client.db('lockdown');

  const collections = await db.listCollections().toArray();

  if (!collections.find(collection => collection.name === 'users')) {
    await db.collection('users').insertOne({
      _id: 'userid',
      phone: '0711223344',
      email: 'john@mailer.com',
      accountBalance: 0,
      role: 'donor'
    });
  }
  
  if (!collections.find(collection => collection.name === 'beneficiaries')) {
    await db.createCollection('beneficiaries');
  }


  if (!collections.find(collection => collection.name === 'middlemen')) {
    await db.createCollection('middlemen');
  }

  if (!collections.find(collection => collection.name === 'transactions')) {
    await db.createCollection('transactions');
  }
}

app.get('/', (req, res) => {
  res.status(200).send({ ok: true });
});


app.post('/login', async (req, res) => {
  const userId = req.body.uid;
  const result = await db.collection('users').findOne({ _id: userId });
  return res.status(200).json(result);
});

app.post('/donate', async (req, res) => {
  const result = await db.collection('transactions').insertOne({
    _id: generateId(),
    ...req.body
  });
  return res.status(200).json(result.ops[0]);
});

app.post('/beneficiaries', async (req, res) => {
  const beneficiary = req.body;
  const result = await db.collection('beneficiaries').insertOne({
    _id: generateId(),
    ...req.body
  });
  return res.status(200).json(result.ops[0]);
});

app.put('/beneficiaries', async (req, res) => {
  const updatedBnf = req.body;
  const update: any = {
      $set: { ...updatedBnf }
  };
  const result = await db.collection('beneficiaries').findOneAndUpdate({ phone: updatedBnf.phone }, update, {
      upsert: true,
      returnOriginal: false,
  });
  return res.status(200).json(result.value);
});

app.get('/beneficiaries', async (req, res) => {
  const accountId = req.get('Authorization');
  const result = await db.collection('beneficiaries').find({ 'nominatedBy.associatedDonorId': accountId }).toArray();
  return res.status(200).json(result);
});

app.post('/beneficiaries/query', async (req, res) => {
  const accountId = req.get('Authorization');
  const { phone } = req.body;
  const result = await db.collection('beneficiaries').findOne({ phone });
  return res.status(200).json(result);
});


app.post('/middlemen', async (req, res) => {
  const middleman = req.body;
  const result = await db.collection('middlemen').insertOne({
    _id: generateId(),
    ...req.body
  });
  return res.status(200).json(result.ops[0]);
});

app.put('/middlemen', async (req, res) => {
  const updatedMdm = req.body;
  const update: any = {
      $set: { ...updatedMdm }
  };
  const result = await db.collection('middlemen').findOneAndUpdate({ phone: updatedMdm.phone }, update, {
      upsert: true,
      returnOriginal: false,
  });
  return res.status(200).json(result.value);
});

app.post('/middlemen/query', async (req, res) => {
  const accountId = req.get('Authorization');
  const { phone } = req.body;
  const result = await db.collection('middlemen').findOne({ phone });
  return res.status(200).json(result);
});

app.get('/middlemen', async (req, res) => {
  const accountId = req.get('Authorization');
  const result = await db.collection('middlemen').find({ 'appointedBy._id': accountId }).toArray();
  return res.status(200).json(result);
});


app.get('/transactions', async (req, res) => {
  const accountId = req.get('Authorization');
  const result = await db.collection('transactions').find({ 
    $or: [{ from: accountId}, { to: accountId }]
   }).toArray();
  return res.status(200).json(result);
});

app.post('/transactions/query', async (req, res) => {
  const accountId = req.get('Authorization');
  const { pipeline } = req.body;
  const result = await db.collection('transactions').aggregate(pipeline, { allowDiskUse: true }).toArray();
  return res.status(200).json(result);
});

app.put('/users', async(req, res) => {
  const updatedUser = req.body;
  const update: any = {
      $set: { ...updatedUser }
  };
  const result = await db.collection('users').findOneAndUpdate({ _id: updatedUser._id }, update, {
      upsert: true,
      returnOriginal: false,
  });
  return res.status(200).json(result.value);
})

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