const express = require("express");
const router = express.Router();

const properties = [
  {
    id: "prop_101",
    slug: "seaside-loft",
    name: "Seaside Loft",
    location: "Miami Beach, FL",
    nightlyRate: 249,
    cleaningFee: 95,
    capacity: 4,
    amenities: ["WiFi", "Pool", "Air Conditioning", "Washer/Dryer"],
    images: ["/images/seaside-loft-1.jpg", "/images/seaside-loft-2.jpg"],
  },
  {
    id: "prop_102",
    slug: "mountain-cabin",
    name: "Mountain Cabin Retreat",
    location: "Asheville, NC",
    nightlyRate: 199,
    cleaningFee: 85,
    capacity: 6,
    amenities: ["WiFi", "Hot Tub", "Fireplace", "Full Kitchen"],
    images: ["/images/mountain-cabin-1.jpg", "/images/mountain-cabin-2.jpg"],
  },
];

const unavailableDatesByProperty = {
  prop_101: ["2026-05-15", "2026-05-16", "2026-05-17"],
  prop_102: ["2026-06-01", "2026-06-02"],
};

const bookings = [];

function eachDate(startDate, endDate) {
  const days = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current < end) {
    days.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

router.get("/properties", (req, res) => {
  res.json({ data: properties });
});

router.get("/properties/:id", (req, res) => {
  const property = properties.find((p) => p.id === req.params.id || p.slug === req.params.id);

  if (!property) {
    return res.status(404).json({ error: "Property not found" });
  }

  return res.json({ data: property });
});

router.get("/availability", (req, res) => {
  const { propertyId, checkIn, checkOut } = req.query;

  if (!propertyId || !checkIn || !checkOut) {
    return res.status(400).json({ error: "propertyId, checkIn, and checkOut are required" });
  }

  const blocked = unavailableDatesByProperty[propertyId] || [];
  const requestedDates = eachDate(checkIn, checkOut);
  const conflicts = requestedDates.filter((day) => blocked.includes(day));

  return res.json({
    data: {
      propertyId,
      checkIn,
      checkOut,
      available: conflicts.length === 0,
      conflicts,
    },
  });
});

router.post("/bookings", (req, res) => {
  const { propertyId, guestName, email, checkIn, checkOut, guests } = req.body;

  if (!propertyId || !guestName || !email || !checkIn || !checkOut || !guests) {
    return res.status(400).json({ error: "propertyId, guestName, email, checkIn, checkOut, and guests are required" });
  }

  const property = properties.find((p) => p.id === propertyId);

  if (!property) {
    return res.status(404).json({ error: "Property not found" });
  }

  if (guests > property.capacity) {
    return res.status(400).json({ error: `Maximum guest capacity is ${property.capacity}` });
  }

  const requestedDates = eachDate(checkIn, checkOut);
  const blocked = unavailableDatesByProperty[propertyId] || [];
  const conflicts = requestedDates.filter((day) => blocked.includes(day));

  if (conflicts.length > 0) {
    return res.status(409).json({ error: "Selected dates are unavailable", conflicts });
  }

  unavailableDatesByProperty[propertyId] = [...blocked, ...requestedDates];

  const booking = {
    id: `bk_${Date.now()}`,
    propertyId,
    guestName,
    email,
    checkIn,
    checkOut,
    guests,
    status: "pending_payment",
    createdAt: new Date().toISOString(),
  };

  bookings.push(booking);

  return res.status(201).json({ data: booking });
});

router.get("/bookings", (req, res) => {
  res.json({ data: bookings });
});

module.exports = router;
