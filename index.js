const express = require("express");
const path = require("path");
const app     = express();
app.use(express.json());

// mount your routers
const bookingRouter = require("./create-booking");
const stripeRouter  = require("./create-stripe-session");
const confirmRouter = require("./send-confirmation");
const icalRouter    = require("./ical-parser");
const calendarRouter = require("./calendar");

app.use("/create-booking",       bookingRouter);
app.use("/create-stripe-session", stripeRouter);
app.use("/send-confirmation",     confirmRouter);
app.use("/sync-calendar",         icalRouter);
app.use("/booked-dates",          calendarRouter);
app.use("/theme", express.static(path.join(__dirname, "theme-template")));

// health check
app.get("/", (req, res) => res.send("API running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
