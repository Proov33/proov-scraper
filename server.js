const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { scrapeData } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

app.post('/scrape', async (req, res) => {
  const { teamName, tab } = req.body;

  if (!teamName || !tab) {
    return res.status(400).json({ error: 'Missing teamName or tab' });
  }

  try {
    const result = await scrapeData(teamName, tab);
    res.json({ data: result });
  } catch (error) {
    console.error(`Erreur scraping [${tab}] pour "${teamName}" :`, error);
    res.status(500).json({ error: 'Erreur lors du scraping.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});