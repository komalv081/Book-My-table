document.querySelectorAll('.toggle-details').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.restaurant-card');
    if (!card) return;
    const details = card.querySelector('.restaurant-details');
    if (!details) return;
    const isHidden = details.classList.toggle('hidden');
    button.textContent = isHidden ? 'View floor availability' : 'Hide floor availability';
  });
});

document.querySelectorAll('.book-floor').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    const floorItem = button.closest('.floor-item');
    if (!floorItem) return;
    const card = button.closest('.restaurant-card');
    if (!card) return;
    const restaurantName = card.querySelector('.restaurant-name')?.textContent || 'Selected restaurant';
    const floorName = floorItem.querySelector('span')?.textContent || 'Selected floor';
    const availableText = floorItem.querySelector('span:nth-child(2)')?.textContent || '';
    const matches = availableText.match(/(\d+)\s*seats?/i);
    const maxSeats = matches ? Number(matches[1]) : 1;
    const query = new URLSearchParams({
      restaurant: restaurantName,
      floor: floorName,
      maxSeats: String(maxSeats),
    });
    window.location.href = `booking.html?${query.toString()}`;
  });
});

document.querySelectorAll('.book-button').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.restaurant-card');
    if (!card) return;
    const restaurantName = card.querySelector('.restaurant-name')?.textContent || 'Selected restaurant';
    const floorItems = Array.from(card.querySelectorAll('.floor-item'));
    let totalSeats = 0;
    floorItems.forEach((item) => {
      const availableText = item.querySelector('span:nth-child(2)')?.textContent || '';
      const matches = availableText.match(/(\d+)\s*seats?/i);
      if (matches) totalSeats += Number(matches[1]);
    });
    if (totalSeats === 0) totalSeats = 1;
    const query = new URLSearchParams({
      restaurant: restaurantName,
      maxSeats: String(totalSeats),
    });
    window.location.href = `booking.html?${query.toString()}`;
  });
});
