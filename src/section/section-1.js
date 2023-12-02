import Section from "./section.js";
import { Frustum, LoopOnce, Matrix4, Vector3 } from "three";
import GUI from "lil-gui";
import CameraWiggle1 from "../core/camera-wiggle1.js";
import {
  EffectComposer,
  EffectPass,
  HueSaturationEffect,
  RenderPass,
  SMAAEffect,
} from "postprocessing";
import isMobile from "is-mobile";

const _position = new Vector3();

class Section1 extends Section {
  castShadow = [
    "CH_1",
    "CH_2",
    "CH_3",
    "ground_2",
    "ground_env_1",
    "ground_env_2",
    "ground_env_2001",
  ];

  receiveShadow = ["Ground"];

  backgroundColor = "#13071d";

  animationInertia = 0.8;
  animationInertiaBack = 2.0;

  // не используется
  animationInertiasPerScene = [0.01, 0.01, 0.05];

  effects = {
    smaa: null,
    hueSaturation: null,
  };

  playCharacterAnimation = false;

  constructor(czarverse) {
    super(
      czarverse,
      document.querySelector(".section-1 .canvas-container"),
      document.querySelector(".section-1")
    );

    this.czarverse = czarverse;

    this.init3D();
    this.cameraWiggle = new CameraWiggle1(this);

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
  }

  initModel() {
    this.model = this.czarverse.assets.gltfs["first"];
    this.scene.add(this.model.scene);

    console.log(this.model);

    if (
      window.innerWidth < 768 ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      this.camera = this.model.cameras[1];
      this.scene.getObjectByName("Title").visible = false;
    } else {
      this.camera = this.model.cameras[0];
      this.scene.getObjectByName("Title_mobile").visible = false;
    }

    this.playAnimations(LoopOnce);

    // иницируем анимацию полёта камеры и паузим её, т.к. сами будем воспроизводить
    this.cameraAction = this.animationMixer.clipAction(
      this.model.animations.find((a) => a.name === "World_animation")
    );
    this.cameraAction.play().paused = true;
    this.actionsToAnimate.push(this.cameraAction);

    this.ch1Action = this.animationMixer.clipAction(
      this.model.animations.find((a) => a.name === "CH_1_action")
    );
    this.ch2Action = this.animationMixer.clipAction(
      this.model.animations.find((a) => a.name === "CH_2_action")
    );
    this.ch3Action = this.animationMixer.clipAction(
      this.model.animations.find((a) => a.name === "CH_3_action")
    );

    this.animationMixer.addEventListener("finished", (event) => {
      if (
        event.action === this.ch1Action ||
        event.action === this.ch2Action ||
        event.action === this.ch3Action
      ) {
        this.playCharacterAnimation = false;
      }
    });

    this.ch1 = this.scene.getObjectByName("CH_1").children[0];
    this.ch2 = this.scene.getObjectByName("CH_2").children[0];
    this.ch3 = this.scene.getObjectByName("CH_3").children[0];

    this.initShadows();

    this.initDebugGui();

    console.log(this);
  }

  updateCharacterAnimation() {
    if (this.playCharacterAnimation) {
      const currentSceneIndex = this.czarverse.currentSceneIndex;
      let ch;
      let action;

      if (currentSceneIndex === 0) {
        ch = this.ch1;
        action = this.ch1Action;
      } else if (currentSceneIndex === 1) {
        ch = this.ch2;
        action = this.ch2Action;
      } else if (currentSceneIndex === 2) {
        ch = this.ch3;
        action = this.ch3Action;
      }

      if (
        ch !== undefined &&
        this.isObjectInFrustum(ch) &&
        !action.isRunning()
      ) {
        action.reset().play();
      }
    }
  }

  isObjectInFrustum(obj) {
    const frustum = new Frustum();
    const matrix = new Matrix4().multiplyMatrices(
      this.camera.projectionMatrix,
      this.camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(matrix);

    return frustum.intersectsObject(obj);
  }

  initDebugGui() {
    window.gui = new GUI({
      width: 500,
    });

    // gui.hide();

    const props = {
      sectionAnimationInertia1: 0.02,
      sectionAnimationInertiaBack1: 0.04,
      // scene2: 0.04,
      // scene3: 0.04
      hue1: 0,
      saturation1: 0,
    };

    gui
      .add(props, "sectionAnimationInertia1", 0, 0.1, 0.000001)
      .onChange((value) => (this.animationInertia = value));
    gui
      .add(props, "sectionAnimationInertiaBack1", 0, 0.1, 0.000001)
      .onChange((value) => (this.animationInertiaBack = value));
    gui
      .add(props, "hue1", 0, Math.PI * 2, 0.0001)
      .onChange((value) => (this.effects.hueSaturation.hue = value));
    gui
      .add(props, "saturation1", -1, 1, 0.0001)
      .onChange((value) => (this.effects.hueSaturation.saturation = value));

    gui.close();
  }
}

export default Section1;
