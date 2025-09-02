import * as Three from 'three';
import { World } from './World';

export class Junk {
	animateOffset = Math.random() * Math.PI * 2;
	mesh!: Three.Mesh;
	constructor(public world: World, public position: Three.Vector3) {
		this.initMesh();
		this.world.taskManager.addTask(this.animate);
	}

	initMesh() {
		const material = new Three.MeshPhongMaterial({
			color: 0xaaaaaa,
			specular: 0xffffff,
			shininess: 0.75,
			flatShading: true,
			vertexColors: true,
		});

		this.mesh = new Three.Mesh(this.world.modelManager.get('junk'), material);
		this.mesh.position.copy(this.position);
		this.world.scene.add(this.mesh);
	}

	animate(frame: number) {
		this.mesh.rotation.y += 0.1;
		this.mesh.position.y = this.position.y + Math.sin(frame / 10 + this.animateOffset) * 0.2;
	}

	destroy() {
		this.world.taskManager.removeTask(this.animate);
		const tile = this.world.getTile(this.position.x, this.position.z);
		tile.pickups.splice(tile.pickups.indexOf(this), 1);
		this.world.scene.remove(this.mesh);
	}
}
