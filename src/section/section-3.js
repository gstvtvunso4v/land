import Section from "./section.js";
import { Color, LoopOnce, LoopRepeat } from "three";
import {
  EffectComposer,
  EffectPass,
  HueSaturationEffect,
  RenderPass,
  SMAAEffect,
} from "postprocessing";
import isMobile from "is-mobile";

class Section3 extends Section {
  animationInertia = 0.04;
  animationInertiaBack = 0.04 * 2;

  castShadow = ["Demons", "Candles"];

  receiveShadow = ["Ground", "Candles"];

  backgroundColor = "#ffb5ff";
  // backgroundColor = '#e98af9'; // такой нужен

  effects = {
    smaa: null,
    hueSaturation: null,
  };

  constructor(czarverse) {
    super(
      czarverse,
      document.querySelector(".section-3 .canvas-container"),
      document.querySelector(".section-3")
    );

    this.czarverse = czarverse;

    // просто длинный элемент
    this.longScrollContainer = document.querySelector(
      ".section-3 .long-scroll-container"
    );
    this.canvasStickyContainer = document.querySelector(
      ".section-3 .canvas-sticky-container"
    );

    this.backArrow = document.querySelector(".section-3 .back-arrow");
    this.backArrow.addEventListener(
      "click",
      this.backArrowClickHandler.bind(this)
    );

    this.init3D();
    this.scene.background = new Color(0xe98af9);

    const lightPosition = this.scene.getObjectByName("light_source_point");
    const lightTarget = this.scene.getObjectByName("light_direction_point");
    this.directionalLight.position.copy(lightPosition.position);
    this.directionalLight.target.position.copy(lightTarget.position);

    this.effects.smaa = new SMAAEffect();
    this.effects.hueSaturation = new HueSaturationEffect({
      hue: 0,
      saturation: 0,
    });

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(
      new EffectPass(this.camera, this.effects.hueSaturation)
    );
    this.composer.addPass(new EffectPass(this.camera, this.effects.smaa));

    // tmp?
    this.cameraWiggle = null;

    // this.onWhoweareScrollBusy = false;

    // this.longScrollContainer.addEventListener("scroll", function () {
    //   console.log(document.scrollTop);
    // });

    // this.scrollTop = 0;
    // this.scrollHandler = (scrollTop) => {
    //   this.scrollTop = scrollTop;
    //   this.onWhoweareScroll(this);
    // };

    // this.whoweareObserver = new IntersectionObserver(
    //   this.onWhoweareIntersection.bind(this)
    // );
    // this.whoweareObserver.observe(document.querySelector(".gamedev"));

    // this.section4Observer = new IntersectionObserver(
    //   this.onSection4Intersection.bind(this)
    // );
    // this.section4Observer.observe(document.querySelector(".section-4"));

    this.initDebugGui();
  }

  initDebugGui() {
    const props = {
      sectionAnimationInertia3: 0.04,
      sectionAnimationInertiaBack3: 0.04 * 2,
      hue3: 0,
      saturation3: 0,
    };

    // window.gui was init in section-1.js
    gui
      .add(props, "hue3", 0, Math.PI * 2, 0.0001)
      .onChange((value) => (this.effects.hueSaturation.hue = value));
    gui
      .add(props, "saturation3", -1, 1, 0.0001)
      .onChange((value) => (this.effects.hueSaturation.saturation = value));

    gui
      .add(props, "sectionAnimationInertia3", 0, 50, 0.000001)
      .onChange((value) => (this.animationInertia = value));
    // gui.add(props, 'sectionAnimationInertiaBack3', 0, 0.1, 0.000001).onChange(value => this.animationInertiaBack = value);
  }

  // это код от второй секции, его надо будет поменять
  initModel() {
    this.model = this.czarverse.assets.gltfs["third"];
    this.scene.add(this.model.scene);

    if (
      window.innerWidth < 768 ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      this.camera = this.model.cameras[1];
    } else {
      this.camera = this.model.cameras[0];
    }

    this.model.animations.forEach((a) => {
      // idle анимации
      if (a.name === "Rotation_Idle" || a.name === "Demons_action") {
        const action = this.animationMixer.clipAction(a);
        action.loop = LoopRepeat;
        action.play();
      }
    });

    // иницируем анимацию полёта камеры и паузим её, т.к. сами будем воспроизводить
    this.cameraAction = this.animationMixer.clipAction(
      this.model.animations.find((a) => a.name === "show")
    );
    this.cameraAction.play().paused = true;
    this.actionsToAnimate.push(this.cameraAction);

    this.showAction = this.animationMixer.clipAction(
      this.model.animations.find((a) => a.name === "Camera_perent_hide")
    );
    this.showAction.loop = LoopOnce;
    this.showAction.clampWhenFinished = true;
    this.showAction.play().paused = true;

    this.initShadows();

    console.log(this);
  }

  getScrollPercent() {
    // container
    let scrollTop = this.scrollContainer.scrollTop;

    if (
      window.innerWidth < 768 ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      const section1Height = window.innerHeight;
      const section2Height =
        this.czarverse.section2.longScrollContainer.scrollHeight;

      // body scroll - section1 height - section2 height
      scrollTop = window.pageYOffset - section1Height - section2Height;
    }

    const height = this.longScrollContainer.scrollHeight;
    const heightWithoutCanvas = height - this.containerBounds.height;

    let percent = scrollTop / this.canvasStickyContainer.scrollHeight;
    percent = Math.max(0, percent);

    return percent;
  }

  getInertia(delta) {
    let inertia = this.animationInertia * delta;

    if (this.noInertia) {
      inertia = 0.9;
    }

    return inertia;
  }

  updateActions() {
    this.animationTarget = this.getScrollPercent();

    this.actionsToAnimate.forEach((action) => {
      action.time = action.getClip().duration * this.animationTime;
    });
  }

  // анимация появления who we are
  // onWhoweareIntersection() {
  //   const left = document.querySelector(".background-text-left");
  //   const right = document.querySelector(".background-text-right");
  //   const gamedev = document.querySelector(".gamedev");

  //   const elements = [left, right];

  //   elements.forEach((el) => {
  //     el.classList.remove("fade-in");
  //   });
  //   gamedev.classList.remove("move-up");

  //   if (
  //     !document.querySelector(".section-3 .scene").classList.contains("hidden")
  //   ) {
  //     elements.forEach((el) => {
  //       el.classList.remove("fade-in");
  //       el.offsetHeight; // trigger reflow to restart animation: https://stackoverflow.com/a/45036752
  //       el.classList.add("fade-in");
  //     });
  //     gamedev.classList.remove("move-up");
  //     gamedev.offsetHeight; // trigger reflow to restart animation: https://stackoverflow.com/a/45036752
  //     gamedev.classList.add("move-up");
  //   }
  // }

  onWhoweareScroll() {
    const left = document.querySelector(".background-text-left");
    const right = document.querySelector(".background-text-right");
    const gamedev = document.querySelector(".gamedev");
    const elements = [left, right];

    if (!this.onWhoweareScrollBusy) {
      if (this.scrollTop > gamedev.offsetTop * 0.75) {
        if (!gamedev.classList.contains("move-up")) {
          console.log("onWhoweareScroll apply", gamedev.offsetTop);
          this.onWhoweareScrollBusy = true;
          elements.forEach((el) => {
            el.classList.add("fade-in");
          });
          gamedev.classList.add("move-up");
          setTimeout(() => {
            this.onWhoweareScrollBusy = false;
          }, 250);
        }
      } else {
        if (gamedev.classList.contains("move-up")) {
          console.log("onWhoweareScroll destroy", gamedev.offsetTop);
          this.onWhoweareScrollBusy = true;
          elements.forEach((el) => {
            el.classList.remove("fade-in");
          });
          gamedev.classList.remove("move-up");
          setTimeout(() => {
            this.onWhoweareScrollBusy = false;
          }, 250);
        }
      }
    }
  }

  // анимация появления 4 секции
  // onSection4Intersection() {
  //   const poster = document.querySelector(".section-4");
  //   const socials = document.querySelectorAll(".section-4 .social");

  //   const elements = [poster, ...socials];

  //   elements.forEach((el) => {
  //     el.classList.remove("fade-in");
  //     el.offsetHeight; // trigger reflow to restart animation: https://stackoverflow.com/a/45036752
  //     el.classList.add("fade-in");
  //   });
  // }

  backArrowClickHandler() {
    this.czarverse.onLeftArrowClick(true);
  }
}

export default Section3;
