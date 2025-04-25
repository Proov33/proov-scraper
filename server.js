const express = require('express');
const puppeteer = require('puppeteer-core');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware pour analyser les requêtes JSON
app.use(express.json());

// Chemin vers l'exécutable Chromium local
const executablePath = path.resolve(__dirname, 'chrome-bin/chrome.exe');

// Route principale pour le scraping
app.post('/scrape', async (req, res) => {
  const { team, section } = req.body;

  // Vérification des paramètres
  if (!team || !section) {
    return res.status(400).json({ success: false, error: 'Missing team or section' });
  }

  try {
    console.log(`🚀 Lancement du scraping pour team=${team}, section=${section}`);

    // Lancement de Puppeteer avec Chromium local
    const browser = await puppeteer.launch({
      headless: true, // Exécuter sans interface graphique
      executablePath, // Chemin vers Chromium local
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Arguments nécessaires pour Render ou environnements cloud
    });

    const page = await browser.newPage();
    console.log('🌐 Navigation vers le site...');
    await page.goto('https://www.example.com', { waitUntil: 'networkidle2' });

    console.log('🔍 Extraction des données...');
    // Exemple de scraping simple
    const data = await page.evaluate(() => {
      return document.title; // Récupère le titre de la page
    });

    await browser.close();
    console.log('✅ Scraping terminé avec succès.');

    // Retour des données scrappées
    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Une erreur est survenue :', error.message);
    res.status(500).json({ success: false, error: 'Scraping failed. Please try again.' });
  }
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur en cours d'exécution sur le port ${PORT}`);
});