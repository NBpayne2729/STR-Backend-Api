const express = require("express");
const router = express.Router();

// Dummy calendar parser
async function syncCalendar(icalUrl) {
  return [{ guestName: "Test", checkIn: "2025-09-01", checkOut: "2025-09-05" }];
}

router.post("/", async (req, res) => {
  const { icalUrl } = req.body || {};

  if (!icalUrl) {
    return res.status(400).json({ error: "icalUrl is required" });
  }

  const bookings = await syncCalendar(icalUrl);
  return res.json({ bookings });
});

module.exports = router;
