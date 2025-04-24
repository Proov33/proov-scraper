const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

async function scrapeData(teamName, tab) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });
  const page = await browser.newPage();

  const query = encodeURIComponent(teamName);
  const tabToSite = {
    resume: `https://www.google.com/search?q=${query}+club+football`,
    joueurs: `https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${query}`,
    matchs: `https://www.flashscore.fr/recherche/?q=${query}`,
    calendrier: `https://www.flashscore.fr/recherche/?q=${query}`,
  };

  try {
    await page.goto(tabToSite[tab], { waitUntil: 'domcontentloaded' });
    let content = '';

    switch (tab) {
      case 'resume':
        content = await page.title();
        break;
      case 'joueurs':
        content = await page.evaluate(() => {
          const players = [...document.querySelectorAll('.responsive-table .items td:nth-child(2) a')];
          return players.map(p => p.innerText).join('\n');
        });
        break;
      case 'matchs':
      case 'calendrier':
        content = await page.evaluate(() => {
          return [...document.querySelectorAll('.event__match')].map(e => e.innerText).slice(0, 5).join('\n');
        });
        break;
      default:
        content = '❌ Onglet inconnu';
    }

    await browser.close();
    return content || '⚠️ Aucune donnée trouvée.';
  } catch (error) {
    await browser.close();
    throw error;
  }
}

module.exports = { scrapeData };