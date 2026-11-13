# Ifraah Hassan Abdulle - Personal Portfolio

A professional, fully responsive personal portfolio website for a Junior Full-Stack Web Developer. Designed with a clean, modern aesthetic utilizing a soft purple/lavender color palette.

## Technologies Used
- HTML5
- CSS3 (Custom Styling & Variables)
- Vanilla JavaScript
- Bootstrap 4.6
- Font Awesome 6 (Icons)
- Google Fonts (Poppins & Caveat)
- AOS (Animate on Scroll) Library

## Project Structure

- `index.html` — portfolio home page
- `projects.html` — project gallery
- `downloads.html` — searchable software and tools library
- `data/software.json` — centralized catalog; add an entry here to add a card
- `js/library.js` — catalog rendering, filters, sorting, and details modal
- `guides.html` — searchable guide directory and in-page documentation reader
- `data/guides.json` — structured guide content; add/edit/remove entries here
- `js/guides.js` — guide search, category filters, reading view, table of contents, navigation, and copy buttons
- `css/style.css` — shared portfolio and library styles

The library opens publisher and documentation pages in a new tab. Serve the project over HTTP (for example, with a local static web server) so the browser can load `data/software.json`; direct `file://` opening does not allow the catalog fetch in most browsers. Catalog metadata is manually curated and should be rechecked at each publisher before use.

Guides are text content in `data/guides.json`, not downloadable archives. To publish one, add an entry with a unique `id`, set `published` to `true`, and provide its category, introduction, requirements, ordered `steps`, warnings, troubleshooting items, references, and `lastUpdated` date. Set `published` to `false` to hide an entry; deleting the object removes it. Optional `images` and `downloadUrl` fields are supported. There is no backend or admin dashboard in this static portfolio, so guide management is done by editing this data file.
