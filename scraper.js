
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

// Fonction pour trouver dynamiquement l'URL d'une équipe sur Flashscore
async function findTeamUrl(teamName) {
  try {
    const searchUrl = `https://www.flashscore.fr/recherche/?q=${encodeURIComponent(teamName)}`;
    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const $ = cheerio.load(data);
    const teamLink = $("a[href*='/equipe/']").first().attr('href');
    if (teamLink) {
      return `https://www.flashscore.fr${teamLink}`;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la recherche d'équipe :", error.message);
    return null;
  }
}

// Exemple d'utilisation : récupération des 5 derniers matchs
app.get('/matches/:team', async (req, res) => {
  const team = req.params.team;
  const teamUrl = await findTeamUrl(team);
  if (!teamUrl) return res.status(404).json({ error: 'Équipe introuvable.' });

  try {
    const { data } = await axios.get(teamUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);
    const matches = [];

    $('div.event__match').slice(0, 5).each((i, el) => {
      const home = $(el).find('.event__participant--home').text();
      const away = $(el).find('.event__participant--away').text();
      const score = $(el).find('.event__scores span').text();
      matches.push({ home, away, score });
    });

    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du scraping.' });
  }
});

app.get('/', (req, res) => {
  res.send('Scraper Flashscore opérationnel.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
