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

  restaurantName.textContent = name;
  restaurantFloor.textContent = floor;
  restaurantMax.textContent = `${maxSeats} seats available`;
  seatCount.max = maxSeats;
  seatCount.value = maxSeats > 0 ? 1 : 0;

  if (!params.restaurant) {
    bookingDescription.textContent = 'Select a restaurant from the availability page to book a table.';
    document.getElementById('confirm-booking').disabled = true;
    setError('No restaurant selected. Please navigate from the availability page.');
  }
}

function showConfirmation(seats) {
  const success = document.getElementById('booking-success');
  const form = document.querySelector('.booking-card');
  const message = document.getElementById('success-message');
  const params = getQueryParams();
  const name = formatRestaurantName(params.restaurant);
  const floor = params.floor ? decodeURIComponent(params.floor) : 'Any floor';

  form.classList.add('hidden');
  success.classList.remove('hidden');
  message.textContent = `Your booking for ${seats} seat(s) at ${name} on ${floor} is confirmed.`;
}

function initBooking() {
  updateBookingPage();
  const button = document.getElementById('confirm-booking');
  button.addEventListener('click', () => {
    setError('');
    const seatCount = document.getElementById('seat-count');
    const maxSeats = Number(seatCount.max) || 1;
    const seats = Number(seatCount.value);
    if (!seats || seats < 1 || seats > maxSeats) {
      setError(`Please choose between 1 and ${maxSeats} seats.`);
      return;
    }
    showConfirmation(seats);
  });
}

window.addEventListener('DOMContentLoaded', initBooking);
