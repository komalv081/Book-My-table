document.querySelectorAll('.date-pill').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.date-pill').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
  });
});

document.querySelectorAll('.filter-button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter-button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
  });
});

document.querySelectorAll('.time-pill').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.time-pill').forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected');
  });
});