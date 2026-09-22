# Hotel and Resort Management System

A luxury Hotel & Resort landing page and room reservation static web application. Rebuilt from modern UI design into a pure, clean static frontend for college project evaluation.

---

## Allowed Technologies Used
- **HTML5**: Semantic tags (`<header>`, `<nav>`, `<section>`, `<article>`, `<aside>`, `<footer>`), accessibility labels, heading hierarchy (`h1`, `h2`, `h3`).
- **CSS3**: Custom design tokens, typography, luxury color palette, responsive grid alignment, and micro-interactions (`css/style.css`).
- **Bootstrap 5**: Responsive layout utilities and grid system (`container`, `row`, `col-*`).
- **Bootstrap Icons**: Crisp vector UI icons for amenities, calendar, size, and guest capacity.

> **Note:** Strictly no React, Vite, Node.js, npm packages, or JavaScript interactions are used. The application runs immediately simply by opening `index.html` in any modern web browser.

---

## Project Structure
```text
Hotel-and-Resort-Management-System/
├── index.html            # Main Landing Page (Hero, Booking Bar, Rooms & Suites Grid, Footer)
├── room-details.html     # Dedicated Room Details Page (Banner, Amenities Grid, Reservation Card, Hotel Rules)
├── css/
│   └── style.css         # Single unified stylesheet with organized modular sections
└── assets/
    ├── fonts/            # Web fonts (Gilda Display, Barlow, Barlow Condensed)
    └── img/
        ├── heroSlider/   # Hero background photography
        ├── rooms/        # High-definition room cards and suite detail photography
        ├── logo-dark.svg
        ├── logo-white.svg
        └── room.jpg
```

---

## Collaboration & Git Branching Strategy
This repository follows standard Git branching best practices for college team collaboration:
- **`main`**: Protected production branch representing verified milestone releases.
- **`dev`**: Active development and integration branch.
- **`feature/<name>`**: Individual feature branches created by team members to work on isolated sections (e.g. `feature/header-and-hero`, `feature/booking-bar`, `feature/rooms-grid`, `feature/room-details`).

### Team Workflow for Contributing Members
1. Checkout the `dev` branch and pull latest changes:
   ```bash
   git checkout dev
   git pull origin dev
   ```
2. Create your own feature branch:
   ```bash
   git checkout -b feature/<your-feature-name>
   ```
3. Make your commits and merge into `dev`:
   ```bash
   git add .
   git commit -m "feat(<scope>): descriptive message"
   git checkout dev
   git merge feature/<your-feature-name>
   ```

---

## How to Run
Simply double-click `index.html` or right-click and open with your preferred browser (Chrome, Edge, Firefox, Safari).
