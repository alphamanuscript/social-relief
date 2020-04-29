import * as express from 'express';
import * as cors from 'cors';
import { MongoClient, Db } from 'mongodb';
import { v4 as uuid } from 'uuid62';

let db: Db;
const PORT = 3000;
const DB_URL = 'mongodb://localhost:27017/lockdown';
const app = express();
app.use(express.json());
app.use(cors());

export const generateId = (): string => {
  return uuid();
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
      password: 'kiragi',
      email: 'john@mailer.com',
      accountBalance: 0,
      role: 'donor'
    });
  }
}

app.get('/', (req, res) => {
  res.status(200).send({ ok: true });
});

app.post('/beneficiaries', async (req, res) => {
  const { phone, donor } = req.body;
  const user = await db.collection('users').findOne({ phone });
  if (user && 'beneficiary' in user.roles) {
    const result = await db.collection('users').findOneAndUpdate(
      { phone }, 
      { $addToSet: { donors: donor } },
      { upsert: true, returnOriginal: false }
    );
    return res.status(200).json(result.value);
  }
  else if (user && 'middleman' in user.roles) {
    const result = await db.collection('users').findOneAndUpdate(
      { phone }, 
      { $addToSet: { donors: donor, roles: 'beneficiary' } }, 
      { upsert: true, returnOriginal: false }
    );
    return res.status(200).json(result.value);
  }
  else if (user && 'donor' in user.roles) {
    return res.status(406).json('A user cannot be both a donor and beneficiary')
  }
  else {
    const result = await db.collection('users').insertOne({
      _id: generateId(),
      phone,
      addedBy: donor,
      donors: [donor],
      roles: ['beneficiary']
    });
    return res.status(200).json(result.ops[0]);
  }
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