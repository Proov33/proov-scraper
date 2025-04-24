const express = require('express');
const puppeteer = require('puppeteer-core');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const CHROME_EXECUTABLE = process.env.CHROME_EXECUTABLE || '/usr/bin/google-chrome-stable';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Helper function to launch Puppeteer
async function launchBrowser() {
  return puppeteer.launch({
    headless: true,
    executablePath: CHROME_EXECUTABLE,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process',
      '--no-zygote',
    ],
  });
}

// Endpoint to scrape data for specific sections (e.g., calendrier, live)
app.post('/scrape', async (req, res) => {
  const { team, section } = req.body;

  if (!team || !section) {
    return res.status(400).json({ success: false, error: 'Team name and section are required.' });
  }

  try {
    const browser = await launchBrowser();
    const page = await browser.newPage();

    // URL configuration for scraping based on section
    const urlMap = {
      calendrier: `https://www.flashscore.com/team/${team}/fixtures/`,
      live: `https://www.flashscore.com/live/`,
      joueurs: `https://www.flashscore.com/team/${team}/squad/`,
      resume: `https://www.flashscore.com/team/${team}/overview/`,
      paris: `https://www.flashscore.com/team/${team}/betting/`,
    };

    const url = urlMap[section];
    if (!url) {
      await browser.close();
      return res.status(400).json({ success: false, error: 'Invalid section provided.' });
    }

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Scraping logic
    let data;
    if (section === 'calendrier') {
      data = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.event__match')).map(match => ({
          date: match.querySelector('.event__time').textContent.trim(),
          homeTeam: match.querySelector('.event__participant--home').textContent.trim(),
          awayTeam: match.querySelector('.event__participant--away').textContent.trim(),
          score: match.querySelector('.event__scores')?.textContent.trim() || 'À venir',
        }));
      });
    } else if (section === 'live') {
      data = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.event__match')).map(match => ({
          homeTeam: match.querySelector('.event__participant--home').textContent.trim(),
          awayTeam: match.querySelector('.event__participant--away').textContent.trim(),
          score: match.querySelector('.event__scores')?.textContent.trim() || 'N/A',
          time: match.querySelector('.event__stage--time')?.textContent.trim() || '',
        }));
      });
    } else {
      // General scraping for other sections
      data = await page.content();
    }

    await browser.close();

    // Respond with scraped data
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Scraping error:', error);
    return res.status(500).json({ success: false, error: 'Scraping failed. Please try again.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});