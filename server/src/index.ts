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

  await db.collection('users').findOneAndReplace({ userId: 'userId' }, {
    userId: 'userid',
    accountId: 'acc1',
    phone: '0711223344',
    email: 'john@mailer.com'
  });

  await db.createCollection('transactions');
}

app.get('/', (req, res) => {
  res.status(200).send({ ok: true });
});

app.post('/deposit', async (req, res) => {
  console.log('depositing', req.body);
  const result = await db.collection('transactions').insert(req.body);
  return res.status(200).json(result.ops[0]);
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