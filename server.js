const express = require('express');
const app = express();
const scraper = require('./scraper');

app.use(express.json());

app.get('/api/:type/:team', async (req, res) => {
  const { type, team } = req.params;
  try {
    const result = await scraper.scrape(type, team);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur', detail: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('✅ Serveur lancé sur le port', PORT));