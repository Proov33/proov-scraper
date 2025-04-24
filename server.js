const express = require('express');
const cors = require('cors');
const scraper = require('./scraper');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

app.get('/', (req, res) => {
  res.send('✅ Scraper backend is running');
});

app.get('/matches/:team', scraper.getMatches);
app.get('/players/:team', scraper.getPlayers);
app.get('/summary/:team', scraper.getSummary);
app.get('/stats/:team', scraper.getStats);
app.get('/ranking/:team', scraper.getRanking);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
