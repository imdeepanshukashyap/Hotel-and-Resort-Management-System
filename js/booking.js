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

    homeCheckIn.addEventListener('change', function () {
      if (homeCheckOut.value && homeCheckOut.value <= homeCheckIn.value) {
        var d = new Date(homeCheckIn.value);
        d.setDate(d.getDate() + 1);
        homeCheckOut.value = d.toISOString().split('T')[0];
      }
      if (resultLine) resultLine.textContent = '';
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      var d1 = homeCheckIn ? new Date(homeCheckIn.value) : null;
      var d2 = homeCheckOut ? new Date(homeCheckOut.value) : null;

      if (d1 && d2 && d2 <= d1) {
        e.preventDefault();
        if (resultLine) {
          resultLine.style.color = '#f87171';
          resultLine.textContent = 'Check-out must be after check-in. Please adjust your dates.';
        }
        return;
      }

      if (d1 && d2 && d2 > d1 && resultLine) {
        var nights  = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
        var adults  = document.getElementById('adults-count');
        var kids    = document.getElementById('kids-count');
        var aCount  = adults ? adults.value : '2';
        var kCount  = kids   ? kids.value   : '0';

        var guestStr = aCount + ' adult' + (aCount > 1 ? 's' : '');
        if (kCount && kCount !== '0') guestStr += ', ' + kCount + ' kid' + (kCount > 1 ? 's' : '');

        resultLine.style.color = 'var(--color-accent,#c9a96e)';
        resultLine.textContent =
          'Searching available rooms for ' + nights + ' night' + (nights > 1 ? 's' : '') +
          ' · ' + guestStr + ' — loading results...';
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

  /* ── 5. AGRA & MATHURA DESTINATION FILTER & LIVE SEARCH ────────────────── */
  var destFilterTabs = document.querySelectorAll('[data-dest-filter]');
  var destSearchInput = document.getElementById('destSearchInput');
  var destItems = document.querySelectorAll('.dest-item');
  var destNoResult = document.getElementById('destNoResult');

  var currentDestFilter = 'all';
  var currentDestQuery = '';

  function filterDestinations() {
    var visibleCount = 0;
    destItems.forEach(function (card) {
      var dest = card.getAttribute('data-destination') || '';
      var cardText = card.textContent.toLowerCase();

      var matchFilter = (currentDestFilter === 'all') || (dest === currentDestFilter);
      var matchQuery = !currentDestQuery || (cardText.indexOf(currentDestQuery) !== -1);

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
      filterDestinations();
    });
  }

  /* Auto-fill contact form on clicking "Inquire" on any resort card */
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
