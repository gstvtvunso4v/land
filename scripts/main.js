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
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      if (this.classList.contains("interactive")) {
        const target = document.querySelector(
          `.section-${+this.dataset.index + 1}`
        );
        window.scrollTo({
          top: target.offsetTop,
          behavior: "smooth",
        });

        window.czarverse.onMenuItemClick(+this.dataset.index);
      }
    } else {
      if (this.classList.contains("interactive")) {
        window.czarverse.onMenuItemClick(+this.dataset.index);
      }
    }
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
