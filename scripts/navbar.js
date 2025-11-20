const menuIcon = document.getElementById("menu-icon");
const closeMenu = document.getElementById("close-menu");
const navbar = document.querySelector(".navbar");
const menuBackdrop = document.getElementById("menuBackdrop");

// Function to open menu
function openMenu() {
  navbar.classList.add("active");
  menuBackdrop.classList.add("active");
  menuIcon.classList.add("active");
  closeMenu.classList.add("active");
  document.body.style.overflow = "hidden";
  menuIcon.setAttribute("aria-expanded", "true");
}

// Function to close menu
function closeMenuHandler() {
  navbar.classList.remove("active");
  menuBackdrop.classList.remove("active");
  menuIcon.classList.remove("active");
  closeMenu.classList.remove("active");
  document.body.style.overflow = "";
  menuIcon.setAttribute("aria-expanded", "false");
  
  // Reset menu items animation
  navbar.querySelectorAll("a").forEach(link => {
    link.style.animation = "none";
    setTimeout(() => {
      link.style.animation = "";
    }, 10);
  });
  
  // Reset menu header animation
  const menuHeader = navbar.querySelector(".menu-header");
  if (menuHeader) {
    menuHeader.style.animation = "none";
    setTimeout(() => {
      menuHeader.style.animation = "";
    }, 10);
  }
}

// Open menu
menuIcon.addEventListener("click", (e) => {
  e.preventDefault();
  openMenu();
});

// Close menu
closeMenu.addEventListener("click", (e) => {
  e.preventDefault();
  closeMenuHandler();
});

// Close menu when clicking backdrop
menuBackdrop.addEventListener("click", () => {
  closeMenuHandler();
});

// Close menu when clicking nav links (including nested spans)
navbar.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", (e) => {
    // Only close if clicking the link itself, not if it's a navigation link
    if (link.getAttribute("href") && link.getAttribute("href") !== "#") {
      // Small delay to allow navigation to happen
      setTimeout(() => {
        closeMenuHandler();
      }, 100);
    } else {
      closeMenuHandler();
    }
  });
});

// Close menu on escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navbar.classList.contains("active")) {
    closeMenuHandler();
  }
});

// Prevent body scroll when menu is open
document.addEventListener("touchmove", (e) => {
  if (navbar.classList.contains("active")) {
    if (!navbar.contains(e.target) && !menuBackdrop.contains(e.target)) {
      e.preventDefault();
    }
  }
}, { passive: false });
