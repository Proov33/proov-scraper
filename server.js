const express = require('express');
const { scrapeFlashscoreClub } = require('/scrapper');

const app = express();
const port = 3000;

app.use(express.json()); // Middleware pour lire les JSON dans les requêtes POST

// Route pour rechercher un club sur Flashscore
app.post('/search-club', async (req, res) => {
  const { clubName } = req.body;

  if (!clubName) {
    return res.status(400).json({ error: 'Le nom du club est requis.' });
  }

  console.log(`Recherche de l'équipe : ${clubName}`);
  try {
    const result = await scrapeFlashscoreClub(clubName);
    if (result.success) {
      res.json(result); // Retourne les informations du club à l'application mobile
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (err) {
    console.error('Erreur lors de la recherche :', err);
    res.status(500).json({ error: 'Une erreur est survenue lors de la recherche.' });
  }
});

// Lancer le serveur
app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
});