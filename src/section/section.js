import {
  AmbientLight,
  AnimationMixer,
  Clock,
  Color, DirectionalLight, DirectionalLightHelper, LoopOnce,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  sRGBEncoding,
  WebGLRenderer
} from 'three';
import CameraWiggle1 from '../core/camera-wiggle1.js';
import lerp from '../utils/lerp.js';

class Section {
  animationInertia = 0.04;
  animationInertiaBack = 0.04 * 2;

  noInertia = false; // for menu instant jump

  czarverse = null;
  canvasContainer = null;
  cameraWiggle = null;
  sceneSwitcher = null;

  castShadow = [];
  receiveShadow = [];

  actionsToAnimate = [];

  animationTime = 0;
  animationTarget = 0;

  isVisible = false;

  isFirstScene = false;
  isLastScene = false;

  nextSection = null;
  previousSection = null;
  backgroundColor = 'transparent';

  constructor(czarverse, canvasContainer, scrollContainer) {
    this.czarverse = czarverse;

    this.canvasContainer = canvasContainer;
    this.scrollContainer = scrollContainer;

    window._time = 0;
  }

  getInertia(delta) {
    let inertia;

    if (this.czarverse.animationDirection === 0) {
      // back, left arrow
      inertia = this.animationInertiaBack * delta;
    } else if (this.czarverse.animationDirection === 1) {
      // forward, right arrow
      inertia = this.animationInertia * delta;
    }

    if (this.noInertia) {
      inertia = 0.9;
    }

    return inertia;
  }

  update(time) {
    if (!this.isVisible) {
      return;
    }

    const delta = this.clock.getDelta();

    this.animationTime = lerp(this.animationTime, this.animationTarget, this.getInertia(delta));
    // this.animationTime = window._time;

    this.updateActions();
    this.updateCharacterAnimation();

    this.animationMixer.update(delta);

    if (this.cameraWiggle) {
      this.cameraWiggle.update(delta);
    }

    this.render();
  }

  // это для 1 секции, где нет залупленных анимаций и мы всегда сами контроллируем анимацию
  updateActions() {
    this.actionsToAnimate.forEach(action => {
      action.time = this.animationTime; // предполагаю, что у всех клипов одинаковая длительность
      // action.time = action.getClip().duration * this.animationTime;
    });
  }

  // для 1 секции, нужно воспроизводить анимации персонажей
  updateCharacterAnimation() {

  }

  render() {
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  resize() {
    this.containerBounds = this.canvasContainer.getBoundingClientRect();

    this.camera.aspect = this.containerBounds.width / this.containerBounds.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.containerBounds.width, this.containerBounds.height);

    let pixelRatio = window.devicePixelRatio;
    this.renderer.setPixelRatio(pixelRatio);
  }

  init3D() {
    // 3D setup
    this.renderer = new WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: false,
      stencil: false,
      depth: false,
      alpha: false,
      logarithmicDepthBuffer: true
    });
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.canvasContainer.appendChild(this.renderer.domElement);

    this.scene = new Scene();
    this.scene.background = new Color(0x4b1a61);

    this.clock = new Clock();
    this.animationMixer = new AnimationMixer(this.scene);

    this.camera = new PerspectiveCamera(60, 1, 0.1, 30000);
    this.scene.add(this.camera);

    this.initLights();
    this.initModel();

    this.resize();
    window.addEventListener('resize', this.resize.bind(this));

    this.render(0);
  }

  initLights() {
    this.ambientLight = new AmbientLight(0xffffff, 1);
    this.scene.add(this.ambientLight);

    this.directionalLight = new DirectionalLight(0xffffff, 1);
    this.directionalLight.castShadow = true;
    this.directionalLight.position.y = 15;
    this.scene.add(this.directionalLight);

    // this.section.add(new DirectionalLightHelper(this.directionalLight, 100));

    // ебучий баг в трихе
    const frustum = 20;
    this.directionalLight.shadow.camera.bottom = -frustum;
    this.directionalLight.shadow.camera.top = frustum;
    this.directionalLight.shadow.camera.left = -frustum;
    this.directionalLight.shadow.camera.right = frustum;
    this.directionalLight.shadow.camera.updateProjectionMatrix();

    this.directionalLight.shadow.mapSize.set(2048, 2048);
  }

  initModel() {

  }

  playAnimations(loopMode) {
    // play all animations
    this.model.animations.forEach((clip) => {
      let action = this.animationMixer.clipAction(clip);
      action.loop = loopMode;
      action.clampWhenFinished = true;

      action.play();
    });
  }

  initShadows() {
    this.castShadow.forEach(name => {
      this.scene.getObjectByName(name).traverse(child => {
        child.castShadow = true;
      });
    });

    this.receiveShadow.forEach(name => {
      this.scene.getObjectByName(name).traverse(child => {
        child.receiveShadow = true;
      });
    });
  }
}

export default Section;
