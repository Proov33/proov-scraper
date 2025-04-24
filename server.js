const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour traiter les requêtes JSON
app.use(express.json());

// Route principale pour vérifier si le serveur fonctionne
app.get('/', (req, res) => {
  res.send('Bienvenue sur le scraper automatisé !');
});

// Route pour effectuer le scraping
app.post('/scrape', async (req, res) => {
  const { url } = req.body;

  // Vérification si l'URL est fournie
  if (!url) {
    return res.status(400).json({ error: 'L\'URL est requise dans le corps de la requête.' });
  }

  try {
    // Lancer Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Exemple : Extraire le titre de la page
    const title = await page.title();

    // Extraire le contenu HTML
    const content = await page.content();

    await browser.close();

    // Retourner les données extraites
    res.json({ title, content });
  } catch (error) {
    console.error('Erreur lors du scraping :', error);
    res.status(500).json({ error: 'Une erreur est survenue lors du scraping.' });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});