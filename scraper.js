const puppeteer = require('puppeteer');

async function scrapeFlashscoreClub(clubName, tab) {
  let browser;
  try {
    console.log(`Recherche pour le club "${clubName}" sur l'onglet "${tab}"`);

    // Lancer le navigateur Chromium
    browser = await puppeteer.launch({
      headless: true, // Mode sans interface graphique
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Nécessaire pour certains environnements comme Render
    });

    const page = await browser.newPage();
    await page.goto('https://www.flashscore.fr/', { waitUntil: 'networkidle2' });

    // Clic sur l'icône de recherche
    const searchIconSelector = 'svg.search.header__icon--search';
    const searchInputSelector = 'input.searchInput__input';
    const searchResultSelector = 'a.searchResult';

    console.log('Clic sur l\'icône de recherche...');
    await page.click(searchIconSelector);

    console.log('Attente de la barre de recherche...');
    await page.waitForSelector(searchInputSelector, { visible: true });

    console.log('Saisie du nom du club...');
    await page.type(searchInputSelector, clubName);

    console.log('Attente des résultats de recherche...');
    await page.waitForSelector(searchResultSelector, { visible: true });

    // Parcourir les résultats et cliquer sur le premier résultat correspondant
    console.log('Recherche du club dans les résultats...');
    const results = await page.$$(searchResultSelector);
    let found = false;
    for (const result of results) {
      const textContent = await page.evaluate(el => el.textContent, result);
      if (textContent.toLowerCase().includes(clubName.toLowerCase())) {
        console.log(`✅ Résultat trouvé : ${textContent}`);
        await result.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        found = true;
        break;
      }
    }

    if (!found) {
      console.log('❌ Aucun résultat trouvé pour ce club.');
      return { success: false, error: 'Aucun résultat trouvé pour ce club.' };
    }

    // Extraire les informations en fonction de l'onglet sélectionné
    let data = '';
    switch (tab) {
      case 'resume':
        data = await page.evaluate(() => document.querySelector('.teamHeader__name')?.textContent || 'Résumé indisponible.');
        break;
      case 'joueurs':
        data = await page.evaluate(() => document.querySelector('.player-list')?.textContent || 'Liste des joueurs indisponible.');
        break;
      case 'matchs':
        data = await page.evaluate(() => document.querySelector('.matches-list')?.textContent || 'Liste des matchs indisponible.');
        break;
      case 'calendrier':
        data = await page.evaluate(() => document.querySelector('.calendar')?.textContent || 'Calendrier indisponible.');
        break;
      default:
        data = 'Onglet non pris en charge.';
    }

    console.log(`📋 Données récupérées : ${data}`);
    return { success: true, data };
  } catch (err) {
    console.error("Erreur lors de l'exécution de Puppeteer :", err);
    return { success: false, error: err.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { scrapeFlashscoreClub };