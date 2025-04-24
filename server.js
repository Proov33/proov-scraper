const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const autoScrape = require('./scraper');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware pour limiter les requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite à 100 requêtes par 15 minutes
  message: "Trop de requêtes provenant de cette adresse IP, veuillez réessayer plus tard."
});

app.use(cors());
app.use(bodyParser.json());
app.use(limiter);

app.post('/scrape', async (req, res) => {
  const { teamName, tab } = req.body;

  console.log("Requête reçue :", req.body); // Log de la requête reçue

  if (!teamName || !tab) {
    console.error("Paramètres manquants : teamName ou tab");
    return res.status(400).json({ error: 'Missing teamName or tab' });
  }

  try {
    const result = await autoScrape(teamName, tab);
    res.json({ data: result });
  } catch (error) {
    console.error(`Erreur scraping [${tab}] pour "${teamName}" :`, error);
    res.status(500).json({ error: 'Erreur lors du scraping.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Serveur opérationnel sur le port ${PORT}`);
});