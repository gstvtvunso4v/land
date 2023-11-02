var hamburger = document.querySelector(".hamburger");
var menu = document.querySelector(".menu");
var menuClose = document.querySelector(".menu-close");
var menuItemLink = document.querySelectorAll(".menu .menu-item a");

hamburger.addEventListener("click", function () {
  menu.classList.add("open");
});

menuClose.addEventListener("click", function () {
  menu.classList.remove("open");
});

menuItemLink.forEach((item) => {
  item.addEventListener("click", function () {
    menu.classList.remove("open");
  });
});

window.addEventListener("click", function (e) {
  if (
    menu.classList.contains("open") &&
    !menu.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    menu.classList.remove("open");
  }
});
