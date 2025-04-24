const express = require('express');
const { scrapeFlashscoreClub } = require('./scraper');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Middleware pour lire les JSON dans les requêtes POST

// Route principale pour scraper des données
app.post('/scrape', async (req, res) => {
  const { clubName, tab } = req.body;

  if (!clubName || !tab) {
    return res.status(400).json({ error: 'Le nom du club et l\'onglet sont requis.' });
  }

  console.log(`Recherche pour le club "${clubName}" et l'onglet "${tab}"`);
  try {
    const result = await scrapeFlashscoreClub(clubName, tab);
    if (result.success) {
      res.json(result); // Retourne les données récupérées
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (err) {
    console.error('Erreur lors de la recherche :', err);
    res.status(500).json({ error: 'Une erreur est survenue lors de la recherche.' });
  }
});

// Route par défaut pour capturer les 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée.' });
});

// Lancer le serveur
app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
});