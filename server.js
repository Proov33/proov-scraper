const express = require('express');
const { scrapeFlashscoreClub } = require('./scraper');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Middleware pour traiter les JSON dans les requêtes POST

// Route pour le scraping
app.post('/scrape', async (req, res) => {
  console.log('Requête reçue sur /scrape');
  console.log('Corps de la requête :', req.body);

  const { clubName, tab } = req.body;

  if (!clubName || !tab) {
    return res.status(400).json({ error: 'Le nom du club et l\'onglet sont requis.' });
  }

  try {
    const result = await scrapeFlashscoreClub(clubName, tab);
    if (result.success) {
      res.json(result); // Retourne les données récupérées
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (err) {
    console.error('Erreur lors du scraping :', err);
    res.status(500).json({ error: 'Une erreur est survenue lors de la recherche.' });
  }
});

// Middleware pour capturer les 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée.' });
});

// Lancer le serveur
app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
});