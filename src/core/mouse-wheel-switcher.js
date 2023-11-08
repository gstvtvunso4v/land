class MouseWheelSwitcher {
  constructor(czarverse) {
    this.czarverse = czarverse;
    this.container = document.body;

    this.lastScenesSwitchTime = this.czarverse.lastScenesSwitchTime;
    this.calmScenesSwitchDuration = this.czarverse.calmScenesSwitchDuration;

    this.container.addEventListener("wheel", this.onWheel.bind(this));
  }

  onWheel(event) {
    if (
      Date.now() - this.lastScenesSwitchTime <
      this.calmScenesSwitchDuration
    ) {
      return;
    }

    const { czarverse } = this;
    const { section1, section2, section3 } = czarverse;

    if (section1.isVisible) {
      // в 1 секции просто переключаем сцены по колёсику
      if (event.deltaY > 0) {
        czarverse.onRightArrowClick();
      } else {
        czarverse.onLeftArrowClick();
      }
    } else if (section2.isVisible) {
      const heightWithoutCanvas =
        section2.longScrollContainer.scrollHeight -
        section2.containerBounds.height;
      const scrollTop = section2.scrollContainer.scrollTop;

      // во 2 секции мы можем скроллить назад и попадать в 1 секцию
      if (event.deltaY < 0 && scrollTop === 0) {
        czarverse.onLeftArrowClick();
      } else if (event.deltaY > 0 && scrollTop === heightWithoutCanvas) {
        czarverse.onRightArrowClick();
      }
    } else if (section3.isVisible) {
      // в 3 секции мы можем скроллить только назад и только если мы вернулись наверх 3 секции
      if (event.deltaY < 0 && section3.scrollContainer.scrollTop === 0) {
        czarverse.onLeftArrowClick();
      }
      czarverse.section3.scrollHandler(section3.scrollContainer.scrollTop);
    }

    this.lastScenesSwitchTime = Date.now();
  }
}

export default MouseWheelSwitcher;
