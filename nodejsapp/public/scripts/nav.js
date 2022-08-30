document.addEventListener("DOMContentLoaded", function () {
  const nav = document.getElementById("nav");
  const navCloseButton = document.getElementById("nav-close-button");
  const navHamburgerButton = document.getElementById("nav-hamburger");

  const navOpen = ["opacity-100", "scale-100"];
  const navClose = ["opacity-0", "scale-95"];

  navHamburgerButton.addEventListener("click", function () {
    nav.classList.add(...navOpen);
    nav.classList.remove(...navClose);
    setTimeout(() => {
      nav.classList.remove("hidden");
    }, 150);
  });

  navCloseButton.addEventListener("click", function () {
    nav.classList.add(...navClose);
    nav.classList.remove(...navOpen);
    setTimeout(() => {
      nav.classList.add("hidden");
    }, 150);
  });
});
