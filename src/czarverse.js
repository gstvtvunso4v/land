import Assets from "./core/assets.js";
import Section1 from "./section/section-1.js";
import Section2 from "./section/section-2.js";
import MouseWheelSwitcher from "./core/mouse-wheel-switcher.js";
import section3 from "./section/section-3.js";

// + сделать переключалку и магнитный скролл с позишн стики
// + выделить тридешку, переключение и её скролл в отдельный класс?
// + нужны разные рендереры, постпроцессинг
// + тени на персонажах первой сцены

// + камеру вокруг одной оси и вокруг точки, чтобы передать объем
// + как сделаешь фокус камеры на точке, можно сделать чтобы лого медленно трэкало камеру lookAt Speed / 10
// + ограничения по оси Y у мышки
// - анимация лого по скроллу
// + починить тени у персонажа
// + не рендерить две сцены одновременно

// + сделать контролы для фильтров для второй тридешки
// + сделать плавный скролл (изинг) при переключении сцен (как если переключаемся назад со 2 на 1 сцену)
// + сделать вращение мышкой как в первой секции для второй секции
// + переход между первой и второй секцией
// + сделать скролл планвым между секциями
// + ТАБЫ НЕ ДЕЛАТЬ
// - добавить в дебажные контролы параметры скорости анимации для перехода между сценами (3д и штмл)
// + тени в третьей секции с чертами
// + цвета должны матчится в чертах
//
// потом, будет анимация для меня
// + сделать анимацию ухода/прихода блоков текста + опасити

class Czarverse {
  // count this in updateLoader when model updated
  totalResourcesCount = 6; ////////////////////////////////////////////////////////////////////

  currentSceneIndex = -1;
  previousSceneIndex = -1;
  scenesCount = 5;

  animationDirection = 0; // 0 left, 1 right

  lastScenesSwitchTime = -1;
  calmScenesSwitchDuration = 1500; // 100 1500

  scenesTimings = [
    // первая секция
    2.3, 4.266666889190674, 6.233333110809326,
  ];

  section1 = null;
  section2 = null;
  section3 = null;

  currentSection = null;

  leftArrow = null;
  rightArrow = null;

  constructor() {
    this.detectDevice();

    this.assets = new Assets(this);
    this.assets.manager.onProgress = this.updateLoading.bind(this);

    const loads = [this.assets.load()];

    Promise.all(loads)
      .then(() => {
        this.onLoad();
      })
      .catch(this.onError.bind(this));
  }

  detectDevice() {
    this.isWindows = window.navigator.platform.includes("Win");
    this.isMacOS = window.navigator.platform.includes("Mac");

    if (this.isWindows) {
      document.body.classList.add("windows");
    }

    if (this.isMacOS) {
      document.body.classList.add("macos");
    }
  }

  update(time) {
    requestAnimationFrame(this.update.bind(this));

    this.section1.update();
    this.section2.update();
    this.section3.update();
  }

  onLoad() {
    this.section1 = new Section1(this);
    this.section2 = new Section2(this);
    this.section3 = new section3(this);

    this.section1.nextSection = this.section2;
    this.section2.previousSection = this.section1;
    this.section2.nextSection = this.section3;
    this.section3.previousSection = this.section2;

    this.leftArrow = document.querySelector(".arrow-left");
    this.rightArrow = document.querySelector(".arrow-right");

    this.mouseWheelSwitcher = new MouseWheelSwitcher(this);

    this.update();

    this.hideLoadingScreen();

    window.scrollTo(0, 0);
    this.onRightArrowClick();

    // скроллим вниз, чтобы сразу показать модельку
    // window.scrollTo(0, this.scrollContainer.scrollHeight * 0.3);

    console.log(this);
  }

  onError(error) {
    console.error(`Error while downloads and connections, reasons:`, error);
  }

  // ui functions
  updateLoading(url, itemsLoaded, itemsTotal) {
    const percent = Math.round((itemsLoaded / this.totalResourcesCount) * 80); // 80% is maximum width

    document.querySelector(".loading-text").textContent =
      percent + "% LOADING...";
    document.querySelector(".loading-bar-percent").style.width = percent + "%";
  }

  hideLoadingScreen() {
    document.querySelector(".loading").classList.add("hidden");
    document.querySelector(".menu").classList.remove("hidden");
    document.querySelector(".hamburger").classList.remove("hidden");

    // document.querySelectorAll('.section').forEach(el => el.classList.remove('hidden'));
    document
      .querySelectorAll(".arrow")
      .forEach((el) => el.classList.remove("hidden"));

    document.querySelector(".logo").classList.remove("centered");
  }

  onMenuItemClick(sectionIndex) {
    let targetSceneIndex;

    switch (sectionIndex) {
      case 0:
        targetSceneIndex = 0;
        break;
      case 1:
        targetSceneIndex = 3;
        break;
      case 2:
        targetSceneIndex = 7;
        break;
    }

    if (this.currentSceneIndex > targetSceneIndex) {
      let count = this.currentSceneIndex - targetSceneIndex;

      for (let i = 0; i < count; i++) {
        this.onLeftArrowClick(true);
      }
    } else if (this.currentSceneIndex < targetSceneIndex) {
      let count = targetSceneIndex - this.currentSceneIndex;

      for (let i = 0; i < count; i++) {
        this.onRightArrowClick(true);
      }
    }
  }

  onLeftArrowClick(instant = false) {
    if (!instant) {
      if (
        Date.now() - this.lastScenesSwitchTime <
        this.calmScenesSwitchDuration
      ) {
        return;
      }
    }

    this.previousSceneIndex = this.currentSceneIndex;

    if (this.currentSceneIndex > 0) {
      this.currentSceneIndex--;
    }

    this.animationDirection = 0;

    this.onArrowClick(instant);

    this.lastScenesSwitchTime = Date.now();
  }

  onRightArrowClick(instant = false) {
    if (!instant) {
      if (
        Date.now() - this.lastScenesSwitchTime <
        this.calmScenesSwitchDuration
      ) {
        return;
      }
    }

    this.previousSceneIndex = this.currentSceneIndex;

    if (this.currentSceneIndex < this.scenesCount - 1) {
      this.currentSceneIndex++;
    }

    this.animationDirection = 1;

    this.onArrowClick(instant);

    this.lastScenesSwitchTime = Date.now();
  }

  onArrowClick(instant = false) {
    const scenesElements = document.querySelectorAll(".scene");

    let section;

    const left = this.leftArrow;
    const right = this.rightArrow;

    const hiddenClassName = "hidden";

    left.classList.remove(hiddenClassName);
    right.classList.remove(hiddenClassName);

    if (this.currentSceneIndex === 0) {
      left.classList.add(hiddenClassName);
    }

    if (this.currentSceneIndex === this.scenesCount - 1) {
      right.classList.add(hiddenClassName);
    }

    scenesElements.forEach((el) => {
      el.classList.add(hiddenClassName);
      el.classList.remove("go-down", "go-up");
    });

    // в первой секции 3 сцены
    // во второй секции 4 сцены
    // во третьей секции 1 сцена
    if (this.currentSceneIndex < 3) {
      // indexes: 0, 1, 2
      section = this.section1;

      this.section1.isVisible = true;
      this.section2.isVisible = false;
      this.section3.isVisible = false;
    } else if (this.currentSceneIndex === 3) {
      // indexes: 3
      section = this.section2;

      this.section1.isVisible = false;
      this.section2.isVisible = true;
      this.section3.isVisible = false;
    } else {
      // indexes: 7
      section = this.section3;

      this.section1.isVisible = false;
      this.section2.isVisible = false;
      this.section3.isVisible = true;
    }

    // если нужно, скроллим к нужной секции с фейдом
    if (section !== this.currentSection && this.currentSection) {
      this.scrollToSection(
        section,
        section.backgroundColor,
        this.currentSection,
        instant
      );

      this.currentSection = section;
    } else {
      this.currentSection = section;

      // в первой секции мы контроллируем animationTarget по клику на стрелки, а не по скроллу
      if (section === this.section1) {
        section.animationTarget = this.scenesTimings[this.currentSceneIndex];
      }
    }

    // handle menu instant inertia and it return
    if (instant) {
      section.noInertia = true;
      clearTimeout(this.noInertiaTimeoutId);
      this.noInertiaTimeoutId = setTimeout(() => {
        section.noInertia = false;
      }, 500);
    }

    const currentScene = scenesElements[this.currentSceneIndex];
    const previousScene = scenesElements[this.previousSceneIndex];
    currentScene.classList.remove(hiddenClassName);

    // if (this.animationDirection === 0) {
    //   // left
    // } else {
    //   // right
    // }

    currentScene.classList.add("go-down");

    // нужно в случае инициализации
    if (previousScene) {
      previousScene.classList.add("go-up");
    }

    if (this.currentSection === this.section1) {
      this.section1.playCharacterAnimation = true;
    }
  }

  scrollToSection(target, color, previousSection, instant = false) {
    target.isVisible = true;

    previousSection.isVisible = true; // для того чтобы не выключать рендеринг до завершения анимации
    const previousBg =
      previousSection.scrollContainer.querySelector(".section-animation");

    previousBg.style.backgroundColor = color;
    previousBg.style.opacity = "1";

    // if (target === this.section2) {
    //   target.animationTarget = 0;
    // }

    setTimeout(
      () => {
        target.canvasContainer.scrollIntoView({ behavior: "auto" }); // instant scroll

        previousSection.isVisible = false;
        previousBg.style.opacity = "0";

        const menu = document.querySelector(".menu");
        menu.classList.remove("white");

        if (target === this.section2) {
          this.section2.playShowAnimation();
          this.section2.scrollContainer.scrollTo({
            top: 0,
            behaviour: "instant",
          }); // if we got here by menu
        }

        if (target === this.section3) {
          this.section3.showAction.reset().play();
          this.section3.scrollContainer.scrollTo({
            top: 0,
            behaviour: "instant",
          }); // if we got here by menu

          menu.classList.add("white");
        }
      },
      instant ? 0 : 750
    );
  }

  restartAnimation(el, animationClassName) {
    el.classList.remove(animationClassName);
    el.offsetHeight; // trigger reflow to restart animation: https://stackoverflow.com/a/45036752
    el.classList.add(animationClassName);
  }
}

export default Czarverse;
