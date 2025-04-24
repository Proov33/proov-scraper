const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeResume(team) {
  return `Résumé de l'équipe ${team} non disponible pour le moment.`;
}

async function scrapePlayers(team) {
  try {
    const url = `https://www.flashscore.fr/equipe/${team.toLowerCase().replace(/\s+/g, '-')}/alignement/`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const players = [];

    $('.event__participant--home').each((i, el) => {
      players.push($(el).text().trim());
    });

    if (players.length === 0) {
      return 'Aucun joueur trouvé ou format de page modifié.';
    }

    return players.map(p => `- ${p}`).join('\n');
  } catch (error) {
    return 'Erreur lors du scraping des joueurs.';
  }
}

async function scrapeMatches(team) {
  try {
    const url = `https://www.flashscore.fr/equipe/${team.toLowerCase().replace(/\s+/g, '-')}/resultats/`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const matches = [];

    $('.event__match').each((i, el) => {
      const home = $(el).find('.event__participant--home').text().trim();
      const away = $(el).find('.event__participant--away').text().trim();
      const score = $(el).find('.event__score--ft').text().trim();
      if (home && away && score) {
        matches.push(`${home} ${score} ${away}`);
      }
    });

    if (matches.length === 0) {
      return 'Aucun match trouvé.';
    }

    return matches.slice(0, 5).join('\n');
  } catch (error) {
    return 'Erreur lors du scraping des matchs.';
  }
}

async function scrapeFixtures(team) {
  try {
    const url = `https://www.flashscore.fr/equipe/${team.toLowerCase().replace(/\s+/g, '-')}/programme/`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const fixtures = [];

    $('.event__match').each((i, el) => {
      const home = $(el).find('.event__participant--home').text().trim();
      const away = $(el).find('.event__participant--away').text().trim();
      const time = $(el).find('.event__time').text().trim();
      if (home && away && time) {
        fixtures.push(`${home} vs ${away} à ${time}`);
      }
    });

    if (fixtures.length === 0) {
      return 'Aucune rencontre à venir trouvée.';
    }

    return fixtures.slice(0, 5).join('\n');
  } catch (error) {
    return 'Erreur lors du scraping du calendrier.';
  }
}

module.exports = {
  scrapeResume,
  scrapePlayers,
  scrapeMatches,
  scrapeFixtures,
};
