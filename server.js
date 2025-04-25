const express = require('express');
const puppeteer = require('puppeteer-core');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour analyser les requêtes JSON
app.use(express.json());

// Chemin vers l'exécutable Chromium
const executablePath = process.env.CHROME_EXECUTABLE || path.resolve(__dirname, 'chrome-bin/chrlauncher.exe');

// Route principale pour gérer les requêtes POST
app.post('/', async (req, res) => {
  const { team, section } = req.body;

  // Vérifiez la présence des paramètres requis
  if (!team || !section) {
    return res.status(400).json({ success: false, error: 'Missing team or section' });
  }

  try {
    console.log(`🚀 Lancement du scraping pour team="${team}", section="${section}"`);

    // Lancer Puppeteer avec Chromium
    const browser = await puppeteer.launch({
      headless: true, // Mode sans interface graphique
      executablePath, // Chemin vers Chromium
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Arguments nécessaires pour Render ou environnements cloud
    });

    const page = await browser.newPage();
    console.log('🌐 Navigation vers Flashscore...');
    await page.goto('https://www.flashscore.com/', { waitUntil: 'networkidle2' });

    console.log('🔍 Recherche de l’équipe...');
    // Exemple : Simuler la recherche d'une équipe sur Flashscore
    await page.type('input.searchInput', team); // Remplacez 'input.searchInput' par le sélecteur réel
    await page.click('button.searchButton'); // Remplacez 'button.searchButton' par le sélecteur réel

    // Attendez que les résultats soient chargés
    await page.waitForSelector('.searchResults'); // Remplacez '.searchResults' par le sélecteur réel

    console.log('📄 Extraction des résultats...');
    const results = await page.evaluate(() => {
      // Modifier selon la structure HTML de Flashscore
      return Array.from(document.querySelectorAll('.result-item')).map(item => item.textContent.trim());
    });

    // Fermer le navigateur
    await browser.close();
    console.log('✅ Scraping terminé avec succès.');

    // Retourner les résultats
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('❌ Une erreur est survenue :', error.message);

    res.status(500).json({ success: false, error: 'Scraping failed. Please try again.' });
  }
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur en cours d'exécution sur le port ${PORT}`);
});