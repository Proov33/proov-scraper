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
  let page = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless
    });

    page = await browser.newPage();

    const searchUrl = `https://www.flashscore.fr/recherche/?q=${encodeURIComponent(teamName)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    await page.waitForSelector('a[href*="/equipe/"]', { timeout: 10000 });
    const teamUrl = await page.$eval('a[href*="/equipe/"]', el => el.href);

    await page.goto(teamUrl, { waitUntil: 'networkidle2' });

    let result = '';
    switch (tab) {
      case 'joueurs':
        result = await page.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('.player-name'));
          return rows.map(el => el.textContent.trim()).join('\n');
        });
        break;

      case 'matchs':
        result = await page.evaluate(() => {
          const matchs = Array.from(document.querySelectorAll('.event__match'));
          return matchs.map(el => el.textContent.trim()).join('\n');
        });
        break;

      case 'calendrier':
        result = await page.evaluate(() => {
          const upcoming = Array.from(document.querySelectorAll('.event__match--scheduled'));
          return upcoming.map(el => el.textContent.trim()).join('\n');
        });
        break;

      case 'resume':
      default:
        result = `✅ Infos trouvées pour ${teamName}.\nURL: ${teamUrl}`;
        break;
    }

    // Met les données en cache
    cache.set(cacheKey, result);
    return result || "❌ Aucune donnée trouvée.";
  } catch (err) {
    console.error("Scraping error:", err);
    return "❌ Erreur lors du scraping.";
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = autoScrape;