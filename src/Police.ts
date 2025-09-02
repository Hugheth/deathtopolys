import MovingObject from './MovingObject';

import * as THREE from 'three';
import { World } from './World';

export class Police extends MovingObject {
	type: string = 'police';
	speed: number = 800;
	rigid: boolean = true;
	animateOffset: number;
	dead?: boolean;

	constructor(world: World, position: THREE.Vector3) {
		super(world);
		this.position = position;
		this.initMesh();
		this.animateOffset = Math.random() * Math.PI * 2;
		this.animate = this.animate.bind(this);
		this.world.taskManager.addTask(this.animate);
		this.wander();
	}

	wander(): void {
		if (this.dead) return;
		const wait = Math.random() > 0.8;
		if (wait) {
			setTimeout(() => {
				this.wander();
			}, 4000);
			return;
		}
		let moveIn: THREE.Vector3 | undefined;
		// Pick a direction that's empty
		// Shuffle LOCALS array
		const shuffledLocals = this.LOCALS.slice().sort(() => Math.random() - 0.5);
		for (const local of shuffledLocals) {
			const target = this.position.clone().add(local);
			const drop = this.world.getDrop(target);
			if (drop >= 0) {
				moveIn = local;
				break;
			}
		}
		if (!moveIn) return;
		this.doMove(
			moveIn.x,
			moveIn.z,
			() => {},
			(unstable: boolean) => {
				if (this.dead) return;
				// Mark tile
				this.world.markTile(this.position.x, this.position.z, 'police');
				if (!unstable) {
					this.wander();
				}
				this.LOCALS.forEach((local: THREE.Vector3) => {
					const target = this.position.clone().add(local);
					const tile = this.world.getTile(target.x, target.z);
					if (!tile) {
						return;
					}
					this.world.markTile(target.x, target.z, 'police');
					tile.blocks.forEach((object: any) => {
						if (object.type == 'struct') {
							object.mesh.material = this.world.materialManager.get('police');
							object.mark = 'police';
						}
					});
				});
			},
			() => {
				this.wander();
			},
		);
	}

	initMesh(): void {
		this.mesh = new THREE.Mesh(
			this.world.modelManager.get('police') as THREE.BufferGeometry,
			this.world.materialManager.get('policeTemplate') as THREE.Material,
		);
		this.mesh.position.copy(this.position);
		this.world.scene.add(this.mesh);
	}

	animate(frame: number): void {
		this.mesh.rotation.y += 0.01;
	}

	destroy(): void {
		this.dead = true;
		this.world.scene.remove(this.mesh);
		this.world.taskManager.removeTask(this.animate);
	}
}
