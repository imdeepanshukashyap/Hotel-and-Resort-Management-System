/**
 * Admin Panel - Interactive JavaScript
 * Contributed by: Deepanshu Kashyap
 * Branch: feature/js-admin-interactive
 *
 * What it does:
 *  - Proper JS-driven panel navigation (sidebar links switch panels)
 *  - Real-time clock and date in the topbar
 *  - Search/filter in the Bookings table
 *  - Search/filter in the Rooms table
 *  - Guest Messages: mark as read, quick reply with confirmation
 *  - Room status change dropdown (Available / Occupied / Maintenance)
 *  - Greeting changes based on time of day
 */

document.addEventListener('DOMContentLoaded', function () {

  /* ══════════════════════════════════════════════════════════
     1. PANEL NAVIGATION (JS replaces CSS :target fallback)
  ══════════════════════════════════════════════════════════ */
  var panels = document.querySelectorAll('[id^="panel-"]');
  var sideLinks = document.querySelectorAll('.sidebar-link');
  var titleSpans = document.querySelectorAll('.topbar-title span[id^="title-"]');

  function showPanel(panelId) {
    panels.forEach(function (p) { p.style.display = 'none'; });
    titleSpans.forEach(function (t) { t.style.display = 'none'; });
    sideLinks.forEach(function (l) { l.classList.remove('active'); });

    var target = document.getElementById('panel-' + panelId);
    if (target) target.style.display = '';

    var titleEl = document.getElementById('title-' + panelId);
    if (titleEl) titleEl.style.display = '';

    sideLinks.forEach(function (l) {
      if (l.classList.contains('link-' + panelId)) l.classList.add('active');
    });

    /* scroll main content back to top */
    var main = document.querySelector('.admin-main');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* read initial panel from URL hash */
  function getHashPanel() {
    var hash = window.location.hash; // e.g. #panel-rooms
    if (hash && hash.startsWith('#panel-')) return hash.replace('#panel-', '');
    return 'dashboard';
  }

  showPanel(getHashPanel());

  sideLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href'); // e.g. #panel-rooms
      if (href && href.startsWith('#panel-')) {
        e.preventDefault();
        var panelId = href.replace('#panel-', '');
        history.pushState(null, '', href);
        showPanel(panelId);
      }
    });
  });

  /* topbar shortcut links (messages, settings icons) */
  document.querySelectorAll('.topbar-badge[href]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (href && href.startsWith('#panel-')) {
        e.preventDefault();
        history.pushState(null, '', href);
        showPanel(href.replace('#panel-', ''));
      }
    });
  });

  /* "View All" links inside dashboard panels */
  document.querySelectorAll('[href^="#panel-"]').forEach(function (a) {
    if (!a.classList.contains('sidebar-link') && !a.classList.contains('topbar-badge')) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var pid = a.getAttribute('href').replace('#panel-', '');
        history.pushState(null, '', '#panel-' + pid);
        showPanel(pid);
      });
    }
  });

  /* ══════════════════════════════════════════════════════════
     2. REAL-TIME CLOCK IN TOPBAR
  ══════════════════════════════════════════════════════════ */
  var dateEl = document.querySelector('.topbar-date');
  function updateClock() {
    var now = new Date();
    var days   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var day  = days[now.getDay()];
    var date = now.getDate();
    var mon  = months[now.getMonth()];
    var yr   = now.getFullYear();
    var hh   = String(now.getHours()).padStart(2, '0');
    var min  = String(now.getMinutes()).padStart(2, '0');
    if (dateEl) dateEl.textContent = day + ', ' + date + ' ' + mon + ' ' + yr + '  ' + hh + ':' + min;
  }
  updateClock();
  setInterval(updateClock, 30000);

  /* ── Dynamic greeting based on time ─────────────────────── */
  var greetingEl = document.querySelector('#panel-dashboard .page-header h1');
  if (greetingEl) {
    var hr = new Date().getHours();
    var greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    greetingEl.textContent = greet + ', Deepanshu';
  }

  /* ══════════════════════════════════════════════════════════
     3. BOOKINGS TABLE — SEARCH + STATUS FILTER
  ══════════════════════════════════════════════════════════ */
  var bookingsPanel = document.getElementById('panel-bookings');
  if (bookingsPanel) {
    var bTable = bookingsPanel.querySelector('.admin-table');
    var bCardHeader = bookingsPanel.querySelector('.card-header');

    if (bTable && bCardHeader) {
      /* inject search + filter row */
      var bToolbar = document.createElement('div');
      bToolbar.style.cssText = 'display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:.8rem;';
      bToolbar.innerHTML =
        '<input id="booking-search" type="text" placeholder="Search guest name or room..." ' +
        'style="flex:1;min-width:160px;padding:.45rem .9rem;border-radius:7px;' +
        'border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.05);' +
        'color:inherit;font-size:.85rem;outline:none;" />' +
        '<select id="booking-status-filter" style="padding:.45rem .7rem;border-radius:7px;' +
        'border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.05);' +
        'color:inherit;font-size:.85rem;cursor:pointer;">' +
        '<option value="">All Status</option>' +
        '<option value="Confirmed">Confirmed</option>' +
        '<option value="Pending">Pending</option>' +
        '<option value="Cancelled">Cancelled</option>' +
        '<option value="New">New</option>' +
        '</select>';

      var bWrap = bookingsPanel.querySelector('.admin-table-wrap');
      bWrap.parentNode.insertBefore(bToolbar, bWrap);

      var bRows = bTable.querySelectorAll('tbody tr');

      function filterBookings() {
        var search = document.getElementById('booking-search').value.toLowerCase();
        var status = document.getElementById('booking-status-filter').value.toLowerCase();
        var visible = 0;
        bRows.forEach(function (row) {
          var text   = row.textContent.toLowerCase();
          var badge  = row.querySelector('.badge');
          var bStat  = badge ? badge.textContent.trim().toLowerCase() : '';
          var matchS = !search || text.indexOf(search) !== -1;
          var matchF = !status || bStat === status.toLowerCase();
          if (matchS && matchF) { row.style.display = ''; visible++; }
          else row.style.display = 'none';
        });

        /* show no-result row */
        var existingMsg = bTable.querySelector('.no-result-row');
        if (existingMsg) existingMsg.remove();
        if (visible === 0) {
          var msg = document.createElement('tr');
          msg.className = 'no-result-row';
          msg.innerHTML = '<td colspan="9" style="text-align:center;padding:1.5rem;' +
            'color:rgba(255,255,255,0.3);">No bookings match your search.</td>';
          bTable.querySelector('tbody').appendChild(msg);
        }
      }

      document.getElementById('booking-search').addEventListener('input', filterBookings);
      document.getElementById('booking-status-filter').addEventListener('change', filterBookings);
    }
  }

  /* ══════════════════════════════════════════════════════════
     4. ROOMS TABLE — SEARCH + QUICK STATUS CHANGE
  ══════════════════════════════════════════════════════════ */
  var roomsPanel = document.getElementById('panel-rooms');
  if (roomsPanel) {
    var rTable = roomsPanel.querySelector('.admin-table');
    if (rTable) {
      /* inject search above table */
      var rWrap = roomsPanel.querySelector('.admin-table-wrap');
      var rSearch = document.createElement('input');
      rSearch.type = 'text';
      rSearch.placeholder = 'Search room name or ID...';
      rSearch.style.cssText = 'width:100%;padding:.45rem .9rem;margin-bottom:.8rem;border-radius:7px;' +
        'border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.05);' +
        'color:inherit;font-size:.85rem;outline:none;';
      rWrap.parentNode.insertBefore(rSearch, rWrap);

      var rRows = rTable.querySelectorAll('tbody tr');

      rSearch.addEventListener('input', function () {
        var q = this.value.toLowerCase();
        rRows.forEach(function (row) {
          row.style.display = !q || row.textContent.toLowerCase().indexOf(q) !== -1 ? '' : 'none';
        });
      });

      /* quick status change: click any status badge in rooms table to cycle status */
      rTable.querySelectorAll('tbody .badge').forEach(function (badge) {
        badge.style.cursor = 'pointer';
        badge.title = 'Click to change status';

        badge.addEventListener('click', function () {
          var current = badge.textContent.trim();
          var next, cls;
          if (current === 'Available')    { next = 'Occupied';    cls = 'badge-info'; }
          else if (current === 'Occupied')  { next = 'Maintenance'; cls = 'badge-warning'; }
          else                              { next = 'Available';   cls = 'badge-success'; }

          badge.textContent = next;
          badge.className = 'badge ' + cls;

          /* flash feedback */
          badge.style.opacity = '0.4';
          setTimeout(function () { badge.style.opacity = '1'; }, 300);
        });
      });
    }
  }

  /* ══════════════════════════════════════════════════════════
     5. GUEST MESSAGES — mark read + quick reply
  ══════════════════════════════════════════════════════════ */
  var messagesPanel = document.getElementById('panel-messages');
  if (messagesPanel) {
    var msgItems = messagesPanel.querySelectorAll('.msg-item');

    msgItems.forEach(function (item) {
      /* find the existing Reply link (mailto) and upgrade it to inline reply */
      var existingReply = item.querySelector('a.btn-admin.btn-gold');
      var unreadBadge   = item.querySelector('.badge-warning');
      var actionArea    = existingReply ? existingReply.parentNode : null;

      /* Replace mailto reply with inline button */
      if (existingReply) {
        var replyBtn = document.createElement('button');
        replyBtn.className = 'btn-admin btn-gold';
        replyBtn.style.fontSize = '.72rem';
        replyBtn.innerHTML = '<i class="bi bi-reply"></i> Reply';
        existingReply.parentNode.replaceChild(replyBtn, existingReply);

        replyBtn.addEventListener('click', function () {
          showReplyBox(item, replyBtn);
        });
      }

      /* Add "Mark Read" button if the message is unread */
      if (unreadBadge && actionArea) {
        var markBtn = document.createElement('button');
        markBtn.style.cssText =
          'padding:.2rem .6rem;border-radius:5px;border:1px solid rgba(255,255,255,0.15);' +
          'background:transparent;color:inherit;cursor:pointer;font-size:.72rem;';
        markBtn.textContent = 'Mark Read';

        markBtn.addEventListener('click', function () {
          unreadBadge.style.display = 'none';
          item.classList.remove('msg-unread');
          item.style.opacity = '0.65';
          markBtn.disabled = true;
          markBtn.style.opacity = '0.35';
          updateMsgBadge(-1);
        });

        actionArea.appendChild(markBtn);
      }
    });
  }

  var msgBadgeCount = 5; // initial unread count shown in sidebar
  function updateMsgBadge(delta) {
    msgBadgeCount = Math.max(0, msgBadgeCount + delta);
    var badges = document.querySelectorAll('.sidebar-link.link-messages .badge, .topbar-badge .badge-dot');
    badges.forEach(function (b) {
      if (b.classList.contains('badge')) b.textContent = msgBadgeCount;
    });
    if (msgBadgeCount === 0) {
      document.querySelectorAll('.badge-dot').forEach(function (d) { d.style.display = 'none'; });
    }
  }

  function showReplyBox(item, btn) {
    /* remove any existing reply box */
    var existing = document.getElementById('inline-reply-box');
    if (existing) existing.remove();

    var box = document.createElement('div');
    box.id = 'inline-reply-box';
    box.style.cssText =
      'margin-top:.7rem;padding:.7rem 1rem;border-radius:7px;' +
      'border:1px solid rgba(201,169,110,0.2);background:rgba(201,169,110,0.05);';
    box.innerHTML =
      '<div style="display:flex;gap:.6rem;align-items:center;">' +
      '<input id="reply-input" type="text" placeholder="Type your reply..." ' +
      'style="flex:1;padding:.45rem .8rem;border-radius:6px;border:1px solid rgba(255,255,255,0.15);' +
      'background:rgba(255,255,255,0.06);color:inherit;font-size:.85rem;outline:none;" />' +
      '<button id="reply-send" style="padding:.45rem 1rem;border-radius:6px;border:none;' +
      'background:var(--gold,#c9a96e);color:#000;font-weight:600;cursor:pointer;font-size:.85rem;">Send</button>' +
      '<button id="reply-cancel" style="padding:.45rem .8rem;border-radius:6px;border:1px solid rgba(255,255,255,0.15);' +
      'background:transparent;color:inherit;cursor:pointer;font-size:.85rem;">Cancel</button>' +
      '</div>';

    item.appendChild(box);
    document.getElementById('reply-input').focus();

    document.getElementById('reply-cancel').addEventListener('click', function () {
      box.remove();
    });

    document.getElementById('reply-send').addEventListener('click', function () {
      var msg = document.getElementById('reply-input').value.trim();
      if (!msg) return;
      btn.innerHTML = '<i class="bi bi-check2"></i> Replied';
      btn.disabled = true;
      btn.style.color = '#34d399';
      btn.style.borderColor = '#34d399';
      box.remove();
    });
  }

  /* ══════════════════════════════════════════════════════════
     6. DASHBOARD — make "View All" buttons work
  ══════════════════════════════════════════════════════════ */
  /* Already covered by the panel nav listener above, nothing extra needed */

});
