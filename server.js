const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support base64 image uploads

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let db;

async function initDB() {
  try {
    await client.connect();
    db = client.db('unc_stealth_db');
    console.log('Successfully connected to MongoDB Atlas!');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}
initDB();

app.get('/', (req, res) => res.send('UNC Stealth Chat API is online'));

// --- MESSAGES ENDPOINTS ---
app.get('/api/messages', async (req, res) => {
  try {
    const msgs = await db.collection('messages').find({}).sort({ createdAt: 1 }).toArray();
    res.json(msgs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/messages', async (req, res) => {
  try {
    const msg = { ...req.body, createdAt: req.body.createdAt || Date.now() };
    await db.collection('messages').updateOne({ id: msg.id }, { $set: msg }, { upsert: true });
    res.json({ success: true, message: msg });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/messages/:id', async (req, res) => {
  try {
    await db.collection('messages').deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- DIRECT MESSAGES ENDPOINTS ---
app.get('/api/dms', async (req, res) => {
  try {
    const dms = await db.collection('direct_messages').find({}).sort({ createdAt: 1 }).toArray();
    res.json(dms);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/dms', async (req, res) => {
  try {
    const dm = { ...req.body, createdAt: req.body.createdAt || Date.now() };
    await db.collection('direct_messages').updateOne({ id: dm.id }, { $set: dm }, { upsert: true });
    res.json({ success: true, dm: dm });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/dms/:id', async (req, res) => {
  try {
    await db.collection('direct_messages').deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- USERS ENDPOINTS ---
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.collection('users').find({}).toArray();
    res.json(users);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = req.body;
    await db.collection('users').updateOne({ id: user.id }, { $set: user }, { upsert: true });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));