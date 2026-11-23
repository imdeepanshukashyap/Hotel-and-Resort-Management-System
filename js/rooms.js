const buttons = document.querySelectorAll('.room-filter-btn');
const rooms = document.querySelectorAll('.room-row');
const bookingForm = document.querySelector('.booking-form');
const adultsSelect = document.getElementById('adults-count');
const kidsSelect = document.getElementById('kids-count');
const noRooms = document.getElementById('no-rooms');

let selectedCategory = 'all';
let totalGuests = 0;

function showRooms() {
  let visibleCount = 0;

  rooms.forEach(function (room) {
    const categoryMatch = selectedCategory === 'all' || room.dataset.category === selectedCategory;
    const guestMatch = Number(room.dataset.guests) >= totalGuests;

    if (categoryMatch && guestMatch) {
      room.classList.remove('hidden');
      visibleCount++;
    } else {
      room.classList.add('hidden');
    }
  });

  noRooms.hidden = visibleCount > 0;
}

buttons.forEach(function (button) {
  button.addEventListener('click', function () {
    selectedCategory = button.dataset.filter;

    buttons.forEach(function (item) {
      item.classList.remove('active');
    });
    button.classList.add('active');

    showRooms();
  });
});

bookingForm.addEventListener('submit', function (event) {
  event.preventDefault();
  totalGuests = Number(adultsSelect.value) + Number(kidsSelect.value);
  showRooms();
  document.getElementById('room-list').scrollIntoView({ behavior: 'smooth' });
});
