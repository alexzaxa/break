# Ξύλινο Café Bar Restaurant — Website

Static multi-page website for Ξύλινο Café Bar Restaurant in Δήλεσι.

## Current design
The site uses one shared visual system across every public page: warm café tones, charcoal surfaces, orange accents, tactile borders/shadows, responsive editorial layouts, and the existing Ξύλινο photography and content.

## Pages
- `index.html` — homepage
- `menu.html` — food menu with category navigation and live search
- `drinks.html` — drinks menu with category navigation and live search
- `gallery.html` — responsive gallery with keyboard-accessible lightbox
- `contact.html` — visit information, telephone links and Google Maps embed
- `404.html` — custom not-found page

## Frontend
- `assets/css/styles.css` — shared design system and all responsive layouts
- `assets/js/app.js` — mobile navigation, live opening status, reveal effects, menu filtering, category state, gallery lightbox, and back-to-top control
- `assets/images/` — existing business photography
- `assets/icons/` — favicon and touch icons

## Business data kept intact
- Phone: `22620 35629`
- Address: Απόλλωνα, Παραλία Πλάκα, Δήλεσι 32009
- Hours: daily `08:00–02:00`
- Food and drink names/prices remain in the HTML menu pages

## Local preview
Run any static web server from this folder, for example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/`.

## Validation performed
- JavaScript syntax check with Node.js
- CSS parse validation
- Local asset/reference checks for all HTML pages
- Duplicate ID and internal anchor checks
- Menu/search hooks and gallery/lightbox hooks verified in the markup

No backend, authentication, database, payment processor, or API runtime is included in this project; the interactive functionality is client-side.
