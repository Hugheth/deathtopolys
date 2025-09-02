import * as Three from 'three';
import { World } from './World';

export class CameraManager {
	camera = new Three.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 80000);
	offset = new Three.Vector3(0, 5, 5);

	constructor(public world: World) {
		this.camera.position.set(16, 7, 24);
		this.camera.lookAt(new Three.Vector3(16, 1, 16));
	}

	updatePosition() {
		this.camera.position.copy(this.world.scaff.mesh.position.clone().add(this.offset));
	}

	resizeWindow(w, h) {
		this.camera.aspect = w / h;
		this.camera.updateProjectionMatrix();
	}
}
