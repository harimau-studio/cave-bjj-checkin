const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// The SQLite file lives in /data if that folder exists (e.g. a mounted
// persistent volume on Railway/Render), otherwise falls back to the
// project folder. Make sure your host's persistent disk is mounted at /data.
const dataDir = fs.existsSync('/data') ? '/data' : __dirname;
const db = new Database(path.join(dataDir, 'cave-bjj.sqlite'));
db.exec(`CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL)`);

const app = express();
app.use(express.json({ limit: '25mb' })); // roster + photos can add up

app.get('/api/kv/:key', (req, res) => {
  const row = db.prepare('SELECT key, value FROM kv WHERE key = ?').get(req.params.key);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
});

app.put('/api/kv/:key', (req, res) => {
  const { value } = req.body || {};
  if (typeof value !== 'string') {
    return res.status(400).json({ error: 'value must be a string' });
  }
  db.prepare(
    'INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).run(req.params.key, value);
  res.json({ key: req.params.key, value });
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CAVE BJJ check-in server running on port ${PORT}`);
  console.log(`Database file: ${path.join(dataDir, 'cave-bjj.sqlite')}`);
});
