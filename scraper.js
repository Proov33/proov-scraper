const { chromium } = require('playwright');

async function scrapeFlashscoreClub(clubName, tab) {
  let browser;
  try {
    console.log(`Recherche pour le club "${clubName}" sur l'onglet "${tab}"`);

    // Lancer le navigateur Chromium
    browser = await chromium.launch({ headless: true });

    const page = await browser.newPage();
    await page.goto('https://www.flashscore.fr/', { waitUntil: 'networkidle' });

    // Clic sur l'icône de recherche
    const searchIconSelector = 'svg.search.header__icon--search';
    const searchInputSelector = 'input.searchInput__input';
    const searchResultSelector = 'a.searchResult';

    await page.click(searchIconSelector);
    await page.waitForSelector(searchInputSelector, { visible: true });
    await page.fill(searchInputSelector, clubName);

    // Attendre que les résultats apparaissent
    await page.waitForSelector(searchResultSelector, { visible: true });

    // Cliquer sur le premier résultat correspondant
    const results = await page.$$(searchResultSelector);
    let found = false;
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

    // Récupérer les informations en fonction de l'onglet
    let data = '';
    switch (tab) {
      case 'resume':
        data = await page.textContent('.teamHeader__name');
        break;
      case 'joueurs':
        data = await page.textContent('.player-list');
        break;
      case 'matchs':
        data = await page.textContent('.matches-list');
        break;
      case 'calendrier':
        data = await page.textContent('.calendar');
        break;
      default:
        data = 'Onglet non pris en charge.';
    }

    console.log(`📋 Données récupérées : ${data}`);
    return { success: true, data };
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