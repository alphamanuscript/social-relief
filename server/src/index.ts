import * as express from 'express';
import * as cors from 'cors';
import { MongoClient, Db } from 'mongodb';
import { bootstrap } from './core/bootstrap';
import { AppConfig, App } from './core/app';

let db: Db;
const PORT = 3000;
const DB_URL = 'mongodb://localhost:27017/lockdown';
const DB_NAME = 'crowdrelief';
const server = express();
server.use(express.json());
server.use(cors());

const config: AppConfig = {
  dbName: DB_NAME,
  dbUri: DB_URL
};


export const generateId = (): string => {
  return Math.floor(Math.random() * 10000).toString();
};


function setupApi(app: App) {
  server.get('/', (req, res) => {
    res.status(200).send({ ok: true });
  });
  
  server.post('/users', async (req, res) => {
    app.users.create(req.body)
    .then(user => res.status(201).send(user))
    .catch(err => res.status(400).json(err));
  });
  
  server.post('/login', async (req, res) => {
    app.users.login(req.body)
    .then(result => res.status(200).send(result))
    .catch(err => res.status(401).json(err));
  });
  
  server.post('/donate', async (req, res) => {
    const result = await db.collection('transactions').insertOne({
      _id: generateId(),
      ...req.body
    });
    return res.status(200).json(result.ops[0]);
  });
  
  server.post('/beneficiaries', async (req, res) => {
    const beneficiary = req.body;
    const result = await db.collection('beneficiaries').insertOne({
      _id: generateId(),
      ...req.body
    });
    return res.status(200).json(result.ops[0]);
  });
  
  server.put('/beneficiaries/:bid', async (req, res) => {
    const bid = req.params.bid;
    const updatedBnf = req.body;
    const update: any = {
        $set: { ...updatedBnf }
    };
    const result = await db.collection('beneficiaries').findOneAndUpdate({ _id: bid }, update, {
        upsert: true,
        returnOriginal: false,
    });
    return res.status(200).json(result.value);
  });
  
  server.get('/beneficiaries', async (req, res) => {
    const accountId = req.get('Authorization');
    const result = await db.collection('beneficiaries').find({ 'nominatedBy.associatedDonorId': accountId }).toArray();
    return res.status(200).json(result);
  });
  
  server.get('/beneficiaries/:bnfPhone', async (req, res) => {
    const bnfPhone = req.params.bnfPhone;
    const accountId = req.get('Authorization');
    const result = await db.collection('beneficiaries').findOne({ _id: bnfPhone });
    return res.status(200).json(result);
  });
  
  
  server.post('/middlemen', async (req, res) => {
    const middleman = req.body;
    const result = await db.collection('middlemen').insertOne({
      _id: generateId(),
      ...req.body
    });
    return res.status(200).json(result.ops[0]);
  });
  
  server.put('/middlemen/:mid', async (req, res) => {
    const mid = req.params.mid
    const updatedMdm = req.body;
    const update: any = {
        $set: { ...updatedMdm }
    };
    const result = await db.collection('middlemen').findOneAndUpdate({ _id: mid }, update, {
        upsert: true,
        returnOriginal: false,
    });
    return res.status(200).json(result.value);
  });
  
  server.get('/middlemen/:mdmPhone', async (req, res) => {
    const mdmPhone = req.params.mdmPhone;
    const accountId = req.get('Authorization');
    const result = await db.collection('middlemen').findOne({ phone: mdmPhone });
    return res.status(200).json(result);
  });
  
  server.get('/middlemen', async (req, res) => {
    const accountId = req.get('Authorization');
    const result = await db.collection('middlemen').find({ 'appointedBy._id': accountId }).toArray();
    return res.status(200).json(result);
  });
  
  
  server.get('/transactions', async (req, res) => {
    const accountId = req.get('Authorization');
    const result = await db.collection('transactions').find({ 
      $or: [{ from: accountId}, { to: accountId }]
     }).toArray();
    return res.status(200).json(result);
  });
  
  server.post('/transactions/query', async (req, res) => {
    const accountId = req.get('Authorization');
    const { pipeline } = req.body;
    const result = await db.collection('transactions').aggregate(pipeline, { allowDiskUse: true }).toArray();
    return res.status(200).json(result);
  });
  
  server.put('/users/:uid', async(req, res) => {
    const uid = req.params.uid;
    const updatedUser = req.body;
    const update: any = {
        $set: { ...updatedUser }
    };
    const result = await db.collection('users').findOneAndUpdate({ _id: uid }, update, {
        upsert: true,
        returnOriginal: false,
    });
    return res.status(200).json(result.value);
  });
  
  server.get('/invitations', async(req, res) => {
    const inviter = req.get('Authorization');
    const result = await db.collection('invitations').find({ inviter }).toArray();
    return res.status(200).json(result);
  });
  
  server.post('/invitations', async(req, res) => {
    const invitation = req.body;
    const result = await db.collection('invitations').insertOne({
      _id: generateId(),
      ...req.body
    });
    return res.status(200).json(result.ops[0]);
  });
  
  server.get('/invitations/:link_code', async(req, res) => {
    const link_code = req.params.link_code;
    const result = await db.collection('invitations').findOne({ generatedLink: new RegExp(`${link_code}$`)  });
    return res.status(200).json(result);
  });
  
  server.delete('/invitations/:invt_id', async(req, res) => {
    const _id = req.params.invt_id;
    const result = await db.collection('invitations').findOneAndDelete({ _id });
    return res.status(200).json(result.value);
  });
  
  server.get('/users/:phone', async(req, res) => {
    const phone = req.params.phone;
    const result = await db.collection('users').findOne({ phone });
    return res.status(200).json(result);
  });
  
  server.post('/users', async(req, res) => {
    const result = await db.collection('users').insertOne({
      _id: generateId(),
      ...req.body
    });
    return res.status(200).json(result.ops[0]);
  });
}

async function startApp() {
  try {
    const app = await bootstrap(config);
    setupApi(app);
    server.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);
    });
  }
  catch (e) {
    console.error(e.message);
  }
}

startApp();