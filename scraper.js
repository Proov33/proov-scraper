const axios = require('axios');
const cheerio = require('cheerio');

async function scrape(type, team) {
  switch (type) {
    case 'matchs':
      return await scrapeMatchs(team);
    case 'joueurs':
      return await scrapeJoueurs(team);
    case 'classement':
      return await scrapeClassement();
    case 'resume':
      return await scrapeResume(team);
    case 'statistiques':
      return await scrapeStats(team);
    default:
      throw new Error('Type non supporté');
  }
}

async function scrapeMatchs(team) {
  // Ex: Flashscore scraping (simulé ici)
  return [`📅 Match à venir pour ${team}`];
}

async function scrapeJoueurs(team) {
  return [`👕 Joueurs principaux de ${team}`];
}

async function scrapeClassement() {
  return ['🏆 Classement simulé'];
}

async function scrapeResume(team) {
  return [`📰 Résumé du dernier match de ${team}`];
}

async function scrapeStats(team) {
  return [`📊 Statistiques de ${team}`];
}

module.exports = { scrape };