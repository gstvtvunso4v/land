import GUI from 'lil-gui'; // tmp
import Section from './section.js';
import {
  BloomEffect, ChromaticAberrationEffect, ColorDepthEffect,
  EffectComposer,
  EffectPass,
  GlitchEffect, HueSaturationEffect,
  NoiseEffect,
  PixelationEffect,
  RenderPass, SMAAEffect
} from 'postprocessing';
import { LoopOnce, LoopRepeat, Vector2 } from 'three';
import CameraWiggle2 from '../core/camera-wiggle2.js';
import lerp from '../utils/lerp.js';
import isMobile from 'is-mobile';

class Section2 extends Section {
  effects = {
    smaa: null,
    pixelation: null,
    noise: null,
    glitch: null,
    chroma: null,
    colorDepth: null,
    hueSaturation: null
  };

  backgroundColor = '#13071d';

  constructor(czarverse) {
    super(
      czarverse,
      document.querySelector('.section-2 .canvas-container'),
      document.querySelector('.section-2')
    );

    this.czarverse = czarverse;

    // просто длинный элемент
    this.longScrollContainer = document.querySelector('.section-2 .long-scroll-container');

    this.init3D();

    this.cameraWiggle = new CameraWiggle2(this);

    this.effects.smaa = new SMAAEffect();
    this.effects.noise = new NoiseEffect({
      premultiply: true
    });
    this.effects.pixelation = new PixelationEffect(10);
    this.effects.glitch = new GlitchEffect({
      delay: new Vector2(0.4, 3),
      duration: new Vector2(0.1, 0.6),
      strength: new Vector2(0.1, 0.4),
      columns: 0.04,
      ratio: 0.3,
      chromaticAberrationOffset: new Vector2(0, 0)
    });
    this.effects.chroma = new ChromaticAberrationEffect({

    });
    this.effects.colorDepth = new ColorDepthEffect({
      bits: 32
    });

    this.effects.hueSaturation = new HueSaturationEffect({
      hue: 0,
      saturation: 0
    });

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new EffectPass(this.camera, this.effects.noise));
    this.composer.addPass(new EffectPass(this.camera, this.effects.pixelation));
    this.composer.addPass(new EffectPass(this.camera, this.effects.glitch));
    this.composer.addPass(new EffectPass(this.camera, this.effects.chroma));
    this.composer.addPass(new EffectPass(this.camera, this.effects.colorDepth));
    this.composer.addPass(new EffectPass(this.camera, this.effects.hueSaturation));
    this.composer.addPass(new EffectPass(this.camera, this.effects.smaa));
  }

  initModel() {
    this.model = this.czarverse.assets.gltfs['second'];
    this.scene.add(this.model.scene);

    if (isMobile()) {
      this.camera = this.model.cameras[1];
    } else {
      this.camera = this.model.cameras[0];
    }

    console.log(this.model.animations);

    // останавливаем все анимации и записываем их список тех, что будут воспроизводится
    this.model.animations.forEach(animation => {
      const action = this.animationMixer.clipAction(animation);
      action.play().paused = true;
      this.actionsToAnimate.push(action);
    });

    console.log(this);
  }

  getScrollPercent() {
    // container
    let scrollTop = this.scrollContainer.scrollTop;

    if (isMobile()) {
      // body scroll - window height
      scrollTop = window.pageYOffset - window.innerHeight;
    }

    const height = this.longScrollContainer.scrollHeight;
    const heightWithoutCanvas = height - this.containerBounds.height;

    let percent = scrollTop / heightWithoutCanvas;
    percent = Math.max(0, percent);

    return percent;
  }

  getInertia(delta) {
    let inertia = 0.9 * delta;

    if (this.noInertia) {
      inertia = 0.9;
    }

    return inertia;
  }

  updateActions() {
    this.animationTarget = this.getScrollPercent();

    this.actionsToAnimate.forEach(action => {
      action.time = action.getClip().duration * this.animationTime;
    });
  }
}

export default Section2;
