
const puppeteer = require("puppeteer-core");

async function scrapeData(team, tab) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: process.env.CHROME_BIN || '/usr/bin/chromium-browser'
  });
  const page = await browser.newPage();
  let url = "";

  if (tab === 'resume') {
    url = `https://www.flashscore.fr/recherche/?q=${encodeURIComponent(team)}`;
  } else if (tab === 'joueurs') {
    url = `https://www.transfermarkt.fr/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(team)}`;
  } else if (tab === 'matchs' || tab === 'calendrier') {
    url = `https://www.sofascore.com/fr/search/${encodeURIComponent(team)}`;
  }

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

  const content = await page.content();
  await browser.close();

  return content.slice(0, 500);  // pour test
}

module.exports = { scrapeData };
