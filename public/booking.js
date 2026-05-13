function getQueryParams() {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}

function formatRestaurantName(name) {
  return name ? decodeURIComponent(name) : 'Selected restaurant';
}

function setError(message) {
  const error = document.getElementById('booking-error');
  if (!error) return;
  if (!message) {
    error.classList.add('hidden');
    error.textContent = '';
    return;
  }
  error.textContent = message;
  error.classList.remove('hidden');
}

function defaultDateInputValue() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function updateBookingPage() {
  const params = getQueryParams();
  const name = formatRestaurantName(params.restaurant);
  const floor = params.floor ? decodeURIComponent(params.floor) : 'Any available floor';
  const maxSeats = params.maxSeats ? Number(params.maxSeats) : 1;

  const restaurantName = document.getElementById('restaurant-name');
  const restaurantFloor = document.getElementById('restaurant-floor');
  const restaurantMax = document.getElementById('restaurant-max');
  const seatCount = document.getElementById('seat-count');
  const bookingDescription = document.getElementById('booking-description');
  const dateInput = document.getElementById('booking-date');

  if (dateInput && !dateInput.value) {
    dateInput.value = defaultDateInputValue();
  }

  restaurantName.textContent = name;
  restaurantFloor.textContent = floor;
  restaurantMax.textContent = `${maxSeats} seats available`;
  seatCount.max = maxSeats;
  seatCount.value = maxSeats > 0 ? 1 : 0;

  if (!params.restaurant) {
    if (bookingDescription) {
      bookingDescription.textContent =
        'Select a restaurant from the availability page to book a table.';
    }
    document.getElementById('confirm-booking').disabled = true;
    setError('No restaurant selected. Please navigate from the availability page.');
  }
}

function showConfirmation(seats, bookingPayload) {
  const success = document.getElementById('booking-success');
  const form = document.querySelector('.booking-card');
  const message = document.getElementById('success-message');
  const params = getQueryParams();
  const name = formatRestaurantName(params.restaurant);
  const floor = params.floor ? decodeURIComponent(params.floor) : 'Any floor';

  form.classList.add('hidden');
  success.classList.remove('hidden');
  const ref = bookingPayload?.data?._id ? ` Reference: ${bookingPayload.data._id}.` : '';
  message.textContent = `Your booking for ${seats} seat(s) at ${name} on ${floor} (${bookingPayload?.data?.date || ''}) is saved.${ref}`;
}

function initBooking() {
  updateBookingPage();
  const button = document.getElementById('confirm-booking');
  button.addEventListener('click', async () => {
    setError('');
    const seatCount = document.getElementById('seat-count');
    const guestName = document.getElementById('guest-name');
    const guestEmail = document.getElementById('guest-email');
    const dateInput = document.getElementById('booking-date');
    const maxSeats = Number(seatCount.max) || 1;
    const seats = Number(seatCount.value);
    if (!seats || seats < 1 || seats > maxSeats) {
      setError(`Please choose between 1 and ${maxSeats} seats.`);
      return;
    }
    const nameVal = guestName?.value?.trim();
    const emailVal = guestEmail?.value?.trim();
    const dateVal = dateInput?.value?.trim();
    if (!nameVal || !emailVal || !dateVal) {
      setError('Please enter your name, email, and booking date.');
      return;
    }

    const params = getQueryParams();
    const restaurant = params.restaurant ? decodeURIComponent(params.restaurant) : '';
    const floor = params.floor ? decodeURIComponent(params.floor) : '';

    button.disabled = true;
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameVal,
          email: emailVal,
          date: dateVal,
          restaurant,
          floor,
          partySize: seats,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.message || 'Could not save booking. Try again.');
        return;
      }
      showConfirmation(seats, body);
    } catch {
      setError('Network error. Check that the server is running and MongoDB is connected.');
    } finally {
      button.disabled = false;
    }
  });
}

window.addEventListener('DOMContentLoaded', initBooking);
