const express = require('express');
const path = require('path');
const fs = require('fs');

// The data file lives in /data if that folder exists (e.g. a mounted
// persistent volume on Railway/Render), otherwise falls back to the
// project folder. Make sure your host's persistent disk is mounted at /data.
const dataDir = fs.existsSync('/data') ? '/data' : __dirname;
const dbFile = path.join(dataDir, 'cave-bjj-data.json');

function loadData() {
  try {
    const raw = fs.readFileSync(dbFile, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function saveData(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data), 'utf8');
}

const app = express();
app.use(express.json({ limit: '25mb' })); // roster + photos can add up

app.get('/api/kv/:key', (req, res) => {
  const data = loadData();
  if (!(req.params.key in data)) {
    return res.status(404).json({ error: 'not found' });
  }
  res.json({ key: req.params.key, value: data[req.params.key] });
});

app.put('/api/kv/:key', (req, res) => {
  const { value } = req.body || {};
  if (typeof value !== 'string') {
    return res.status(400).json({ error: 'value must be a string' });
  }
  const data = loadData();
  data[req.params.key] = value;
  saveData(data);
  res.json({ key: req.params.key, value });
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CAVE BJJ check-in server running on port ${PORT}`);
  console.log(`Database file: ${dbFile}`);
});
