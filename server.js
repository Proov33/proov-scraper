
const express = require("express");
const cors = require("cors");
const { scrapeData } = require("./scraper");

const app = express();
app.use(cors());

app.get("/scrape", async (req, res) => {
  const { team, tab } = req.query;
  if (!team || !tab) return res.status(400).json({ error: "Paramètres requis manquants." });

  try {
    const result = await scrapeData(team, tab);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors du scraping." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
