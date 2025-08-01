// Express route for Stripe session
const express = require("express");
const router = express.Router();
router.post("/", async (req, res) => {
  res.json({ url: "https://checkout.stripe.com/test-session" });
});
module.exports = router;
