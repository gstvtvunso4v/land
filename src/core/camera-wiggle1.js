import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Quaternion,
  Vector2,
  Vector3,
} from "three";
import lerp from "../utils/lerp.js";
import isMobile from "is-mobile";

const _dummyPosition = new Vector3();
const _dummyScale = new Vector3();
const _dummyQuaternion = new Quaternion();

// used in Section1
class CameraWiggle1 {
  inertia = 0.03;
  speed = 2;

  boundsX = new Vector2(2, 5);
  boundsY = new Vector2(0.3, 2.3);

  accelerationMouse = new Vector2();
  lerpMouse = new Vector2();

  logo = null;
  dummyLogo = new Object3D();

  target = null;
  targetPosition = new Vector3();
  cameraPosition = new Vector3();

  isWindowInFocus = true;

  constructor(section) {
    this.section = section;

    if (
      window.innerWidth < 768 ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      this.logo = this.section.scene.getObjectByName("Title_mobile");
      this.target = this.section.scene.getObjectByName(
        "Camera_focus_center__mobile"
      );
    } else {
      this.logo = this.section.scene.getObjectByName("Title");
      this.target = this.section.scene.getObjectByName("Camera_focus_center");
    }

    // this.target.add(
    //   new Mesh(
    //     new BoxGeometry(1, 1, 1),
    //     new MeshBasicMaterial({ color: 0xff0000 })
    //   )
    // );

    // console.log(this.target);

    if (
      window.innerWidth < 768 ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    window.addEventListener("pointermove", this.onPointerMove.bind(this));
    window.addEventListener("blur", this.onWindowBlur.bind(this));
    window.addEventListener("focus", this.onWindowFocus.bind(this));
  }

  onWindowBlur() {
    this.isWindowInFocus = false;
  }

  onWindowFocus() {
    this.isWindowInFocus = true;
  }

  update() {
    if (
      window.innerWidth < 768 ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    const { camera } = this.section;

    this.lerpMouse.x = lerp(this.lerpMouse.x, 0, this.inertia);
    this.lerpMouse.y = lerp(this.lerpMouse.y, 0, this.inertia);

    const { x, y } = this.lerpMouse;

    if (!camera) {
      return;
    }

    camera.position.x += -x;
    camera.position.y += -y;

    camera.position.x = Math.min(
      Math.max(camera.position.x, this.boundsX.x),
      this.boundsX.y
    );
    camera.position.y = Math.min(
      Math.max(camera.position.y, this.boundsY.x),
      this.boundsY.y
    );

    this.target.getWorldPosition(this.targetPosition);
    camera.lookAt(this.targetPosition);

    // logo slowly looks at the camera
    camera.getWorldPosition(this.cameraPosition);

    if (this.logo) {
      this.logo.getWorldPosition(_dummyPosition);
      this.logo.getWorldScale(_dummyScale);
      this.logo.getWorldQuaternion(_dummyQuaternion);

      this.dummyLogo.position.copy(_dummyPosition);
      this.dummyLogo.scale.copy(_dummyScale);
      this.dummyLogo.quaternion.copy(_dummyQuaternion);

      this.dummyLogo.lookAt(this.cameraPosition);

      this.logo.quaternion.slerp(this.dummyLogo.quaternion, 0.01);
    }

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

    this.accelerationMouse.x = (movementX / width) * this.speed;
    this.accelerationMouse.y = (movementY / height) * this.speed;
    this.lerpMouse.x = this.accelerationMouse.x;
    this.lerpMouse.y = this.accelerationMouse.y;
  }
}

export default CameraWiggle1;
