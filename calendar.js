const express = require("express");
const ical    = require("node-ical");
const router  = express.Router();

// Helper to fetch & parse one ICS URL
async function fetchEvents(icalUrl) {
  const data   = await ical.async.fromURL(icalUrl);
  return Object.values(data)
    .filter(e => e.type === "VEVENT")
    .map(e => ({
      title: "Booked",
      start: e.start.toISOString(),
      end:   e.end?.toISOString()   // some events might not have end
    }));
}

// GET /booked-dates
router.get("/", async (req, res) => {
  try {
    const urls = [
      process.env.AIRBNB_ICAL_URL,
      process.env.VRBO_ICAL_URL,
      // add more ICS feeds here
    ].filter(Boolean);

    // fetch & flatten all events
    const batches = await Promise.all(urls.map(fetchEvents));
    const events  = batches.flat();

    res.json(events);
  } catch (err) {
    console.error("Calendar error:", err);
    res.status(500).json({ error: "Failed to load calendar" });
  }
});

module.exports = router;
