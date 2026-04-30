const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>STR API Interactive Preview</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 2rem; max-width: 900px; }
      h1 { margin-bottom: 0.5rem; }
      .card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
      label { display: block; margin: 0.4rem 0 0.15rem; font-weight: 600; }
      input, button { padding: 0.5rem; border-radius: 6px; border: 1px solid #ccc; }
      input { width: 100%; box-sizing: border-box; }
      button { cursor: pointer; margin-top: 0.5rem; }
      pre { background: #111; color: #0f0; padding: 1rem; border-radius: 8px; overflow: auto; }
      .row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    </style>
  </head>
  <body>
    <h1>STR API Interactive Preview</h1>
    <p>Use this page to test the new MVP endpoints directly from your browser.</p>

    <div class="card">
      <h2>1) Get Properties</h2>
      <button onclick="getProperties()">GET /api/properties</button>
    </div>

    <div class="card">
      <h2>2) Check Availability</h2>
      <div class="row">
        <div><label>propertyId</label><input id="propertyId" value="prop_101" /></div>
        <div><label>checkIn</label><input id="checkIn" value="2026-05-15" /></div>
      </div>
      <label>checkOut</label><input id="checkOut" value="2026-05-18" />
      <button onclick="checkAvailability()">GET /api/availability</button>
    </div>

    <div class="card">
      <h2>3) Create Booking</h2>
      <div class="row">
        <div><label>propertyId</label><input id="bPropertyId" value="prop_102" /></div>
        <div><label>guestName</label><input id="guestName" value="Alex Doe" /></div>
      </div>
      <div class="row">
        <div><label>email</label><input id="email" value="alex@example.com" /></div>
        <div><label>guests</label><input id="guests" type="number" value="2" /></div>
      </div>
      <div class="row">
        <div><label>checkIn</label><input id="bCheckIn" value="2026-06-10" /></div>
        <div><label>checkOut</label><input id="bCheckOut" value="2026-06-12" /></div>
      </div>
      <button onclick="createBooking()">POST /api/bookings</button>
    </div>

    <div class="card">
      <h2>Response</h2>
      <pre id="out">Click a button to call an endpoint.</pre>
    </div>

    <script>
      function render(data) {
        document.getElementById('out').textContent = JSON.stringify(data, null, 2);
      }

      async function getProperties() {
        const res = await fetch('/api/properties');
        render(await res.json());
      }

      async function checkAvailability() {
        const propertyId = document.getElementById('propertyId').value;
        const checkIn = document.getElementById('checkIn').value;
        const checkOut = document.getElementById('checkOut').value;
        const res = await fetch('/api/availability?propertyId=' + encodeURIComponent(propertyId) + '&checkIn=' + encodeURIComponent(checkIn) + '&checkOut=' + encodeURIComponent(checkOut));
        render(await res.json());
      }

      async function createBooking() {
        const payload = {
          propertyId: document.getElementById('bPropertyId').value,
          guestName: document.getElementById('guestName').value,
          email: document.getElementById('email').value,
          guests: Number(document.getElementById('guests').value),
          checkIn: document.getElementById('bCheckIn').value,
          checkOut: document.getElementById('bCheckOut').value
        };

        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        render(await res.json());
      }
    </script>
  </body>
</html>`);
});

module.exports = router;
