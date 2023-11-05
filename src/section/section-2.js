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

    this.initDebugGui();
  }

  initDebugGui() {
    const props = {
      pixelation: 10,

      glitchChromaticAberrationOffsetMin: 0,
      glitchChromaticAberrationOffsetMax: 0,

      glitchDelayMin: 0.4,
      glitchDelayMax: 3,

      glitchDurationMin: 0.1,
      glitchDurationMax: 0.6,

      glitchStrengthMin: 0.1,
      glitchStrengthMax: 0.4,

      glitchColumns: 0.04,
      glitchRatio: 0.3,

      chromaOffsetX: 0,
      chromaOffsetY: 0,

      chromaRadialModulation: false,
      chromaModulationOffset: 0,

      colorDepthBits: 32,

      hue2: 0,
      saturation2: 0
    };

    // window.gui was init in section-1.js
    gui.add(props, 'pixelation', 0, 100, 1).onChange(value => this.effects.pixelation.granularity = value);

    // gui.add(props, 'glitchChromaticAberrationOffsetMin', 0, 100, 0.0001).onChange(value => this.effects.glitch.chromaticAberrationOffset.x = value);

    gui.add(props, 'glitchDelayMin', 0, 10, 0.001).onChange(value => this.effects.glitch.delay.x = value);
    gui.add(props, 'glitchDelayMax', 0, 10, 0.001).onChange(value => this.effects.glitch.delay.y = value);

    gui.add(props, 'glitchDurationMin', 0, 10, 0.001).onChange(value => this.effects.glitch.duration.y = value);
    gui.add(props, 'glitchDurationMax', 0, 10, 0.001).onChange(value => this.effects.glitch.duration.y = value);

    gui.add(props, 'glitchStrengthMin', 0, 10, 0.001).onChange(value => this.effects.glitch.strength.y = value);
    gui.add(props, 'glitchStrengthMax', 0, 10, 0.001).onChange(value => this.effects.glitch.strength.y = value);

    gui.add(props, 'glitchColumns', 0, 5, 0.00001).onChange(value => this.effects.glitch.columns = value);
    gui.add(props, 'glitchRatio', 0, 10, 0.001).onChange(value => this.effects.glitch.ratio = value);

    gui.add(props, 'chromaOffsetX', 0, 0.3, 0.00001).onChange(value => this.effects.chroma.offset.x = value);
    gui.add(props, 'chromaOffsetY', 0, 0.3, 0.00001).onChange(value => this.effects.chroma.offset.y = value);

    gui.add(props, 'chromaRadialModulation').onChange(value => this.effects.chroma.radialModulation = value);
    gui.add(props, 'chromaModulationOffset', 0, 1, 0.00001).onChange(value => this.effects.chroma.modulationOffset = value);

    gui.add(props, 'colorDepthBits', 0, 32, 0.1).onChange(value => this.effects.colorDepth.bitDepth = value);

    gui.add(props, 'hue2', 0, Math.PI * 2, 0.0001).onChange(value => this.effects.hueSaturation.hue = value);
    gui.add(props, 'saturation2', -1, 1, 0.0001).onChange(value => this.effects.hueSaturation.saturation = value);
  }

  initModel() {
    this.model = this.czarverse.assets.gltfs['second'];
    this.scene.add(this.model.scene);

    this.camera = this.model.cameras[0];

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
