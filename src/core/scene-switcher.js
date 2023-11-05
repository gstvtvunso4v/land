import isMobile from 'is-mobile';
import ZingTouch from 'zingtouch';

class SceneSwitcher {
  blockTopScroll = false;

  constructor(czarverse) {
    this.czarverse = czarverse;
    this.container = document.body;

    this.lastScenesSwitchTime = this.czarverse.lastScenesSwitchTime;
    this.calmScenesSwitchDuration = this.czarverse.calmScenesSwitchDuration;

    if (isMobile()) {
      this.initTouch();
    } else {
      this.container.addEventListener("wheel", this.onWheel.bind(this));
    }
  }

  update() {
    if (!isMobile()) {
      return;
    }

    const { czarverse } = this;
    const { section1, section2, section3 } = czarverse;
    const y = window.pageYOffset;

    const section1Height = window.innerHeight;
    const section2Height = section2.longScrollContainer.scrollHeight;
    const section3Height = section3.longScrollContainer.scrollHeight;

    if (y > section1Height - section1Height / 2 && y < section1Height) {
      // кусочек первой секции и второй
      section1.isVisible = true;
      section2.isVisible = true;
      section3.isVisible = false;
    } else if (y <= section1Height) {
      // только первая секция
      // 0...844
      section1.isVisible = true;
      section2.isVisible = false;
      section3.isVisible = false;
    }

    if (y > section1Height && y < section2Height) {
      // только вторая секция
      // 844...2805
      section1.isVisible = false;
      section2.isVisible = true;
      section3.isVisible = false;
    } else if (y >= section2Height && y <= section1Height + section2Height) {
      // кусочек второй и третьей секции
      // 2805...3649
      section1.isVisible = false;
      section2.isVisible = true;
      section3.isVisible = true;
    } else if (y >= section1Height + section2Height) {
      // только третья секция
      // 3649...end
      section1.isVisible = false;
      section2.isVisible = false;
      section3.isVisible = true;
    }

    // если мы доскроллили обратно на самый верх, переключаем нас в самое начало
    // 3 и 4 сцены в 2 и 3 секциях
    if (this.czarverse.currentSceneIndex > 2 && y === 0 && !this.blockTopScroll) {
      // this.czarverse.onMenuItemClick(0);
      // this.czarverse.onLeftArrowClick(true);
      // this.czarverse.onLeftArrowClick(true); // до 2 сцены

      let count = this.czarverse.currentSceneIndex - 2;

      for (let i = 0; i < count; i++) {
        this.czarverse.onLeftArrowClick(true);
      }
    }
  }

  initTouch() {
    const { czarverse } = this;
    const { section1, section2, section3 } = czarverse;

    const section1Element = document.querySelector('.section-1');
    const section1Region = ZingTouch.Region(section1Element, true, true);

    section1Region.bind(section1Element, 'swipe', (event) => {
      const directionInDegrees = event.detail.data[0].currentDirection;

      if (directionInDegrees >= 0 && directionInDegrees <= 180) {
        czarverse.onRightArrowClick();
      } else {
        czarverse.onLeftArrowClick();
      }
    });
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
    }

    this.lastScenesSwitchTime = Date.now();
  }
}

export default SceneSwitcher;
