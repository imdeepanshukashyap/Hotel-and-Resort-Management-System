/**
 * Homepage Booking Bar & Availability Flow
 * Contributed by: Ayush Tyagi
 * Branch: feature/js-booking-flow
 *
 * What it does:
 *  - Validates check-in and check-out dates on the homepage booking bar
 *  - Prevents checking out before checking in
 *  - Shows a friendly "X nights available" summary below the bar on submit
 *  - Newsletter form: shows toast confirmation instead of page reload
 *  - Smooth scroll when clicking "See our rooms" on hero
 */

document.addEventListener('DOMContentLoaded', function () {

  /* ── 1. HOMEPAGE BOOKING BAR DATE VALIDATION & SUMMARY ──────────────────── */
  var homeCheckIn  = document.getElementById('check-in-date');
  var homeCheckOut = document.getElementById('check-out-date');
  var bookingForm  = document.querySelector('.booking-form');

  /* inject a result line below the booking bar */
  var bookingWrapper = document.querySelector('.booking-bar-wrapper');
  var resultLine = null;
  if (bookingWrapper) {
    resultLine = document.createElement('p');
    resultLine.id = 'booking-result-line';
    resultLine.style.cssText =
      'text-align:center;margin-top:.75rem;font-size:.88rem;color:var(--color-accent,#c9a96e);' +
      'letter-spacing:.03em;min-height:1.4em;';
    bookingWrapper.appendChild(resultLine);
  }

  if (homeCheckIn && homeCheckOut) {
    /* set today as minimum */
    var now   = new Date();
    var today = now.toISOString().split('T')[0];
    homeCheckIn.min  = today;
    homeCheckOut.min = today;

    function updateRoomCheckoutLinks() {
      var ci = homeCheckIn ? homeCheckIn.value : '';
      var co = homeCheckOut ? homeCheckOut.value : '';
      var adults = document.getElementById('adults-count');
      var kids   = document.getElementById('kids-count');
      var aVal   = adults ? adults.value : '2';
      var kVal   = kids   ? kids.value   : '0';

      var cards = document.querySelectorAll('.resort-book-btn, a[href*="checkout.html"]');
      cards.forEach(function (link) {
        var href = link.getAttribute('href');
        var match = href.match(/id=(\d+)/);
        if (match) {
          var id = match[1];
          var newUrl = 'checkout.html?id=' + id;
          if (ci)   newUrl += '&checkIn=' + encodeURIComponent(ci);
          if (co)   newUrl += '&checkOut=' + encodeURIComponent(co);
          if (aVal) newUrl += '&adults=' + encodeURIComponent(aVal);
          if (kVal) newUrl += '&kids=' + encodeURIComponent(kVal);
          link.setAttribute('href', newUrl);
        }
      });
    }

    homeCheckIn.addEventListener('change', function () {
      if (homeCheckOut.value && homeCheckOut.value <= homeCheckIn.value) {
        var d = new Date(homeCheckIn.value);
        d.setDate(d.getDate() + 1);
        homeCheckOut.value = d.toISOString().split('T')[0];
      }
      if (resultLine) resultLine.textContent = '';
      updateRoomCheckoutLinks();
    });

    if (homeCheckOut) {
      homeCheckOut.addEventListener('change', function () {
        if (resultLine) resultLine.textContent = '';
        updateRoomCheckoutLinks();
      });
    }

    var adultsSelect = document.getElementById('adults-count');
    var kidsSelect   = document.getElementById('kids-count');
    if (adultsSelect) adultsSelect.addEventListener('change', updateRoomCheckoutLinks);
    if (kidsSelect)   kidsSelect.addEventListener('change', updateRoomCheckoutLinks);

    updateRoomCheckoutLinks();
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var d1 = homeCheckIn ? new Date(homeCheckIn.value) : null;
      var d2 = homeCheckOut ? new Date(homeCheckOut.value) : null;

      if (d1 && d2 && d2 <= d1) {
        if (resultLine) {
          resultLine.style.color = '#f87171';
          resultLine.textContent = 'Check-out must be after check-in. Please adjust your dates.';
        }
        return;
      }

      if (d1 && d2 && d2 > d1) {
        var nights  = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
        var adults  = document.getElementById('adults-count');
        var kids    = document.getElementById('kids-count');
        var aCount  = adults ? adults.value : '2';
        var kCount  = kids   ? kids.value   : '0';

        var guestStr = aCount + ' adult' + (aCount > 1 ? 's' : '');
        if (kCount && kCount !== '0') guestStr += ', ' + kCount + ' kid' + (kCount > 1 ? 's' : '');

        if (typeof updateRoomCheckoutLinks === 'function') {
          updateRoomCheckoutLinks();
        }

        if (resultLine) {
          resultLine.style.color = 'var(--color-accent,#c9a96e)';
          resultLine.textContent =
            'Showing available rooms for ' + nights + ' night' + (nights > 1 ? 's' : '') +
            ' · ' + guestStr + ' — select any room below to proceed to checkout.';
        }

        var roomsSection = document.getElementById('rooms');
        if (roomsSection) {
          roomsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }

  /* ── 2. NEWSLETTER FORM — inline thank you toast ─────────────────────────── */
  var footerForms = document.querySelectorAll('footer form, .site-footer form');
  footerForms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var emailInput = form.querySelector('input[type="email"]');
      var btn        = form.querySelector('button[type="submit"]');
      if (emailInput && emailInput.value) {
        if (btn) {
          btn.textContent = 'Subscribed!';
          btn.style.background = '#34d399';
          btn.style.borderColor = '#34d399';
          btn.disabled = true;
        }
        emailInput.value = '';
        emailInput.placeholder = 'You are on the list!';
        emailInput.disabled = true;
      }
    });
  });

  /* ── 3. SMOOTH SCROLL for hero CTA → rooms section ──────────────────────── */
  var heroBtn = document.querySelector('.hero-content a[href="#rooms"]');
  if (heroBtn) {
    heroBtn.addEventListener('click', function (e) {
      var target = document.getElementById('rooms');
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /* ── 4. ROOM CARDS on homepage — hover to show price on click ───────────── */
  /* The cards on the landing page "Rooms" section scroll to rooms.html,
     so here we just highlight the active nav link on scroll */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-link-custom');

  if (sections.length && navLinks.length) {
    window.addEventListener('scroll', function () {
      var scrollY = window.scrollY + 100;
      sections.forEach(function (sec) {
        var top    = sec.offsetTop;
        var height = sec.offsetHeight;
        var id     = sec.getAttribute('id');
        if (scrollY >= top && scrollY < top + height) {
          navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('active');
            }
          });
        }
      });
    }, { passive: true });
  }

  /* ── 5. AGRA & MATHURA DESTINATION FILTER, LIVE SEARCH & GEOLOCATION ──── */
  var destFilterTabs = document.querySelectorAll('[data-dest-filter]');
  var destSearchInput = document.getElementById('destSearchInput');
  var destGrid = document.getElementById('destinationsGrid');
  var destItems = Array.from(document.querySelectorAll('.dest-item'));
  var destNoResult = document.getElementById('destNoResult');

  var btnDetectLocation = document.getElementById('btnDetectLocation');
  var btnResetLocation = document.getElementById('btnResetLocation');
  var locationStatusBanner = document.getElementById('locationStatusBanner');
  var locationStatusText = document.getElementById('locationStatusText');
  var presetLocChips = document.querySelectorAll('[data-test-loc]');

  var currentDestFilter = 'all';
  var currentDestQuery = '';

  /* Keep original card order for reset */
  var originalDestOrder = destItems.slice();

  /* Basic Haversine Distance calculation in Kilometers */
  function getDistanceKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Earth radius in km
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // 1 decimal place
  }

  /* Sort and display cards based on distance */
  function applyLocationSort(userLat, userLng, placeLabel) {
    if (!destGrid) return;

    destItems.forEach(function (card) {
      var lat = parseFloat(card.getAttribute('data-lat'));
      var lng = parseFloat(card.getAttribute('data-lng'));
      var distBadge = card.querySelector('.resort-distance-badge');

      if (!isNaN(lat) && !isNaN(lng)) {
        var dist = getDistanceKm(userLat, userLng, lat, lng);
        card._dist = dist;
        if (distBadge) {
          var distStr = (dist < 1 ? '<1 km' : dist + ' km');
          if (placeLabel && placeLabel !== 'Your GPS Location') {
            distBadge.innerHTML = '<i class="bi bi-geo-alt-fill"></i> ' + distStr + ' from ' + placeLabel;
          } else {
            distBadge.innerHTML = '<i class="bi bi-geo-alt-fill"></i> ' + distStr + ' away';
          }
          distBadge.classList.remove('d-none');
        }
      } else {
        card._dist = 999999;
      }
    });

    /* Sort array by distance ascending (nearest first) */
    var sorted = destItems.slice().sort(function (a, b) {
      return a._dist - b._dist;
    });

    /* Re-append sorted cards into DOM grid */
    sorted.forEach(function (card) {
      destGrid.appendChild(card);
    });

    /* Update status banner */
    if (locationStatusBanner && locationStatusText && sorted.length > 0) {
      var nearestName = sorted[0].querySelector('.resort-title') ? sorted[0].querySelector('.resort-title').textContent : 'Nearest Stay';
      var nearestDist = sorted[0]._dist;

      locationStatusText.innerHTML =
        'Showing <strong>' + sorted.length + ' resorts</strong> sorted nearest to <strong>' + placeLabel + '</strong>. ' +
        'Nearest: <strong>' + nearestName + '</strong> (' + (nearestDist < 1 ? '<1 km' : nearestDist + ' km away') + ')';

      locationStatusBanner.classList.remove('d-none');
    }

    if (btnResetLocation) {
      btnResetLocation.classList.remove('d-none');
    }

    filterDestinations();
  }

  /* Reset location sorting back to original default */
  function resetLocation() {
    if (!destGrid) return;

    originalDestOrder.forEach(function (card) {
      card._dist = null;
      var distBadge = card.querySelector('.resort-distance-badge');
      if (distBadge) distBadge.classList.add('d-none');
      destGrid.appendChild(card);
    });

    if (locationStatusBanner) locationStatusBanner.classList.add('d-none');
    if (btnResetLocation) btnResetLocation.classList.add('d-none');
    if (btnDetectLocation) {
      btnDetectLocation.classList.remove('active');
      btnDetectLocation.innerHTML = '<i class="bi bi-crosshair"></i> Find Near Me';
    }

    presetLocChips.forEach(function (chip) { chip.classList.remove('active'); });

    if (destSearchInput) destSearchInput.value = '';
    currentDestQuery = '';
    currentDestFilter = 'all';
    if (destFilterTabs.length) {
      destFilterTabs.forEach(function (b) {
        if (b.getAttribute('data-dest-filter') === 'all') {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
    }

    filterDestinations();
  }

  /* 1. Real Browser Geolocation API */
  if (btnDetectLocation) {
    btnDetectLocation.addEventListener('click', function () {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser. Please try the city preset buttons below.');
        return;
      }

      btnDetectLocation.innerHTML = '<i class="bi bi-hourglass-split"></i> Detecting GPS...';

      navigator.geolocation.getCurrentPosition(
        function (pos) {
          btnDetectLocation.classList.add('active');
          btnDetectLocation.innerHTML = '<i class="bi bi-geo-alt-fill"></i> Location Active';
          presetLocChips.forEach(function (c) { c.classList.remove('active'); });
          applyLocationSort(pos.coords.latitude, pos.coords.longitude, 'Your GPS Location');
        },
        function (err) {
          btnDetectLocation.innerHTML = '<i class="bi bi-crosshair"></i> Find Near Me';
          if (locationStatusBanner && locationStatusText) {
            locationStatusText.innerHTML = '<strong>Location access denied or unavailable.</strong> You can click the preset chips (Near Agra / Near Mathura) to test distance sorting.';
            locationStatusBanner.classList.remove('d-none');
          }
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }

  /* 2. Comprehensive Geographic City Database for Proximity Detection */
  var cityCoords = {
    'agra': { lat: 27.1767, lng: 78.0081, name: 'Agra City Center' },
    'mathura': { lat: 27.4924, lng: 77.6737, name: 'Mathura' },
    'vrindavan': { lat: 27.5685, lng: 77.6740, name: 'Vrindavan' },
    'delhi': { lat: 28.6139, lng: 77.2090, name: 'Delhi' },
    'new delhi': { lat: 28.6139, lng: 77.2090, name: 'New Delhi' },
    'ncr': { lat: 28.6139, lng: 77.2090, name: 'Delhi-NCR' },
    'noida': { lat: 28.5355, lng: 77.3910, name: 'Noida' },
    'greater noida': { lat: 28.4744, lng: 77.5040, name: 'Greater Noida' },
    'gurgaon': { lat: 28.4595, lng: 77.0266, name: 'Gurugram' },
    'gurugram': { lat: 28.4595, lng: 77.0266, name: 'Gurugram' },
    'faridabad': { lat: 28.4089, lng: 77.3178, name: 'Faridabad' },
    'ghaziabad': { lat: 28.6692, lng: 77.4538, name: 'Ghaziabad' },
    'aligarh': { lat: 27.8974, lng: 78.0880, name: 'Aligarh' },
    'bharatpur': { lat: 27.2152, lng: 77.5030, name: 'Bharatpur' },
    'jaipur': { lat: 26.9124, lng: 75.7873, name: 'Jaipur' },
    'gwalior': { lat: 26.2183, lng: 78.1828, name: 'Gwalior' },
    'lucknow': { lat: 26.8467, lng: 80.9462, name: 'Lucknow' },
    'kanpur': { lat: 26.4499, lng: 80.3319, name: 'Kanpur' },
    'hathras': { lat: 27.5968, lng: 78.0519, name: 'Hathras' },
    'firozabad': { lat: 27.1591, lng: 78.3957, name: 'Firozabad' },
    'govardhan': { lat: 27.4975, lng: 77.4633, name: 'Govardhan' },
    'barsana': { lat: 27.6472, lng: 77.3756, name: 'Barsana' },
    'gokul': { lat: 27.4414, lng: 77.7208, name: 'Gokul' },
    'fatehpur sikri': { lat: 27.0945, lng: 77.6679, name: 'Fatehpur Sikri' }
  };

  /* Helper to match any city name from user query */
  function matchCityFromQuery(str) {
    if (!str) return null;
    var cleaned = str.toLowerCase().trim();

    if (cityCoords[cleaned]) return cityCoords[cleaned];

    // Strip noise words
    var stripped = cleaned.replace(/\b(hotels?|resorts?|stays?|luxury|heritage|boutique|near|nearby|in|around|at)\b/gi, ' ').trim();
    stripped = stripped.replace(/\s+/g, ' ');

    if (stripped && cityCoords[stripped]) {
      return cityCoords[stripped];
    }

    var keys = Object.keys(cityCoords);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (cleaned.indexOf(k) !== -1) {
        return cityCoords[k];
      }
    }
    return null;
  }

  presetLocChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var cityKey = this.getAttribute('data-test-loc');
      var city = cityCoords[cityKey];
      if (!city) return;

      presetLocChips.forEach(function (c) { c.classList.remove('active'); });
      this.classList.add('active');

      if (destSearchInput) {
        destSearchInput.value = city.name;
      }

      if (btnDetectLocation) {
        btnDetectLocation.classList.remove('active');
        btnDetectLocation.innerHTML = '<i class="bi bi-crosshair"></i> Find Near Me';
      }

      applyLocationSort(city.lat, city.lng, city.name);
    });
  });

  if (btnResetLocation) {
    btnResetLocation.addEventListener('click', resetLocation);
  }

  /* 3. Destination Filter Tabs & Global Search Handler */
  function filterDestinations() {
    var matchedCity = matchCityFromQuery(currentDestQuery);
    var visibleCount = 0;

    destItems.forEach(function (card) {
      var dest = card.getAttribute('data-destination') || '';
      var cardText = card.textContent.toLowerCase();

      var matchFilter = (currentDestFilter === 'all') || (dest === currentDestFilter);
      var matchQuery = true;

      if (currentDestQuery) {
        if (matchedCity) {
          // If searching by city proximity, show all hotels sorted by distance
          matchQuery = true;
        } else {
          // Standard keyword match across hotel title, address, description, amenities
          matchQuery = (cardText.indexOf(currentDestQuery) !== -1);
        }
      }

      if (matchFilter && matchQuery) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (destNoResult) {
      destNoResult.style.display = (visibleCount === 0) ? 'block' : 'none';
    }
  }

  if (destFilterTabs.length) {
    destFilterTabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        destFilterTabs.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        currentDestFilter = this.getAttribute('data-dest-filter');
        filterDestinations();
      });
    });
  }

  if (destSearchInput) {
    destSearchInput.addEventListener('input', function () {
      currentDestQuery = this.value.trim().toLowerCase();

      if (currentDestQuery) {
        // Unlock search across all locations
        currentDestFilter = 'all';
        if (destFilterTabs.length) {
          destFilterTabs.forEach(function (b) {
            if (b.getAttribute('data-dest-filter') === 'all') {
              b.classList.add('active');
            } else {
              b.classList.remove('active');
            }
          });
        }

        // If the query is a city or region, calculate real distances & sort nearest
        var city = matchCityFromQuery(currentDestQuery);
        if (city) {
          presetLocChips.forEach(function (c) {
            c.classList.toggle('active', c.getAttribute('data-test-loc') === currentDestQuery);
          });
          applyLocationSort(city.lat, city.lng, city.name);
          return;
        }
      } else {
        if (locationStatusBanner && !btnDetectLocation.classList.contains('active')) {
          locationStatusBanner.classList.add('d-none');
        }
      }

      filterDestinations();
    });
  }

  /* 4. Auto-fill contact form on clicking "Inquire" */
  var inquireButtons = document.querySelectorAll('[data-hotel-inquire]');
  inquireButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var hotelName = this.getAttribute('data-hotel-inquire');
      var serviceSelect = document.getElementById('contact-service');
      var subjectInput = document.getElementById('contact-subject');
      var messageTextarea = document.getElementById('contact-message');

      if (serviceSelect) serviceSelect.value = 'suites';
      if (subjectInput && hotelName) {
        subjectInput.value = 'Inquiry for ' + hotelName;
      }
      if (messageTextarea && hotelName) {
        messageTextarea.value = 'Hello Concierge, I would like to inquire about reservation availability and rates for ' + hotelName + '.';
      }

      var contactSec = document.getElementById('contact');
      if (contactSec) {
        contactSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(function () {
          if (subjectInput) subjectInput.focus();
        }, 500);
      }
    });
  });

});
