// Native browser APIs only: navigation, carousel, and accessible story dialogs.
const header = document.querySelector(".site-header");
const navigation = document.querySelector(".main-nav");
const navigationLinks = [...navigation.querySelectorAll("a")];
const sections = navigationLinks.map((link) =>
  document.querySelector(link.hash)
);
const menuToggle = document.querySelector(".menu-toggle");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
let scrollScheduled = false;

function updateNavigation() {
  header.classList.toggle("is-scrolled", window.scrollY > 30);
  const headerBottom = header.getBoundingClientRect().bottom + 2;
  let activeSection = sections[0];
  sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= headerBottom)
      activeSection = section;
  });
  // The final section may be too short to reach the navbar; the page bottom wins.
  if (
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight - 3
  ) {
    activeSection = sections[sections.length - 1];
  }
  navigationLinks.forEach((link) => {
    if (link.hash === `#${activeSection.id}`)
      link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  scrollScheduled = false;
}
function scheduleNavigationUpdate() {
  if (!scrollScheduled) {
    scrollScheduled = true;
    window.requestAnimationFrame(updateNavigation);
  }
}
function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  navigation.classList.remove("is-open");
}
menuToggle.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(expanded));
  navigation.classList.toggle("is-open", expanded);
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuToggle.getAttribute("aria-expanded") === "true"
  ) {
    closeMenu();
    menuToggle.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!header.contains(event.target)) closeMenu();
});
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    closeMenu();
    const compactHeight = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--nav-small")
    );
    // A sticky header remains in document flow. Account for its pending shrink.
    const headerDelta = header.getBoundingClientRect().height - compactHeight;
    const top =
      target.id === "home" || target.id === "main"
        ? 0
        : window.scrollY +
          target.getBoundingClientRect().top -
          compactHeight -
          headerDelta;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: motionPreference.matches ? "instant" : "smooth",
    });
    if (window.location.hash !== link.hash)
      window.history.pushState(null, "", link.hash);
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
});
window.addEventListener("scroll", scheduleNavigationUpdate, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 700) closeMenu();
  scheduleNavigationUpdate();
});
header.addEventListener("transitionend", scheduleNavigationUpdate);
window.addEventListener("load", scheduleNavigationUpdate);
updateNavigation();

const carousel = document.querySelector(".carousel");
const slides = [...carousel.querySelectorAll(".slide")];
const dots = [...carousel.querySelectorAll(".slide-dots button")];
const counter = document.getElementById("slide-number");
let currentSlide = 0;
let requestedSlide = 0;
let isSliding = false;
let queuedSlide = null;
const slideAnimationClasses = [
  "slide-enter-next",
  "slide-exit-next",
  "slide-enter-previous",
  "slide-exit-previous",
];

function updateSlideControls() {
  slides.forEach((slide, slideIndex) => {
    const active = slideIndex === currentSlide;
    slide.classList.toggle("is-active", active);
    // Outgoing slides remain painted during the animation, but are not interactive.
    slide.inert = !active;
    slide.setAttribute("aria-hidden", String(!active));
  });
  dots.forEach((dot, dotIndex) => {
    if (dotIndex === currentSlide) dot.setAttribute("aria-current", "true");
    else dot.removeAttribute("aria-current");
  });
  counter.textContent = String(currentSlide + 1).padStart(2, "0");
}

function finishSlideTransition() {
  if (!isSliding) return;
  isSliding = false;
  slides.forEach((slide, index) => {
    slide.hidden = index !== currentSlide;
    slide.classList.remove(...slideAnimationClasses);
  });
  if (queuedSlide) {
    const next = queuedSlide;
    queuedSlide = null;
    transitionToSlide(next.index, next.direction);
  }
}

function transitionToSlide(index, direction) {
  if (index === currentSlide) return;
  const outgoing = slides[currentSlide];
  const incoming = slides[index];
  if (outgoing.contains(document.activeElement))
    carousel.focus({ preventScroll: true });
  currentSlide = index;
  incoming.hidden = false;
  updateSlideControls();
  if (motionPreference.matches) {
    outgoing.hidden = true;
    return;
  }
  isSliding = true;
  const side = direction > 0 ? "next" : "previous";
  outgoing.classList.add(`slide-exit-${side}`);
  incoming.classList.add(`slide-enter-${side}`);
}

function showSlide(index) {
  const target = (index + slides.length) % slides.length;
  const direction = index > requestedSlide ? 1 : -1;
  requestedSlide = target;
  // Keep the latest destination when controls are used during a transition.
  if (isSliding) queuedSlide = { index: target, direction };
  else transitionToSlide(target, direction);
}

carousel.querySelector(".slides").addEventListener("animationend", (event) => {
  if (
    event.target === slides[currentSlide] &&
    event.animationName.startsWith("slide-in-")
  ) {
    finishSlideTransition();
  }
});
motionPreference.addEventListener("change", () => {
  if (motionPreference.matches) finishSlideTransition();
});
updateSlideControls();
carousel
  .querySelector(".previous")
  .addEventListener("click", () => showSlide(requestedSlide - 1));
carousel
  .querySelector(".next")
  .addEventListener("click", () => showSlide(requestedSlide + 1));
dots.forEach((dot, index) =>
  dot.addEventListener("click", () => showSlide(index))
);
carousel.addEventListener("keydown", (event) => {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  if (slides[currentSlide].contains(document.activeElement))
    carousel.focus({ preventScroll: true });
  if (event.key === "Home") showSlide(0);
  else if (event.key === "End") showSlide(slides.length - 1);
  else showSlide(requestedSlide + (event.key === "ArrowRight" ? 1 : -1));
});
let touchStart = null;
carousel.addEventListener(
  "touchstart",
  (event) => {
    touchStart = {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY,
    };
  },
  { passive: true }
);
carousel.addEventListener(
  "touchend",
  (event) => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5)
      showSlide(requestedSlide + (dx < 0 ? 1 : -1));
    touchStart = null;
  },
  { passive: true }
);

const stories = {
  alpine: {
    category: "THE MOUNTAIN COLLECTION",
    title: "Into the alpine.",
    paragraphs: [
      "There is a particular kind of quiet above the trees. The wind gets a little louder, the horizon gets a little wider, and everyday worries begin to feel a little smaller.",
      "Start with a marked trail that suits your experience. Bring layers, water, and a map, and check local weather and trail conditions before setting out. Turning around is part of a good day outside, too.",
      "Try this: stop for a minute before taking a photograph. Notice three things the camera won’t capture—the wind, the temperature, and the sound of your own footsteps.",
    ],
  },
  forest: {
    category: "THE FOREST COLLECTION",
    title: "Among the evergreens.",
    paragraphs: [
      "Step beneath the canopy and the whole pace of the day changes. Light gathers in small patches. Branches frame the sky. The path becomes enough of a plan.",
      "Choose an established woodland trail and let yourself walk slowly. Keep to the path, give wildlife space, and take your litter home. A familiar park can be just as rewarding as a faraway forest.",
      "Try this: pause at a safe spot and listen for a full minute. Count the different sounds, from leaves overhead to birds somewhere out of sight.",
    ],
  },
  coast: {
    category: "THE COAST COLLECTION",
    title: "Where the land ends.",
    paragraphs: [
      "At the edge of the water, there is less to do and more to notice. Waves repeat themselves without ever being quite the same. The horizon leaves plenty of room for a wandering mind.",
      "Follow a designated coastal path, check local tide and weather information, and keep back from cliff edges. Leave shells and stones where you find them; they are part of someone else’s home.",
      "Try this: find a safe place to sit and watch the water for five uninterrupted minutes. No photograph needed.",
    ],
  },
  afternoon: {
    category: "FIELD NOTE 001 · MINDFUL WANDERING",
    title: "An afternoon with nowhere to be.",
    paragraphs: [
      "We tend to measure a good day by how much we fit into it. A place visited. A trail completed. A photograph taken. But an afternoon outside doesn’t need a scorecard.",
      "Pick one nearby place and give it a little more time than usual. Walk past the first bench. Follow the public path around another bend. Stop when something catches your attention, even if it is only a pattern of shadows.",
      "Leave the destination open, but make the practical details easy: tell someone where you are going, bring what you need, and know how you will get home.",
      "The point isn’t to do nothing. It’s to leave enough room to notice what is already there.",
    ],
  },
  nearby: {
    category: "FIELD NOTE 002 · EVERYDAY ADVENTURE",
    title: "Your next adventure might be next door.",
    paragraphs: [
      "A new perspective rarely needs a plane ticket. Sometimes it starts with taking a different turn on your usual walk, or visiting the same park at a different time of day.",
      "Choose a small theme for your next walk: interesting trees, warm light, or places where the city gets quiet. Let it guide your attention rather than your route.",
      "Make a field note when you get home. One sentence about what you saw, one about what you heard, and one about how you felt. Over time, these ordinary outings become a map of a place you know more deeply.",
      "Start with twenty minutes. There is probably something worth noticing just around the corner.",
    ],
  },
  credits: {
    category: "ABOUT THIS PROJECT",
    title: "A few thank-yous.",
    paragraphs: [
      "Fieldwork is a fictional editorial brand created as a CS409 MP1 student website. Stories are original illustrative writing; the collections are inspiration, not specific trip itineraries.",
      "Landscape photographs are from Unsplash. The flower film is the CC0 sample hosted by MDN. All media is served locally. The compass, leaf, sun, location, menu, and social icons are original SVG drawings used as CSS masks.",
      "Built with semantic HTML, SCSS, and vanilla JavaScript. No runtime UI libraries. The footer links point to National Geographic’s public social channels for further inspiration; Fieldwork is not affiliated with National Geographic.",
      "Implementation and copy were created with assistance from OpenAI Codex. See SOURCES.md in the project for asset URLs and implementation notes.",
    ],
  },
};
const dialog = document.getElementById("story-dialog");
let dialogTrigger = null;
document.querySelectorAll("[data-story]").forEach((button) => {
  button.addEventListener("click", () => {
    const story = stories[button.dataset.story];
    if (!story) return;
    dialogTrigger = button;
    document.getElementById("dialog-category").textContent = story.category;
    document.getElementById("dialog-title").textContent = story.title;
    document.getElementById("dialog-body").replaceChildren(
      ...story.paragraphs.map((text) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = text;
        return paragraph;
      })
    );
    document.body.classList.add("modal-open");
    dialog.showModal();
    dialog.scrollTop = 0;
  });
});
dialog
  .querySelector(".dialog-close")
  .addEventListener("click", () => dialog.close());
dialog
  .querySelector(".dialog-done")
  .addEventListener("click", () => dialog.close());
let pointerStartedOnBackdrop = false;
dialog.addEventListener("pointerdown", (event) => {
  pointerStartedOnBackdrop = event.target === dialog;
});
dialog.addEventListener("click", (event) => {
  if (event.target === dialog && pointerStartedOnBackdrop) dialog.close();
});
dialog.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  if (dialogTrigger) dialogTrigger.focus({ preventScroll: true });
});
