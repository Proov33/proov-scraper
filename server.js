// server.js
const express = require("express");
const cors = require("cors");
const { scrapeResume, scrapePlayers, scrapeMatches, scrapeFixtures } = require("./scraper");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/resume", async (req, res) => {
  const team = req.query.team;
  if (!team) return res.status(400).send("Missing team name");
  try {
    const data = await scrapeResume(team);
    res.send(data);
  } catch (err) {
    res.status(500).send("Erreur lors du scraping du résumé.");
  }
});

app.get("/players", async (req, res) => {
  const team = req.query.team;
  if (!team) return res.status(400).send("Missing team name");
  try {
    const data = await scrapePlayers(team);
    res.send(data);
  } catch (err) {
    res.status(500).send("Erreur lors du scraping des joueurs.");
  }
});

app.get("/matches", async (req, res) => {
  const team = req.query.team;
  if (!team) return res.status(400).send("Missing team name");
  try {
    const data = await scrapeMatches(team);
    res.send(data);
  } catch (err) {
    res.status(500).send("Erreur lors du scraping des matchs.");
  }
});

app.get("/fixtures", async (req, res) => {
  const team = req.query.team;
  if (!team) return res.status(400).send("Missing team name");
  try {
    const data = await scrapeFixtures(team);
    res.send(data);
  } catch (err) {
    res.status(500).send("Erreur lors du scraping du calendrier.");
  }
});

app.listen(PORT, () => console.log("✅ Serveur lancé sur le port", PORT));
