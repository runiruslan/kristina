const header = document.querySelector("#site-header");
const menuToggle = document.querySelector("#menu-toggle");
const nav = document.querySelector("#main-nav");
const navLinks = document.querySelectorAll(".nav-link");
const sections = Array.from(document.querySelectorAll("main section[id]")).filter((section) => (
  document.querySelector(`.nav-link[href="#${section.id}"]`)
));
const revealItems = document.querySelectorAll(".reveal");
const filterButtons = document.querySelectorAll(".filter-button");
const workCards = document.querySelectorAll(".work-card");
const modal = document.querySelector("#project-modal");
const modalVisual = document.querySelector("#modal-visual");
const modalTitle = document.querySelector("#modal-title");
const modalCategory = document.querySelector("#modal-category");
const modalDetails = document.querySelector("#modal-details");
const modalDescription = document.querySelector("#modal-description");
const modalCloseItems = document.querySelectorAll("[data-close-modal]");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const heroSlides = document.querySelectorAll(".hero-bg");
const themeSwitches = document.querySelectorAll(".theme-switch-input");
const themeStorageKey = "kristina-color-theme";
const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

document.body.classList.add("js-ready");

function applyTheme(isGalleryTheme) {
  document.documentElement.dataset.theme = isGalleryTheme ? "gallery" : "warm";
  document.documentElement.style.colorScheme = isGalleryTheme ? "dark" : "light";
  document.body.classList.toggle("theme-gallery", isGalleryTheme);
  themeSwitches.forEach((themeSwitch) => {
    themeSwitch.checked = isGalleryTheme;
  });
}

function setTheme(isGalleryTheme, shouldAnimate = false) {
  if (!shouldAnimate || reduceMotionQuery.matches) {
    applyTheme(isGalleryTheme);
    return;
  }

  document.body.classList.add("theme-transitioning");

  if (document.startViewTransition) {
    const transition = document.startViewTransition(() => applyTheme(isGalleryTheme));
    transition.finished.finally(() => {
      document.body.classList.remove("theme-transitioning");
    });
    return;
  }

  applyTheme(isGalleryTheme);
  window.setTimeout(() => {
    document.body.classList.remove("theme-transitioning");
  }, 1250);
}

function saveTheme(isGalleryTheme) {
  try {
    localStorage.setItem(themeStorageKey, isGalleryTheme ? "gallery" : "warm");
  } catch (error) {
    return;
  }
}

try {
  setTheme(localStorage.getItem(themeStorageKey) === "gallery");
} catch (error) {
  setTheme(false);
}

themeSwitches.forEach((themeSwitch) => {
  themeSwitch.addEventListener("change", () => {
    setTheme(themeSwitch.checked, true);
    saveTheme(themeSwitch.checked);
  });
});

function startHeroSlider() {
  if (heroSlides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let activeIndex = 0;

  window.setInterval(() => {
    heroSlides[activeIndex].classList.remove("active");
    activeIndex = (activeIndex + 1) % heroSlides.length;
    heroSlides[activeIndex].classList.add("active");
  }, 3000);
}

startHeroSlider();

function updateHeader() {
  header.classList.toggle("scrolled", window.scrollY > 16);
}

function closeMenu() {
  nav.classList.remove("open");
  menuToggle.classList.remove("active");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Открыть меню");
  document.body.classList.remove("menu-open");
}

function toggleMenu() {
  const isOpen = nav.classList.toggle("open");
  menuToggle.classList.toggle("active", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
  document.body.classList.toggle("menu-open", isOpen);
}

menuToggle.addEventListener("click", toggleMenu);
navLinks.forEach((link) => link.addEventListener("click", closeMenu));
window.addEventListener("scroll", updateHeader);
updateHeader();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12
});

revealItems.forEach((item) => revealObserver.observe(item));

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const id = entry.target.getAttribute("id");
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
    });
  });
}, {
  rootMargin: "-42% 0px -46% 0px",
  threshold: 0
});

sections.forEach((section) => sectionObserver.observe(section));

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    workCards.forEach((card) => {
      const matches = filter === "all" || card.dataset.filter === filter;
      card.classList.toggle("hidden", !matches);
    });
  });
});

function openModal(card) {
  const visual = card.dataset.visual || "";

  modalTitle.textContent = card.dataset.title;
  modalCategory.textContent = card.dataset.category;
  modalDetails.textContent = card.dataset.details;
  modalDescription.textContent = card.dataset.description;
  modalVisual.className = `modal-visual work-photo ${visual}`;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

workCards.forEach((card) => {
  card.addEventListener("click", () => openModal(card));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openModal(card);
    }
  });
});

modalCloseItems.forEach((item) => item.addEventListener("click", closeModal));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
    closeMenu();
  }
});

function setError(field, message) {
  const error = contactForm.querySelector(`[data-error-for="${field.name}"]`);
  field.classList.toggle("invalid", Boolean(message));
  error.textContent = message;
}

function hasContact(value) {
  return value.trim().length >= 5;
}

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = contactForm.elements.name;
  const email = contactForm.elements.email;
  const message = contactForm.elements.message;
  let isValid = true;

  formStatus.textContent = "";

  if (name.value.trim().length < 2) {
    setError(name, "Укажите имя.");
    isValid = false;
  } else {
    setError(name, "");
  }

  if (!hasContact(email.value)) {
    setError(email, "Оставьте email или телефон.");
    isValid = false;
  } else {
    setError(email, "");
  }

  if (message.value.trim().length < 10) {
    setError(message, "Добавьте несколько деталей о проекте.");
    isValid = false;
  } else {
    setError(message, "");
  }

  if (!isValid) return;

  formStatus.textContent = "Спасибо. Запрос подготовлен к отправке.";
  contactForm.reset();
});
