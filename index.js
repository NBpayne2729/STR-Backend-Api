const express = require("express");
const app = express();
app.use(express.json());

app.get("/", (req, res) => res.send("API running"));
app.listen(3000, () => console.log("Server running"));

const express = require("express");
const app = express();

// parse JSON bodies
app.use(express.json());

// mount your routers
const bookingRouter = require("./create-booking");
const stripeRouter  = require("./create-stripe-session");
const confirmRouter = require("./send-confirmation");
const icalRouter = require("./ical-parser");

app.use("/create-booking", bookingRouter);
app.use("/create-stripe-session", stripeRouter);
app.use("/send-confirmation", confirmRouter);
app.use("/sync-calendar", icalRouter);

// health-check
app.get("/", (req, res) => res.send("API running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
