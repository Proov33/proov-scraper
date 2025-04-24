const { chromium } = require('playwright');

async function scrapeFlashscoreClub(clubName) {
  let browser;
  try {
    console.log(`Lancement de la recherche pour le club : ${clubName}`);

    // Lancer le navigateur Chromium en mode headless
    browser = await chromium.launch({
      headless: true, // Mode sans interface graphique
    });

    const page = await browser.newPage();

    // Navigation vers Flashscore
    await page.goto('https://www.flashscore.fr/', { waitUntil: 'networkidle' });

    // Clic sur l'icône de recherche
    const searchIconSelector = 'svg.search.header__icon--search';
    const searchInputSelector = 'input.searchInput__input';
    const searchResultSelector = 'a.searchResult';

    await page.click(searchIconSelector);
    await page.waitForSelector(searchInputSelector, { visible: true });

    // Saisir le nom du club
    await page.fill(searchInputSelector, clubName);

    // Attendre que les résultats apparaissent
    await page.waitForSelector(searchResultSelector, { visible: true });

    // Parcourir les résultats et cliquer sur le bon
    const results = await page.$$(searchResultSelector);
    let found = false; // Indicateur pour vérifier si le club est trouvé
    for (const result of results) {
      const textContent = await result.textContent();
      if (textContent.toLowerCase().includes(clubName.toLowerCase())) {
        console.log(`✅ Résultat trouvé : ${textContent}`);
        await result.click();
        await page.waitForNavigation({ waitUntil: 'networkidle' });
        found = true;
        break;
      }
    }

    if (!found) {
      console.log('❌ Aucun résultat trouvé pour ce club.');
      return { success: false, error: 'Aucun résultat trouvé pour ce club.' };
    }

    // Récupérer des informations depuis la page du club
    const clubTitle = await page.title();
    const clubUrl = page.url();

    console.log(`Titre de la page : ${clubTitle}`);
    console.log(`URL : ${clubUrl}`);

    return { success: true, clubTitle, clubUrl };
  } catch (err) {
    console.error("Erreur lors de l'exécution de Playwright :", err);
    return { success: false, error: err.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { scrapeFlashscoreClub };