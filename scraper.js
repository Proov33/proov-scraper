const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  try {
    console.log('🚀 Lancement du navigateur avec Puppeteer...');

    // Chemin vers l'exécutable Chromium local
    const executablePath = path.resolve(__dirname, 'chrome-bin/chrome.exe');

    const browser = await puppeteer.launch({
      headless: true, // Exécuter sans interface graphique
      executablePath, // Utiliser Chromium local
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Recommandé pour Render
    });

    const page = await browser.newPage();
    console.log('🌐 Navigation vers le site...');
    await page.goto('https://www.example.com', { waitUntil: 'networkidle2' });

    console.log('🔍 Extraction du titre de la page...');
    const pageTitle = await page.title();
    console.log(`✅ Titre de la page : ${pageTitle}`);

    await browser.close();
    console.log('🎉 Navigateur fermé avec succès.');
  } catch (error) {
    console.error('❌ Une erreur est survenue :', error.message);
  }
})();