# Hotel and Resort Management System

A luxury Hotel & Resort landing page, room catalog, spa wellness retreat, and dynamic reservation web platform. Built with semantic HTML5, pure responsive CSS3, and lightweight vanilla JavaScript for team evaluation.

---

## Team Contributors & Roles

| Contributor | Role & Assigned Responsibilities | Primary Branches |
| :--- | :--- | :--- |
| **Deepanshu Kashyap** (Lead) | Core landing page architecture, design tokens, responsive mobile drawer navigation, dynamic room details script logic. | `feature/home`, `feature/rooms`, `fix/deepanshu-core` |
| **Ayush Gupta** | Standalone Rooms catalog page, Spa & Wellness experience page, booking form field validation, modular page styles. | `rooms-spa`, `fix/ayush-gupta-pages` |
| **Ayush Tyagi** | Fine dining restaurant & wine section, guest inquiries & contact form, landing page spa preview CTA, unified footer. | `feature/restaurant-spa-contact`, `fix/ayush-tyagi-sections` |

---

## Technologies Used
- **HTML5**: Semantic tags (`<header>`, `<nav>`, `<section>`, `<article>`, `<aside>`, `<footer>`), accessibility ARIA attributes, structured heading hierarchy.
- **CSS3**: Custom design tokens, luxury typography, glassmorphism, responsive grid layouts, and micro-interactions (`css/style.css`, `css/rooms.css`, `css/spa.css`).
- **Bootstrap 5**: Responsive grid framework (`container`, `row`, `col-*`).
- **Bootstrap Icons**: Vector UI icons for room amenities, contact details, calendar pickers, and social links.
- **Vanilla JavaScript**: Zero-dependency client-side scripting for mobile navigation toggle, auto-closing menu, and dynamic URL query parameter room rendering (`js/main.js`).

---

## Project Structure
```text
Hotel-and-Resort-Management-System/
├── index.html            # Main Landing Page (Hero, Booking Bar, Rooms, Restaurant, Spa Preview, Contact)
├── rooms.html            # Standalone Room Catalog & Filtering Page (Contributed by Ayush Gupta)
├── room-details.html     # Dynamic Room Details & Reservation Page (Contributed by Deepanshu Kashyap)
├── spa.html              # Dedicated Spa & Wellness Experience Page (Contributed by Ayush Gupta)
├── css/
│   ├── style.css         # Core design system, navigation, typography, landing page & detail styles
│   ├── rooms.css         # Standalone rooms catalog styling
│   └── spa.css           # Dedicated spa treatments & pricing styling
├── js/
│   └── main.js           # Shared mobile drawer navigation and interaction handlers
└── assets/
    ├── fonts/            # Web fonts (Gilda Display, Barlow, Barlow Condensed)
    └── img/
        ├── heroSlider/   # High-definition resort and atmosphere photography
        ├── rooms/        # Room cards and suite photography (1.png - 8.png, 5-lg.png)
        ├── logo-dark.svg
        ├── logo-white.svg
        └── room.jpg
```

---

## Collaboration & Git Branching Strategy
This repository adheres to standard Git branching and team collaboration practices:
- **`main`**: Protected production branch with verified milestone releases.
- **`dev`**: Active integration branch where all contributor branches are tested and merged.
- **`fix/<contributor>-<scope>`**: Role-specific feature and fix branches assigned per team member.
- **`--no-ff` (No Fast-Forward)**: All merges preserve explicit merge commits to maintain clear audit trails of individual contributions and feature integration points.

### Contributing Workflow
1. Switch to `dev` and pull latest updates:
   ```bash
   git checkout dev
   git pull origin dev
   ```
2. Create an assigned feature or fix branch:
   ```bash
   git checkout -b fix/your-role-scope
   ```
3. Commit using conventional commit format:
   ```bash
   git commit -m "feat(scope): descriptive message"
   ```
4. Merge back to `dev` preserving branch history:
   ```bash
   git checkout dev
   git merge --no-ff fix/your-role-scope
   ```

---

## How to Run
Simply open `index.html`, `rooms.html`, or `spa.html` in any web browser (Chrome, Edge, Firefox, Safari) or serve locally using any static web server:
```bash
python -m http.server 8000
```
Open `http://localhost:8000` to preview.
