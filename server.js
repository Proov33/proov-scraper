const express = require('express');
const { scrapeFlashscoreClub } = require('./scrapper');

const app = express();
const port = 3000;

app.use(express.json());

// Route pour rechercher un club
app.post('/search-club', async (req, res) => {
  const { clubName } = req.body;

  if (!clubName) {
    return res.status(400).json({ error: 'Le nom du club est requis.' });
  }

  try {
    const result = await scrapeFlashscoreClub(clubName);
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (err) {
    console.error('Erreur :', err);
    res.status(500).json({ error: 'Une erreur est survenue.' });
  }
});

app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
});