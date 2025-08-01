// Dummy calendar parser
async function syncCalendar(icalUrl) {
  return [{ guestName: "Test", checkIn: "2025-09-01", checkOut: "2025-09-05" }];
}
module.exports = syncCalendar;
