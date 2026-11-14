/**
 * Hotel & Spa Adina - Concierge FAQ Accordion & Dining Reservation Helper
 * Contributed by: Ayush Tyagi (Dining & Guest Relations)
 * Branch: feature/concierge-faq-dining-services
 *
 * Responsibilities covered:
 *  - Interactive FAQ accordion for guest inquiries (Check-in/out, Airport transfers, Dietary requests)
 *  - Dining time slot selector & auto table recommendation
 *  - Contact form instant input validation feedback
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    /* ── 1. CONCIERGE FAQ ACCORDION INTERACTION ────────────────────────── */
    var faqItems = document.querySelectorAll('.faq-accordion-item');

    faqItems.forEach(function (item) {
      var header = item.querySelector('.faq-header');
      if (!header) return;

      header.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-active');

        // Close other accordion items for clean single-view accordion
        faqItems.forEach(function (other) {
          other.classList.remove('is-active');
          var icon = other.querySelector('.faq-toggle-icon');
          if (icon) icon.className = 'bi bi-plus-lg faq-toggle-icon';
        });

        if (!isOpen) {
          item.classList.add('is-active');
          var activeIcon = item.querySelector('.faq-toggle-icon');
          if (activeIcon) activeIcon.className = 'bi bi-dash-lg faq-toggle-icon';
        }
      });
    });

    /* ── 2. DINING TIME SLOT & TABLE SEAT ESTIMATOR ────────────────────── */
    var serviceSelect = document.getElementById('contact-service');
    var subjectInput = document.getElementById('contact-subject');
    var diningSlotsWrap = document.getElementById('diningSlotsWrapper');

    if (serviceSelect && diningSlotsWrap) {
      serviceSelect.addEventListener('change', function () {
        // Show time slot pill recommendations when "Fine Dining" category selected
        if (this.value === 'dining') {
          diningSlotsWrap.style.display = 'block';
        } else {
          diningSlotsWrap.style.display = 'none';
        }
      });
    }

    var slotPills = document.querySelectorAll('.dining-slot-pill');
    slotPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        slotPills.forEach(function (p) { p.classList.remove('active'); });
        this.classList.add('active');

        var slotTime = this.getAttribute('data-slot');
        if (subjectInput && slotTime) {
          subjectInput.value = 'Table Reservation for ' + slotTime;
        }
      });
    });

    /* ── 3. REAL-TIME CONTACT FORM HELPER HINTS ────────────────────────── */
    var guestEmail = document.getElementById('contact-email');
    if (guestEmail) {
      guestEmail.addEventListener('blur', function () {
        var val = this.value.trim();
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (val && !emailRegex.test(val)) {
          this.style.borderColor = '#f87171';
        } else if (val) {
          this.style.borderColor = '#34d399';
        }
      });
    }

  });
})();
