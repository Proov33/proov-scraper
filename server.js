const express = require("express");
const app = express();
const scraper = require("./scraper");

app.get("/club/:team", async (req, res) => {
  try {
    const data = await scraper(req.params.team);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});