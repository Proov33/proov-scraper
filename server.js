const express = require('express');
const { scrapeFlashscore, scrapeGenericSite } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour traiter les requêtes JSON
app.use(express.json());

// Route principale pour vérifier si le serveur fonctionne
app.get('/', (req, res) => {
  res.send('Serveur de scraping multi-sites opérationnel !');
});

// Route pour rechercher un club sur Flashscore
app.post('/scrape/flashscore', async (req, res) => {
  const { club } = req.body;

  try {
    const title = await scrapeFlashscore(club);
    res.json({ success: true, title });
  } catch (error) {
    console.error('Erreur lors de la recherche sur Flashscore :', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour scraper un autre site
app.post('/scrape/generic', async (req, res) => {
  const { url } = req.body;

  try {
    const content = await scrapeGenericSite(url);
    res.json({ success: true, content });
  } catch (error) {
    console.error('Erreur lors du scraping du site générique :', error);
    res.status(500).json({ error: error.message });
  }
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});