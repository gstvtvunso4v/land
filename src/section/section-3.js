import Section from "./section.js";
import { Color, LoopOnce, LoopRepeat } from "three";
import {
  EffectComposer,
  EffectPass,
  HueSaturationEffect,
  RenderPass,
  SMAAEffect,
} from "postprocessing";

class Section3 extends Section {
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

    this.whoweareObserver = new IntersectionObserver(
      this.onWhoweareIntersection.bind(this)
    );
    this.whoweareObserver.observe(document.querySelector(".background-text"));

    this.section4Observer = new IntersectionObserver(
      this.onSection4Intersection.bind(this)
    );
    this.section4Observer.observe(document.querySelector(".section-4"));

    this.initDebugGui();
  }

  initDebugGui() {
    const props = {
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
  }

  // это код от второй секции, его надо будет поменять
  initModel() {
    this.model = this.czarverse.assets.gltfs["third"];
    this.scene.add(this.model.scene);

    this.camera = this.model.cameras[0];

    this.model.animations.forEach((a) => {
      // idle анимации
      if (a.name === "Rotation_Idle" || a.name === "Demons_animation.002") {
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

    const height = this.longScrollContainer.scrollHeight;
    const heightWithoutCanvas = height - this.containerBounds.height;

    let percent = scrollTop / heightWithoutCanvas;
    percent = Math.max(0, percent);

    return percent;
  }

  getInertia(delta) {
    let inertia = 1.5 * delta;

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
  onWhoweareIntersection() {
    const left = document.querySelector(".background-text-left");
    const right = document.querySelector(".background-text-right");

    const elements = [left, right];

    elements.forEach((el) => {
      el.classList.remove("fade-in");
      el.offsetHeight; // trigger reflow to restart animation: https://stackoverflow.com/a/45036752
      el.classList.add("fade-in");
    });
  }

  // анимация появления 4 секции
  onSection4Intersection() {
    const poster = document.querySelector(".section-4");
    const socials = document.querySelectorAll(".section-4 .social");

    const elements = [poster, ...socials];

    elements.forEach((el) => {
      el.classList.remove("fade-in");
      el.offsetHeight; // trigger reflow to restart animation: https://stackoverflow.com/a/45036752
      el.classList.add("fade-in");
    });
  }
}

export default Section3;
