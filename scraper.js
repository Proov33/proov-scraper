const puppeteer = require('puppeteer-core');

// Définir le chemin vers Google Chrome ou Chromium
const executablePath =
  process.env.CHROME_EXECUTABLE ||
  '/usr/bin/google-chrome-stable'; // Par défaut pour Render ou systèmes Linux

/**
 * Fonction pour scraper Flashscore
 * @param {string} club - Le nom du club à rechercher
 * @returns {Promise<string>} - Le titre de la page du club
 */
async function scrapeFlashscore(club) {
  if (!club) {
    throw new Error('Le nom du club est requis pour effectuer une recherche.');
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: executablePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process',
      '--no-zygote',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://www.flashscore.com/', { waitUntil: 'networkidle2' });

    // Clic sur l'icône de recherche (loupe)
    await page.waitForSelector('.search__inputButton'); // Sélecteur de la loupe
    await page.click('.search__inputButton');

    // Entrer le nom du club dans le champ de recherche
    await page.waitForSelector('.search__input'); // Champ de recherche
    await page.type('.search__input', club, { delay: 100 });

    // Attendre que les résultats de recherche apparaissent
    await page.waitForSelector('.search__result');

    // Cliquer sur le premier résultat correspondant au club
    const firstResultSelector = '.search__result a';
    await page.waitForSelector(firstResultSelector);
    await page.click(firstResultSelector);

    // Attendre que la page du club se charge
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Extraire le titre de la page
    const title = await page.title();
    return title;
  } finally {
    await browser.close();
  }
}

/**
 * Fonction générique pour scraper un autre site
 * @param {string} url - L'URL du site à scraper
 * @returns {Promise<string>} - Le contenu de la page
 */
async function scrapeGenericSite(url) {
  if (!url) {
    throw new Error('Une URL est requise pour scraper.');
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: executablePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process',
      '--no-zygote',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Extraire le contenu de la page
    const content = await page.content();
    return content;
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeFlashscore, scrapeGenericSite };