const bookedList = document.getElementById("bookedList");
const refreshBooked = document.getElementById("refreshBooked");
const bookingForm = document.getElementById("bookingForm");
const bookingStatus = document.getElementById("bookingStatus");
const templateOutput = document.getElementById("templateOutput");

const template = {
  name: "JRNP Rentals Theme",
  endpoints: {
    bookedDates: "/booked-dates",
    syncCalendar: "/sync-calendar",
    createBooking: "/create-booking",
    stripeSession: "/create-stripe-session",
    confirmation: "/send-confirmation"
  },
  pages: {
    home: "/theme/index.html",
    availability: "/theme/availability.html",
    booking: "/theme/booking.html",
    confirmation: "/theme/confirmation.html",
    combined: "/theme/combined.html"
  },
  theme: {
    primaryColor: "#1d4ed8",
    fontFamily: "Inter, system-ui, sans-serif"
  }
};

if (templateOutput) {
  templateOutput.textContent = JSON.stringify(template, null, 2);
}

async function loadBookedDates() {
  if (!bookedList) {
    return;
  }
  bookedList.innerHTML = "<li>Loading booked dates...</li>";
  try {
    const response = await fetch(template.endpoints.bookedDates);
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      bookedList.innerHTML = "<li>No booked dates found.</li>";
      return;
    }

    bookedList.innerHTML = data
      .map(
        (event) =>
          `<li><strong>${event.title}</strong> · ${event.start} → ${event.end ?? "N/A"}</li>`
      )
      .join("");
  } catch (error) {
    bookedList.innerHTML = "<li>Unable to load booked dates.</li>";
  }
}

if (refreshBooked) {
  refreshBooked.addEventListener("click", () => {
    loadBookedDates();
  });
}

if (bookingForm) {
  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (bookingStatus) {
      bookingStatus.textContent = "Submitting booking...";
    }

    const formData = new FormData(bookingForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      await fetch(template.endpoints.createBooking, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const stripeResponse = await fetch(template.endpoints.stripeSession, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: payload.email })
      });
      const stripeData = await stripeResponse.json();

      await fetch(template.endpoints.confirmation, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: payload.email })
      });

      if (bookingStatus) {
        bookingStatus.textContent = "Booking initiated. Redirecting to payment...";
      }

      if (stripeData.url) {
        window.location.href = stripeData.url;
      }
    } catch (error) {
      if (bookingStatus) {
        bookingStatus.textContent = "Booking failed. Please try again.";
      }
    }
  });
}

loadBookedDates();
