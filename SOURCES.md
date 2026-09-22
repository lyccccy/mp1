# Fieldwork — sources and implementation

A fictional nature journal implemented for CS409 MP1 with semantic HTML, SCSS,
and vanilla JavaScript. The existing Webpack tooling is retained. No runtime
UI libraries, inline event handlers, inline styles, or layout tables are used.

## Media

Downloaded locally on September 21, 2026. The deployed page does not depend on
external image or video servers.

- Mountain: https://images.unsplash.com/photo-1464822759023-fed622ff2c3b
- Forest: https://images.unsplash.com/photo-1448375240586-882707db888b
- Coast: https://images.unsplash.com/photo-1473116763249-2faaef81ccda
- Landscape image provider and license: https://unsplash.com/license
- Flower video (CC0 sample): https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4
- Video poster: a frame extracted from the above video with FFmpeg.
- Icons: original SVG drawings applied through CSS masks, including simplified
  Instagram and YouTube marks. Social links lead to National Geographic's public
  accounts for inspiration; no brand affiliation is claimed.
- Typography: installed system sans-serif and Georgia serif fonts.

## Authorship and assistance

Page design, illustrative editorial copy, SVG drawings, SCSS, and JavaScript were
created with OpenAI Codex assistance in response to the request to complete this
repository from its README. No external implementation code was copied. This
file records that assistance; it is not a substitute for any course-required
conversation share link. The template's `llm_logs.csv` has not been populated
with a fabricated link.

## Requirement map

| README requirement | Implementation |
| --- | --- |
| Full-width sections, header and footer | `src/index.html` semantic page structure |
| Sticky navigation | `.site-header`, `position: sticky` |
| Reading position, including page bottom | `updateNavigation()` in `src/js/main.js` |
| Shrinking navbar and text | `.is-scrolled`, SCSS height/font transitions |
| Smooth in-page navigation | Native scroll with compact-header offset and reduced-motion support |
| Three-slide carousel with side arrows | Explore section; directional horizontal sliding, arrows, dots, wrapping, keyboard and touch controls |
| At least three columns | `.values-grid` at all five required viewport widths |
| Horizontal and vertical centering | Shared `.container`; flex-centered `.pause-section` |
| Responsive layout | SCSS breakpoints at 1050px and 700px |
| Fixed background image | `.pause-section` forest background, disabled only for reduced-motion preference |
| Modal windows | Native `<dialog>`, close button, Escape, backdrop, focus restoration |
| HTML5 video | Local MP4 with native controls, poster, captions and download fallback |
| SCSS features | Variables, mixins, nesting, breakpoint map, icon loop |
| CSS3 animation | Hero entrance, horizontal slide animations, navbar and hover transitions |
| Scalable icons through CSS | Local SVG masks |
| Social media icons | Instagram and YouTube in footer |

## Run

- `npm install` (dependencies are already installed in this workspace)
- `npm start` then open http://localhost:8080
- `npm run build` generates `build/` for the existing GitHub Pages workflow.

Source changes are local. Publishing, the demonstration recording, and the
submission form are separate assignment steps.

## Verification performed

- `npm run build`: successful, including local video and caption assets.
- Browser layout checks: 1920×1080, 1366×768, 1280×720, 1024×768,
  768×1024, and 390×844; no horizontal page overflow. The first five sizes
  preserve three columns in the philosophy section.
- Navigation: smooth anchor movement, correct offset below the compact header,
  header height changing from 93px to 67px (including border), restored full
  height at page top, and final menu item highlighted at page bottom.
- Carousel: next arrow, previous wrapping from first to third, dot selection,
  and keyboard arrow navigation. Incoming and outgoing slides move together during
  the transition; exactly one slide remains visible after it settles. Consecutive
  clicks queue the latest destination; wraparound preserves the arrow direction.
- Dialog: matching story content, initial close-button focus, scroll lock,
  Escape dismissal, and focus returned to the opening button.
- Mobile menu: opens and closes when a section link is selected.
- Video: metadata loaded, native playback reached the 5.055-second end without
  a media error. Visible images loaded successfully.
- Browser extension warnings and extension-injected inline styles are outside
  the page source; no inline style attributes are authored in the project.
