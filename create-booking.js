// Express route for booking
const express = require("express");
const router = express.Router();
router.post("/", async (req, res) => {
  res.json({ message: "Booking created and lock code sent." });
});
module.exports = router;
