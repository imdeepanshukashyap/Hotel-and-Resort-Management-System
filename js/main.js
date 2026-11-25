/**
 * Hotel & Spa Adina - Main JavaScript
 * Contributed by Deepanshu Kashyap (Lead)
 */

document.addEventListener('DOMContentLoaded', function () {
  // ── Mobile Navigation Toggle ─────────────────────────────────────────────
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      const isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

      const icon = navToggle.querySelector('i');
      if (icon) {
        if (isOpen) {
          icon.classList.remove('bi-list');
          icon.classList.add('bi-x-lg');
        } else {
          icon.classList.remove('bi-x-lg');
          icon.classList.add('bi-list');
        }
      }
    });

    // Close mobile nav when clicking any nav link
    const navLinks = mainNav.querySelectorAll('.nav-link-custom');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        const icon = navToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('bi-x-lg');
          icon.classList.add('bi-list');
        }
      });
    });

    // Close when clicking outside header
    document.addEventListener('click', function (e) {
      const header = document.querySelector('.site-header');
      if (header && !header.contains(e.target) && mainNav.classList.contains('is-open')) {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        const icon = navToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('bi-x-lg');
          icon.classList.add('bi-list');
        }
      }
    });
  }

  // ── Contact Form Enhancements (Contributed by Ayush Tyagi) ───────────────
  // Auto-select inquiry category from CTA buttons (data-service-target attr)
  var serviceLinks = document.querySelectorAll('[data-service-target]');
  serviceLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      var target = this.getAttribute('data-service-target');
      setTimeout(function () {
        var serviceSelect = document.getElementById('contact-service');
        if (serviceSelect && target) {
          serviceSelect.value = target;
          serviceSelect.focus();
        }
      }, 400);
    });
  });

  // Guest Inquiry Form – inline confirmation toast on submit
  var guestForm = document.getElementById('guestInquiryForm');
  var successAlert = document.getElementById('contactSuccessAlert');

  if (guestForm && successAlert) {
    guestForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = document.getElementById('contact-name');
      var service = document.getElementById('contact-service');
      var date = document.getElementById('contact-date');

      var serviceName = service ? service.options[service.selectedIndex].text : 'your enquiry';
      var guestName = name ? name.value.trim() : 'Valued Guest';
      var prefDate = date ? date.value : '';

      var dateStr = '';
      if (prefDate) {
        var d = new Date(prefDate);
        dateStr = ' on <strong>' + d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) + '</strong>';
      }

      successAlert.innerHTML =
        '<h5><i class="bi bi-check-circle me-2" style="color:var(--color-accent);"></i>Thank you, ' + guestName + '!</h5>' +
        '<p style="margin:0;">Your request for <strong>' + serviceName + '</strong>' + dateStr +
        ' has been received. Our concierge team will contact you within 2 hours to confirm your booking.</p>';

      successAlert.classList.remove('d-none');
      guestForm.style.opacity = '0.4';
      guestForm.style.pointerEvents = 'none';

      successAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // ── Navbar Authentication State (Login / Profile / Logout) ──────────────
  (function initNavbarAuth() {
    var mainNav = document.querySelector('.main-nav');
    if (!mainNav) return;

    var isAuthPage = /login\.html|signup\.html/i.test(window.location.pathname);
    if (isAuthPage) return;

    var existingAuth = mainNav.querySelector('.nav-user-container');
    if (existingAuth) existingAuth.remove();

    var container = document.createElement('div');
    container.className = 'nav-user-container d-flex align-items-center gap-2 ms-lg-2 my-2 my-lg-0';

    try {
      var user = JSON.parse(localStorage.getItem('adina_user') || 'null');
      if (user && user.name) {
        var firstName = user.name.split(' ')[0];
        container.innerHTML =
          '<span class="nav-link-custom d-flex align-items-center gap-1 text-white" style="cursor:default; font-size:0.85rem;">' +
            '<i class="bi bi-person-circle text-accent fs-5"></i> ' +
            '<span>' + firstName + '</span>' +
          '</span>' +
          '<a href="#" id="navLogoutBtn" class="btn-custom btn-custom-sm btn-dark py-1 px-2 text-uppercase" style="font-size:0.75rem; border:1px solid rgba(255,255,255,0.2);">' +
            'Logout' +
          '</a>';
        mainNav.appendChild(container);

        var logoutBtn = document.getElementById('navLogoutBtn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('adina_user');
            window.location.reload();
          });
        }
      } else {
        container.innerHTML =
          '<a href="login.html" class="btn-custom btn-custom-sm btn-accent text-uppercase d-inline-flex align-items-center gap-1 py-2 px-3" style="font-size:0.8rem; letter-spacing:1px;">' +
            '<i class="bi bi-box-arrow-in-right"></i> Sign In' +
          '</a>';
        mainNav.appendChild(container);
      }
    } catch (err) {
      console.error(err);
    }
  })();
});
