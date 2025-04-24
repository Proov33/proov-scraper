const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

const db = new sqlite3.Database(':memory:');

// Configuration de la base de données pour le cache
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS cache (team TEXT, section TEXT, data TEXT, timestamp INTEGER)');
});

app.use(express.json());

/**
 * Vérifie si les données sont en cache.
 */
const getCachedData = (team, section) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT data, timestamp FROM cache WHERE team = ? AND section = ?',
      [team, section],
      (err, row) => {
        if (err) return reject(err);
        if (row && Date.now() - row.timestamp < 86400000) { // Cache valide pendant 24 heures
          resolve(JSON.parse(row.data));
        } else {
          resolve(null);
        }
      }
    );
  });
};

/**
 * Sauvegarde les données dans le cache.
 */
const saveCachedData = (team, section, data) => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    db.run(
      'INSERT INTO cache (team, section, data, timestamp) VALUES (?, ?, ?, ?)',
      [team, section, JSON.stringify(data), timestamp],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};

/**
 * Scraping avec Puppeteer.
 */
const scrapeData = async (team, section) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('https://www.flashscore.fr/', { waitUntil: 'networkidle2' });
    
    // Recherche de l'équipe
    await page.click('svg.search.header__icon--search');
    await page.type('input.searchInput__input', team);
    await page.waitForSelector('a.searchResult', { visible: true });
    const results = await page.$$('a.searchResult');
    
    let found = false;
    for (const result of results) {
      const text = await page.evaluate((el) => el.textContent, result);
      if (text.toLowerCase().includes(team.toLowerCase())) {
        await result.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        found = true;
        break;
      }
    }

    if (!found) throw new Error('Aucun résultat trouvé.');

    // Récupération des données selon l'onglet
    let data = '';
    switch (section) {
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

    await browser.close();
    return data;
  } catch (error) {
    console.error('Erreur lors du scraping :', error);
    await browser.close();
    throw error;
  }
};

// Endpoint principal
app.post('/scrape', async (req, res) => {
  const { team, section } = req.body;

  if (!team || !section) {
    return res.status(400).json({ error: 'Les champs "team" et "section" sont requis.' });
  }

  try {
    // Vérifiez le cache
    const cachedData = await getCachedData(team, section);
    if (cachedData) {
      return res.json({ success: true, data: cachedData });
    }

    // Sinon, scrapez les données
    const data = await scrapeData(team, section);
    await saveCachedData(team, section, data);

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});