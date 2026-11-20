/**
 * Rooms Page - Search & Filter
 * Contributed by: Ayush Gupta
 * Branch: feature/js-rooms-filter
 *
 * What it does:
 *  - Live search bar filters room cards by name as you type
 *  - Filter buttons (All / Budget / Standard / Suite) filter by price range
 *  - Guest count filter shows only rooms that fit selected occupancy
 *  - "No rooms found" message when nothing matches
 *  - Booking bar: validates check-in < check-out, then shows how many nights
 */

document.addEventListener('DOMContentLoaded', function () {

  /* ── 1. INJECT FILTER TOOLBAR above #room-list ──────────────────────────── */
  var roomSection = document.querySelector('#room-list .container');
  if (!roomSection) return;

  var toolbar = document.createElement('div');
  toolbar.id = 'rooms-toolbar';
  toolbar.style.cssText = [
    'display:flex', 'flex-wrap:wrap', 'gap:.75rem', 'align-items:center',
    'margin-bottom:2rem', 'padding:1rem 1.2rem',
    'background:rgba(255,255,255,0.04)',
    'border:1px solid rgba(255,255,255,0.08)',
    'border-radius:10px',
  ].join(';');

  toolbar.innerHTML =
    '<input id="room-search" type="text" placeholder="Search rooms..." ' +
    'style="flex:1;min-width:180px;padding:.55rem 1rem;border-radius:7px;' +
    'border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);' +
    'color:inherit;font-size:.9rem;outline:none;" />' +

    '<div id="room-filter-btns" style="display:flex;gap:.4rem;flex-wrap:wrap;">' +
    '<button class="rf-btn active" data-filter="all">All Rooms</button>' +
    '<button class="rf-btn" data-filter="budget">Budget (rs.100-200)</button>' +
    '<button class="rf-btn" data-filter="standard">Standard (rs.200-350)</button>' +
    '<button class="rf-btn" data-filter="suite">Suite (rs.350+)</button>' +
    '</div>' +

    '<select id="room-guest-filter" style="padding:.55rem .8rem;border-radius:7px;' +
    'border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);' +
    'color:inherit;font-size:.9rem;cursor:pointer;">' +
    '<option value="0">Any Guests</option>' +
    '<option value="1">1 Guest</option>' +
    '<option value="2">2 Guests</option>' +
    '<option value="3">3 Guests</option>' +
    '<option value="4">4 Guests</option>' +
    '<option value="5">5+ Guests</option>' +
    '</select>';

  /* inject style for filter buttons */
  var style = document.createElement('style');
  style.textContent =
    '.rf-btn{padding:.4rem .9rem;border-radius:6px;border:1px solid rgba(255,255,255,0.15);' +
    'background:transparent;color:inherit;cursor:pointer;font-size:.82rem;transition:.2s;}' +
    '.rf-btn.active{background:var(--color-accent,#c9a96e);border-color:var(--color-accent,#c9a96e);color:#000;font-weight:600;}' +
    '.rf-btn:hover:not(.active){background:rgba(255,255,255,0.08);}' +
    '#rooms-no-result{text-align:center;padding:3rem 1rem;color:rgba(255,255,255,0.4);display:none;}';
  document.head.appendChild(style);

  /* "no results" placeholder */
  var noResult = document.createElement('p');
  noResult.id = 'rooms-no-result';
  noResult.textContent = 'No rooms match your search. Try a different filter.';

  roomSection.insertBefore(toolbar, roomSection.firstChild);
  roomSection.appendChild(noResult);

  /* ── 2. GRAB ALL ROOM CARDS ──────────────────────────────────────────────── */
  var rooms = Array.from(document.querySelectorAll('.room-row'));

  /* helper: parse price from text like "rs.265" */
  function getPrice(card) {
    var priceEl = card.querySelector('.room-row-price');
    if (!priceEl) return 0;
    var match = priceEl.textContent.match(/[\d,]+/);
    return match ? parseInt(match[0].replace(',', '')) : 0;
  }

  /* helper: parse max guests from text like "Max 4 guests" */
  function getGuests(card) {
    var metaItems = card.querySelectorAll('.room-row-meta li');
    for (var i = 0; i < metaItems.length; i++) {
      var t = metaItems[i].textContent;
      var m = t.match(/Max\s+(\d+)/i);
      if (m) return parseInt(m[1]);
    }
    return 1;
  }

  var currentFilter = 'all';
  var currentSearch = '';
  var currentGuests = 0;

  function applyFilters() {
    var visible = 0;
    rooms.forEach(function (card) {
      var price  = getPrice(card);
      var guests = getGuests(card);
      var title  = card.querySelector('.room-row-title') ? card.querySelector('.room-row-title').textContent.toLowerCase() : '';
      var desc   = card.querySelector('.room-row-desc')  ? card.querySelector('.room-row-desc').textContent.toLowerCase()  : '';

      /* search match */
      var searchOk = !currentSearch || title.indexOf(currentSearch) !== -1 || desc.indexOf(currentSearch) !== -1;

      /* price range match */
      var priceOk = true;
      if (currentFilter === 'budget')   priceOk = price >= 100 && price <= 200;
      if (currentFilter === 'standard') priceOk = price > 200  && price <= 350;
      if (currentFilter === 'suite')    priceOk = price > 350;

      /* guest capacity match */
      var guestOk = currentGuests === 0 || guests >= currentGuests;

      if (searchOk && priceOk && guestOk) {
        card.style.display = '';
        visible++;
      } else {
        card.style.display = 'none';
      }
    });

    noResult.style.display = visible === 0 ? 'block' : 'none';
  }

  /* ── 3. WIRE UP EVENTS ───────────────────────────────────────────────────── */
  document.getElementById('room-search').addEventListener('input', function () {
    currentSearch = this.value.trim().toLowerCase();
    applyFilters();
  });

  document.getElementById('room-filter-btns').addEventListener('click', function (e) {
    if (!e.target.classList.contains('rf-btn')) return;
    document.querySelectorAll('.rf-btn').forEach(function (b) { b.classList.remove('active'); });
    e.target.classList.add('active');
    currentFilter = e.target.dataset.filter;
    applyFilters();
  });

  document.getElementById('room-guest-filter').addEventListener('change', function () {
    currentGuests = parseInt(this.value);
    applyFilters();
  });

  /* ── 4. BOOKING BAR — nights calculation ─────────────────────────────────── */
  var checkIn  = document.getElementById('check-in-date');
  var checkOut = document.getElementById('check-out-date');
  var bookBtn  = document.querySelector('.booking-btn');

  if (checkIn && checkOut && bookBtn) {
    /* set minimum dates to today */
    var today = new Date();
    var yyyy  = today.getFullYear();
    var mm    = String(today.getMonth() + 1).padStart(2, '0');
    var dd    = String(today.getDate()).padStart(2, '0');
    var todayStr = yyyy + '-' + mm + '-' + dd;
    checkIn.min  = todayStr;
    checkOut.min = todayStr;

    function updateNights() {
      var d1 = new Date(checkIn.value);
      var d2 = new Date(checkOut.value);
      if (!isNaN(d1) && !isNaN(d2) && d2 > d1) {
        var nights = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
        bookBtn.textContent = 'Check ' + nights + (nights === 1 ? ' Night' : ' Nights');
      } else {
        bookBtn.textContent = 'Check Now';
      }
    }

    checkIn.addEventListener('change', function () {
      /* auto-advance checkout if behind check-in */
      if (checkOut.value && checkOut.value <= checkIn.value) {
        var d = new Date(checkIn.value);
        d.setDate(d.getDate() + 1);
        checkOut.value = d.toISOString().split('T')[0];
      }
      updateNights();
    });
    checkOut.addEventListener('change', updateNights);
    updateNights();
  }

});
