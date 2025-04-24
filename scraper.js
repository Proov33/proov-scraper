const puppeteer = require('puppeteer');

async function searchTeamUrl(teamName) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.goto('https://www.flashscore.fr/', { waitUntil: 'domcontentloaded' });
  await page.type('input[type="search"]', teamName);
  await page.waitForTimeout(2000);

  const link = await page.evaluate(() => {
    const anchor = document.querySelector('a[href*="/equipe/"]');
    return anchor ? anchor.href : null;
  });

  await browser.close();
  return link;
}

async function getMatches(req, res) {
  try {
    const { team } = req.params;
    const teamUrl = await searchTeamUrl(team);
    if (!teamUrl) return res.status(404).json({ error: 'Équipe introuvable.' });

    // logique de scraping des matchs ici
    return res.json({ message: `Matchs pour ${team}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du scraping des matchs' });
  }
}

async function getPlayers(req, res) {
  try {
    const { team } = req.params;
    const teamUrl = await searchTeamUrl(team);
    if (!teamUrl) return res.status(404).json({ error: 'Équipe introuvable.' });

    // logique de scraping des joueurs ici
    return res.json({ message: `Joueurs pour ${team}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du scraping des joueurs' });
  }
}

async function getSummary(req, res) {
  res.json({ message: "Résumé non encore implémenté." });
}

async function getStats(req, res) {
  res.json({ message: "Statistiques non encore implémentées." });
}

async function getRanking(req, res) {
  res.json({ message: "Classement non encore implémenté." });
}

module.exports = {
  getMatches,
  getPlayers,
  getSummary,
  getStats,
  getRanking,
};
