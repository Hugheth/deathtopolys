import * as THREE from 'three';
import { World } from './World';

export class Struct {
	world: any;
	position: THREE.Vector3;
	mesh: THREE.Mesh;
	type: string = 'struct';

	constructor(world: World, position: THREE.Vector3) {
		this.world = world;
		this.position = position;
		this.initMesh();
		this.type = 'struct';
	}

	initMesh(): void {
		const material = new THREE.MeshPhongMaterial({
			color: 0xaaaaaa,
			specular: 0xffffff,
			shininess: 0.75,
		});

		this.mesh = new THREE.Mesh(this.world.modelManager.get('scaff'), material);
		this.mesh.position.copy(this.position);
		this.world.scene.add(this.mesh);
	}

	destroy(): void {}
}
