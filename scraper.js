const puppeteer = require('puppeteer-core');

async function scrapeFlashscoreClub(clubName) {
  let browser;
  try {
    console.log(`Lancement de la recherche pour le club : ${clubName}`);

    // Spécifiez le chemin vers Chrome ou Chromium
    const browserPath = '/path/to/chrome'; // Remplacez par le chemin vers votre navigateur
    browser = await puppeteer.launch({
      headless: true,
      executablePath: browserPath, // Utilise un navigateur existant
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Options pour Docker ou production
    });

    const page = await browser.newPage();

    // Navigation vers Flashscore
    await page.goto('https://www.flashscore.fr/', { waitUntil: 'networkidle2' });

    // Clic sur l'icône de recherche
    const searchIconSelector = 'svg.search.header__icon--search';
    const searchInputSelector = 'input.searchInput__input';
    const searchResultSelector = 'a.searchResult';

    await page.click(searchIconSelector);
    await page.waitForSelector(searchInputSelector, { visible: true });

    // Saisir le nom du club
    await page.type(searchInputSelector, clubName);

    // Attendre que les résultats apparaissent
    await page.waitForSelector(searchResultSelector, { visible: true });

    // Parcourir les résultats et cliquer sur le bon
    const results = await page.$$(searchResultSelector);
    for (const result of results) {
      const textContent = await page.evaluate(el => el.textContent.trim(), result);
      if (textContent.toLowerCase().includes(clubName.toLowerCase())) {
        console.log(`✅ Résultat trouvé : ${textContent}`);
        await result.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        break;
      }
    }

    // Récupérer des informations depuis la page du club
    const clubTitle = await page.title();
    const clubUrl = page.url();

    console.log(`Titre de la page : ${clubTitle}`);
    console.log(`URL : ${clubUrl}`);

    return { success: true, clubTitle, clubUrl };
  } catch (err) {
    console.error('Erreur lors de l\'exécution de Puppeteer :', err);
    return { success: false, error: err.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { scrapeFlashscoreClub };