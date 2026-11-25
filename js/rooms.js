const buttons = document.querySelectorAll('.room-filter-btn');
const rooms = document.querySelectorAll('.room-row');
const bookingForm = document.querySelector('.booking-form');
const adultsSelect = document.getElementById('adults-count');
const kidsSelect = document.getElementById('kids-count');
const noRooms = document.getElementById('no-rooms');
const searchInput = document.getElementById('roomsSearchInput');
const checkInInput = document.getElementById('check-in-date');
const checkOutInput = document.getElementById('check-out-date');

let selectedCategory = 'all';
let totalGuests = 0;
let searchQuery = '';

function showRooms() {
  let visibleCount = 0;

  rooms.forEach(function (room) {
    const categoryMatch = selectedCategory === 'all' || room.dataset.category === selectedCategory;
    const guestMatch = Number(room.dataset.guests) >= totalGuests;
    const textMatch = !searchQuery || room.textContent.toLowerCase().includes(searchQuery);

    if (categoryMatch && guestMatch && textMatch) {
      room.classList.remove('hidden');
      visibleCount++;
    } else {
      room.classList.add('hidden');
    }
  });

  if (noRooms) {
    noRooms.hidden = visibleCount > 0;
  }
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

if (searchInput) {
  searchInput.addEventListener('input', function () {
    searchQuery = this.value.trim().toLowerCase();

    // If searching, show across all cities
    if (searchQuery) {
      selectedCategory = 'all';
      buttons.forEach(function (item) {
        item.classList.toggle('active', item.dataset.filter === 'all');
      });
    }

    showRooms();
  });
}

if (bookingForm) {
  bookingForm.addEventListener('submit', function (event) {
    event.preventDefault();
    totalGuests = Number(adultsSelect ? adultsSelect.value : 1) + Number(kidsSelect ? kidsSelect.value : 0);
    showRooms();
    const listEl = document.getElementById('room-list');
    if (listEl) {
      listEl.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// Propagate date inputs to checkout links
function updateRoomsCheckoutLinks() {
  const ci = checkInInput ? checkInInput.value : '';
  const co = checkOutInput ? checkOutInput.value : '';
  const a = adultsSelect ? adultsSelect.value : '2';
  const k = kidsSelect ? kidsSelect.value : '0';

  document.querySelectorAll('.room-row a[href*="checkout.html"]').forEach(function (link) {
    const href = link.getAttribute('href');
    const match = href.match(/id=(\d+)/);
    if (match) {
      let url = 'checkout.html?id=' + match[1];
      if (ci) url += '&checkIn=' + encodeURIComponent(ci);
      if (co) url += '&checkOut=' + encodeURIComponent(co);
      if (a)  url += '&adults=' + encodeURIComponent(a);
      if (k)  url += '&kids=' + encodeURIComponent(k);
      link.setAttribute('href', url);
    }
  });
}

if (checkInInput && checkOutInput) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  checkInInput.min = today;
  checkOutInput.min = today;

  checkInInput.addEventListener('change', function () {
    if (checkOutInput.value && checkOutInput.value <= checkInInput.value) {
      const d = new Date(checkInInput.value);
      d.setDate(d.getDate() + 1);
      checkOutInput.value = d.toISOString().split('T')[0];
    }
    updateRoomsCheckoutLinks();
  });

  checkOutInput.addEventListener('change', updateRoomsCheckoutLinks);
  if (adultsSelect) adultsSelect.addEventListener('change', updateRoomsCheckoutLinks);
  if (kidsSelect)   kidsSelect.addEventListener('change', updateRoomsCheckoutLinks);

  updateRoomsCheckoutLinks();
}
