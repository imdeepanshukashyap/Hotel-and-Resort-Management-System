# Admin Panel - Hotel & Spa Adina

Static client-side admin interface built in pure HTML and CSS.
No server-side code. No JavaScript. Works by opening admin/index.html directly in a browser.

## Panels
- Dashboard  - Overview stats, recent bookings, occupancy chart, activity feed
- Rooms       - All 8 rooms with status, rates, and occupancy bars
- Bookings    - Full reservation table with guest details
- Spa         - Daily treatment schedule and package popularity
- Messages    - Guest inbox from website contact form
- Settings    - Hotel profile, notification toggles, team access

## Navigation
Uses CSS :target selector trick. Clicking sidebar links updates the URL hash,
which CSS uses to show/hide the correct panel. Zero JavaScript required.

## Author
Deepanshu Kashyap (Lead / Admin Panel)
Branch: feature/admin-panel

