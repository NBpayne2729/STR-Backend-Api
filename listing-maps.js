const express = require("express");

const router = express.Router();

// Basic location data for each listing. Addresses are approximate and can be
// fine-tuned to the exact property locations. Lat/Lng are useful for static
// map renders and future distance calculations.
const LISTING_LOCATIONS = {
  "phoenix-modern": {
    name: "Modern Retreat with Pool • Central Phoenix",
    address: "Phoenix, AZ 85016",
    lat: 33.5032,
    lng: -112.0248,
    zoom: 14,
  },
  "cozy-lakefront": {
    name: "Cozy Lakefront Cabin • Private Dock",
    address: "Cedar Bluff, AL 35959",
    lat: 34.2346,
    lng: -85.6058,
    zoom: 14,
  },
  "anglers-lakehouse": {
    name: "The Angler’s Canoe Lake House",
    address: "Lake Martin, AL 36853",
    lat: 32.7433,
    lng: -85.8899,
    zoom: 13,
  },
  midcentury: {
    name: "Mid-Century Modern Luxury Home",
    address: "Phoenix, AZ 85018",
    lat: 33.4985,
    lng: -111.9865,
    zoom: 14,
  },
  "desert-casita": {
    name: "Desert Casita Studio • Walkable & Quiet",
    address: "Phoenix, AZ 85018",
    lat: 33.5005,
    lng: -111.9691,
    zoom: 15,
  },
};

function buildEmbedUrl(listing, apiKey) {
  const query = listing.address || `${listing.lat},${listing.lng}`;
  const params = new URLSearchParams({ key: apiKey, q: query });
  if (listing.zoom) params.append("zoom", String(listing.zoom));
  return `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
}

router.get("/", (req, res) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing Google Maps API key" });
  }

  const data = Object.entries(LISTING_LOCATIONS).map(([id, listing]) => ({
    id,
    name: listing.name,
    address: listing.address,
    coordinates: { lat: listing.lat, lng: listing.lng },
    embedUrl: buildEmbedUrl(listing, apiKey),
  }));

  res.json({ listings: data });
});

router.get("/:listingId", (req, res) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing Google Maps API key" });
  }

  const listing = LISTING_LOCATIONS[req.params.listingId];
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  res.json({
    id: req.params.listingId,
    name: listing.name,
    address: listing.address,
    coordinates: { lat: listing.lat, lng: listing.lng },
    embedUrl: buildEmbedUrl(listing, apiKey),
  });
});

module.exports = router;
