const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 3600 }); // Cache avec une durée de vie de 1 heure

async function autoScrape(teamName, tab) {
  const cacheKey = `${teamName}-${tab}`;
  
  // Vérifie si les données sont déjà en cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`✅ Données récupérées depuis le cache pour ${teamName}, onglet ${tab}`);
    return cachedData;
  }

  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless
    });

    const page = await browser.newPage();

    // Étape 1 : Rechercher l'équipe sur Flashscore
    const searchUrl = `https://www.flashscore.fr/recherche/?q=${encodeURIComponent(teamName)}`;
    console.log(`🔍 Recherche pour l'équipe : ${teamName}`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    // Vérifier si une équipe correspondante est trouvée
    const teamLinkSelector = 'a[href*="/equipe/"]';
    const isTeamFound = await page.$(teamLinkSelector);
    if (!isTeamFound) {
      return `❌ Aucun résultat trouvé pour "${teamName}".`;
    }

    // Étape 2 : Extraire l'URL de l'équipe
    const teamUrl = await page.$eval(teamLinkSelector, el => el.href);
    console.log(`🌐 URL de l'équipe : ${teamUrl}`);
    await page.goto(teamUrl, { waitUntil: 'networkidle2' });

    // Étape 3 : Scraping en fonction de l'onglet
    let result = '';
    console.log(`📄 Scraping de l'onglet : ${tab}`);
    switch (tab) {
      case 'joueurs': // Effectif des joueurs
        result = await page.evaluate(() => {
          const players = Array.from(document.querySelectorAll('.player-name'));
          return players.map(el => el.textContent.trim()).join('\n') || "Aucun joueur trouvé.";
        });
        break;

      case 'matchs': // Derniers matchs
        result = await page.evaluate(() => {
          const matches = Array.from(document.querySelectorAll('.event__match'));
          return matches.map(el => el.textContent.trim()).join('\n') || "Aucun match trouvé.";
        });
        break;

      case 'calendrier': // Prochains matchs
        result = await page.evaluate(() => {
          const upcoming = Array.from(document.querySelectorAll('.event__match--scheduled'));
          return upcoming.map(el => el.textContent.trim()).join('\n') || "Aucun match à venir trouvé.";
        });
        break;

      case 'resume': // Résumé général
      default:
        result = `✅ Infos trouvées pour ${teamName}.\nURL: ${teamUrl}`;
        break;
    }

    // Mise en cache des résultats
    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error("Erreur de scraping :", err);
    return "❌ Une erreur s'est produite lors du scraping.";
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = autoScrape;