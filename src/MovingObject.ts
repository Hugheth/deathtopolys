import * as Three from 'three';
import { Lerper } from './Lerper';
import { World } from './World';

export default class MovingObject {
	// State constants
	readonly STOPPED = 0;
	readonly MOVING = 1;
	readonly JUMPING = 2;
	readonly FALLING = 3;

	// Locals
	readonly LOCALS: Three.Vector3[] = [
		new Three.Vector3(0, 0, 1),
		new Three.Vector3(0, 0, -1),
		new Three.Vector3(1, 0, 0),
		new Three.Vector3(-1, 0, 0),
	];

	state: number = this.STOPPED;
	position?: Three.Vector3;
	rotation?: Three.Euler;
	mesh!: Three.Mesh;
	rigid?: boolean;
	speed!: number;
	targetRotation?: Three.Vector3;
	targetPosition?: Three.Vector3;

	constructor(public world: World) {}

	doMove(
		x: number,
		z: number,
		onMove: (value: number) => void,
		onMoved: (unstable: boolean) => void,
		onFall: () => void,
	): void {
		if (this.state !== this.STOPPED) return;

		this.position = this.mesh.position.clone();
		this.rotation = this.mesh.rotation.clone();
		const moveIn = new Three.Vector3(x, 0, z);

		const target = this.position.clone().add(moveIn);
		const drop = this.world.getDrop(target);
		if (drop < 0) return;

		this.state = this.MOVING;

		if (this.rigid) {
			let tile = this.world.getTile(this.position.x, this.position.z);
			tile.blocks.splice(tile.blocks.indexOf(this), 1);

			tile = this.world.getTile(target.x, target.z);
			tile.blocks.push(this);
		}

		const modZ = Math.round((this.mesh.rotation.x / Math.PI) * 2) % 4;
		const rZ = [-x, x, x, -x][modZ];

		this.targetRotation = new Three.Vector3(z, 0, rZ);

		const lerp = new Lerper(
			this.world.taskManager,
			this.speed,
			(value: number) => {
				this.mesh.position.copy(
					this.position!.clone().add(moveIn.clone().multiplyScalar(value)),
				);
				onMove(value);
			},
			() => {
				this.state = this.STOPPED;
				this.position = this.mesh.position.clone();

				const drop = this.world.getDrop(this.mesh.position);
				const unstable = drop > 0;
				onMoved(unstable);
				if (unstable) {
					this.fall(onFall);
				}
			},
		);
		lerp.start();
	}

	fall(onFall: () => void): void {
		const acceleration = 40;
		const drop = this.world.getDrop(this.mesh.position);
		const duration = Math.sqrt((2 * drop) / acceleration) * 1000;

		this.state = this.FALLING;
		this.position = this.mesh.position.clone();
		this.targetPosition = new Three.Vector3(0, -drop, 0);

		const lerp = new Lerper(
			this.world.taskManager,
			duration,
			(value: number) => {
				const height = Math.pow(value, 2);
				this.mesh.position.copy(
					this.position!.clone().add(this.targetPosition!.clone().multiplyScalar(height)),
				);
				this.world.cameraManager.updatePosition();
			},
			() => {
				this.state = this.STOPPED;
				onFall();
			},
		);
		lerp.start();
	}
}
