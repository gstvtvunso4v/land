import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D, Quaternion, Vector2, Vector3 } from 'three';
import lerp from '../utils/lerp.js';

// used in Section2
class CameraWiggle2 {
  inertia = 0.03;
  speed = 1;

  boundsX = new Vector2(-1, 1);
  boundsY = new Vector2(1, 1);

  accelerationMouse = new Vector2();
  lerpMouse = new Vector2();

  logo = null;
  dummyLogo = new Object3D();

  target = null;
  targetPosition = new Vector3();

  isWindowInFocus = true;

  constructor(section) {
    this.section = section;

    this.target = this.section.scene.getObjectByName('Focus_center');

    window.addEventListener('pointermove', this.onPointerMove.bind(this));
    window.addEventListener('blur', this.onWindowBlur.bind(this));
    window.addEventListener('focus', this.onWindowFocus.bind(this));
  }

  onWindowBlur() {
    this.isWindowInFocus = false;
  }

  onWindowFocus() {
    this.isWindowInFocus = true;
  }

  update() {
    const { camera } = this.section;

    this.lerpMouse.x = lerp(this.lerpMouse.x, 0, this.inertia);
    this.lerpMouse.y = lerp(this.lerpMouse.y, 0, this.inertia);

    const { x, y } = this.lerpMouse;

    if (!camera) {
      return;
    }

    camera.position.x += x;
    camera.position.z += y;

    // camera.position.x = Math.min(Math.max(camera.position.x, this.boundsX.x), this.boundsX.y);
    // camera.position.y = Math.min(Math.max(camera.position.y, this.boundsY.x), this.boundsY.y);

    this.target.getWorldPosition(this.targetPosition);
    camera.lookAt(this.targetPosition);

    this.accelerationMouse.x = 0;
    this.accelerationMouse.y = 0;
  }

  onPointerMove(event) {
    // chrome bug with large event.movementX after moving mouse around and focusing on the page
    if (!this.isWindowInFocus) {
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    let movementX = -event.movementX;
    let movementY = -event.movementY;

    const movementLimit = 30;

    // chrome bug with large event.movementX after moving mouse around and focusing on the page
    movementX = Math.min(Math.max(movementX, -movementLimit), movementLimit);
    movementY = Math.min(Math.max(movementY, -movementLimit), movementLimit);

    // console.log(movementX);

    this.accelerationMouse.x = movementX / width * this.speed;
    this.accelerationMouse.y = movementY / height * this.speed;
    this.lerpMouse.x = this.accelerationMouse.x;
    this.lerpMouse.y = this.accelerationMouse.y;
  }
}

export default CameraWiggle2;
