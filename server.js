const express = require('express');
const cors = require('cors');
const scraperRoutes = require('./scraper'); // Assure-toi que le fichier s'appelle bien scraper.js

const app = express();
const PORT = process.env.PORT || 3000; // Render fournit automatiquement un PORT

app.use(cors());
app.use(express.json());
app.use('/', scraperRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
