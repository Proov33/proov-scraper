const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async function getClubData(teamName) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(teamName)}+club+football`;
  const { data } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  });

  const $ = cheerio.load(data);
  const summary = $("div.BNeawe.s3v9rd.AP7Wnd").first().text();
  return {
    team: teamName,
    summary: summary || "Aucune information trouvée."
  };
};