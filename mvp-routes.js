const express = require("express");
const router = express.Router();

const channels = [
  { id: "ch_direct", name: "Direct", type: "direct", active: true },
  { id: "ch_airbnb", name: "Airbnb", type: "ota", active: true },
  { id: "ch_vrbo", name: "VRBO", type: "ota", active: true },
  { id: "ch_manual", name: "Manual", type: "manual", active: true },
];

const owners = [
  {
    owner_id: "owner_001",
    name: "JRNP Rentals",
    email: "ops@jrnprentals.com",
    phone: "(555) 010-1001",
    company: "JRNP Rentals LLC",
    payout_preference: "bank_transfer",
    status: "active",
    internal_notes: "Primary management entity",
  },
];

const properties = [
  {
    id: "prop_101",
    slug: "seaside-loft",
    name: "Seaside Loft",
    status: "active",
    location: "Miami Beach, FL",
    address: "101 Ocean Ave, Miami Beach, FL",
    nightlyRate: 249,
    cleaningFee: 95,
    capacity: 4,
    amenities: ["WiFi", "Pool", "Air Conditioning", "Washer/Dryer"],
    images: ["/images/seaside-loft-1.jpg", "/images/seaside-loft-2.jpg"],
    owner_id: "owner_001",
    market: "South Florida",
    channels: ["direct", "airbnb"],
    sync_status: "healthy",
  },
  {
    id: "prop_102",
    slug: "mountain-cabin",
    name: "Mountain Cabin Retreat",
    status: "active",
    location: "Asheville, NC",
    address: "58 Ridge Ln, Asheville, NC",
    nightlyRate: 199,
    cleaningFee: 85,
    capacity: 6,
    amenities: ["WiFi", "Hot Tub", "Fireplace", "Full Kitchen"],
    images: ["/images/mountain-cabin-1.jpg", "/images/mountain-cabin-2.jpg"],
    owner_id: "owner_001",
    market: "Blue Ridge",
    channels: ["direct", "vrbo"],
    sync_status: "needs_attention",
  },
];

const propertyChannelLinks = [
  {
    id: "pcl_1",
    property_id: "prop_101",
    channel_id: "ch_airbnb",
    listing_url: "https://www.airbnb.com/rooms/example-101",
    import_ical_url: "",
    export_ical_url: "https://jrnprentals.com/ical/prop_101.ics",
    sync_enabled: false,
    last_synced_at: null,
    sync_status: "missing_ical",
  },
];

const bookings = [];
const calendarEvents = [];
const cleaningTasks = [];
const maintenanceItems = [];
const messages = [];

const unavailableDatesByProperty = {
  prop_101: ["2026-05-15", "2026-05-16", "2026-05-17"],
  prop_102: ["2026-06-01", "2026-06-02"],
};

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

function getProperty(propertyId) {
  return properties.find((p) => p.id === propertyId || p.slug === propertyId);
}

router.get("/properties", (req, res) => {
  const { propertyId = "all" } = req.query;
  const data = propertyId === "all" ? properties : properties.filter((p) => p.id === propertyId);
  res.json({ data });
});

router.get("/properties/:id", (req, res) => {
  const property = getProperty(req.params.id);
  if (!property) return res.status(404).json({ error: "Property not found" });

  const propertyBookings = bookings.filter((b) => b.property_id === property.id);
  const propertyCleanings = cleaningTasks.filter((t) => t.property_id === property.id);
  const propertyMaintenance = maintenanceItems.filter((m) => m.property_id === property.id);

  return res.json({
    data: {
      ...property,
      overview: {
        upcoming_check_in: propertyBookings.find((b) => b.status !== "cancelled") || null,
        pending_booking_requests: propertyBookings.filter((b) => b.status === "pending").length,
        cleaning_tasks_due: propertyCleanings.filter((t) => t.status !== "completed").length,
        maintenance_issues: propertyMaintenance.filter((m) => m.status !== "completed").length,
      },
    },
  });
});

router.get("/properties/:id/dashboard", (req, res) => {
  const property = getProperty(req.params.id);
  if (!property) return res.status(404).json({ error: "Property not found" });

  res.json({
    data: {
      header: {
        property_name: property.name,
        status: property.status,
        address: property.address,
        source_badges: property.channels,
        calendar_sync_status: property.sync_status,
      },
      tabs: ["overview", "bookings", "calendar", "guests", "messages", "cleaning", "maintenance", "photos", "pricing", "financials", "owner", "settings"],
      quick_actions: [
        "add_booking",
        "sync_calendar",
        "add_cleaning_task",
        "add_maintenance_task",
        "send_guest_message",
        "edit_listing",
        "upload_photo",
        "view_financials",
      ],
    },
  });
});

router.get("/bookings", (req, res) => {
  const { propertyId, source, status } = req.query;
  let data = [...bookings];
  if (propertyId && propertyId !== "all") data = data.filter((b) => b.property_id === propertyId);
  if (source) data = data.filter((b) => b.source === source);
  if (status) data = data.filter((b) => b.status === status);
  res.json({ data });
});

router.post("/bookings", (req, res) => {
  const { propertyId, guestName, email, checkIn, checkOut, guests, source = "direct" } = req.body;
  if (!propertyId || !guestName || !email || !checkIn || !checkOut || !guests) {
    return res.status(400).json({ error: "propertyId, guestName, email, checkIn, checkOut, and guests are required" });
  }

  const property = properties.find((p) => p.id === propertyId);
  if (!property) return res.status(404).json({ error: "Property not found" });
  if (guests > property.capacity) return res.status(400).json({ error: `Maximum guest capacity is ${property.capacity}` });

  const requestedDates = eachDate(checkIn, checkOut);
  const blocked = unavailableDatesByProperty[propertyId] || [];
  const conflicts = requestedDates.filter((day) => blocked.includes(day));
  if (conflicts.length > 0) return res.status(409).json({ error: "Selected dates are unavailable", conflicts });

  unavailableDatesByProperty[propertyId] = [...blocked, ...requestedDates];

  const booking = {
    booking_id: `bk_${Date.now()}`,
    property_id: propertyId,
    owner_id: property.owner_id,
    guest_id: `guest_${Date.now()}`,
    guest_name: guestName,
    email,
    source,
    check_in: checkIn,
    check_out: checkOut,
    status: source === "direct" ? "pending" : "confirmed",
    payment_status: "unpaid",
    total: 0,
    cleaning_fee: property.cleaningFee,
    platform_fee: 0,
    management_commission: 0,
    owner_payout: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  bookings.push(booking);
  res.status(201).json({ data: booking, toast: "Changes saved successfully." });
});

router.get("/admin-premium/sidebar", (req, res) => {
  res.json({
    data: [
      "Dashboard", "Properties", "Bookings", "Calendar", "Guests", "Cleanings", "Maintenance", "Messages", "Analytics", "Payments", "Owners", "Reports", "Integrations", "Settings",
    ],
  });
});

router.get("/admin-premium/analytics", (req, res) => {
  const { propertyId = "all", source = "all" } = req.query;
  const filtered = bookings.filter((b) => (propertyId === "all" || b.property_id === propertyId) && (source === "all" || b.source === source));
  res.json({
    data: {
      filters: { propertyId, source },
      metrics: {
        bookings: filtered.length,
        gross_revenue: filtered.reduce((sum, b) => sum + (b.total || 0), 0),
        occupancy: filtered.length ? 75 : 0,
        adr: filtered.length ? 220 : 0,
        revpar: filtered.length ? 165 : 0,
      },
      empty_state: filtered.length === 0 ? "No analytics for selected date range." : null,
    },
  });
});

router.post("/admin-premium/actions/:action", (req, res) => {
  const action = req.params.action;
  const supported = new Set([
    "view_booking", "edit_booking", "approve_booking", "decline_booking", "send_payment_link", "sync_calendar",
    "add_ical_link", "copy_direct_ical_export", "open_guest_profile", "send_message", "reply_message", "assign_cleaner",
    "mark_cleaned", "add_cleaning_task", "add_maintenance_task", "update_maintenance_status", "upload_photo",
    "edit_property", "save_pricing", "save_fees", "save_house_rules", "save_guest_info", "save_owner_notes",
    "save_cleaner_notes", "view_payout", "export_report", "open_property_dashboard", "open_calendar_item",
    "open_payment_record", "open_message_thread", "open_owner_profile", "generate_owner_statement",
  ]);

  if (!supported.has(action)) {
    return res.status(400).json({ error: "Unknown action" });
  }

  return res.json({
    data: {
      action,
      status: "placeholder",
      message: "Coming soon — needs backend connection.",
    },
  });
});

router.get("/owners", (req, res) => res.json({ data: owners }));
router.get("/channels", (req, res) => res.json({ data: channels }));
router.get("/property-channel-links", (req, res) => res.json({ data: propertyChannelLinks }));
router.get("/calendar", (req, res) => res.json({ data: calendarEvents, empty_state: "No calendar connected. Paste Airbnb or VRBO iCal links." }));
router.get("/cleanings", (req, res) => res.json({ data: cleaningTasks, empty_state: "No cleaning tasks. Approved bookings will automatically create turnover tasks." }));
router.get("/maintenance", (req, res) => res.json({ data: maintenanceItems, empty_state: "No maintenance items. Add a maintenance task if something needs attention." }));
router.get("/messages", (req, res) => res.json({ data: messages, empty_state: "No messages." }));

module.exports = router;
