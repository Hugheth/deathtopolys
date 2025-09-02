import MovingObject from './MovingObject';
import { Lerper } from './Lerper';
import * as Three from 'three';
import { World } from './World';

export class Scaff extends MovingObject {
	spewing: boolean = false;
	metal = 0;
	speed = 300;
	LEFT: string[] = ['Left', 'A'];
	UP: string[] = ['Up', 'W'];
	RIGHT: string[] = ['Right', 'D'];
	DOWN: string[] = ['Down', 'S'];
	SPACE: string[] = ['Space'];
	dead: boolean = false;

	constructor(world: World) {
		super(world);
		this.setMetal(5);
		this.initMesh();
		this.initKeys();
		this.dead = false;
	}

	setMetal(metal: number): void {
		this.metal = metal;
		const metalElement = document.getElementById('polys-metal');
		if (metalElement) {
			metalElement.innerHTML = metal + ' metal';
		}
	}

	initMesh(): void {
		const material = new Three.MeshPhongMaterial({
			color: 0xfdfd2d,
			specular: 0xffffff,
			shininess: 0.75,
		});

		this.mesh = new Three.Mesh(this.world.modelManager.get('scaff'), material);
		this.mesh.position.set(16, this.world.getTile(16, 16).height, 16);
		this.world.scene.add(this.mesh);
	}

	initKeys(): void {
		this.world.keyManager.addKeyBinding(this.LEFT, this.moveLeft);
		this.world.keyManager.addKeyBinding(this.RIGHT, this.moveRight);
		this.world.keyManager.addKeyBinding(this.UP, this.moveUp);
		this.world.keyManager.addKeyBinding(this.DOWN, this.moveDown);
		this.world.keyManager.addKeyBinding(
			this.SPACE,
			this.spew.bind(this),
			null,
			this.releaseSpew.bind(this),
		);
	}

	move(x: number, z: number): void {
		if (this.dead) return;

		this.doMove(
			x,
			z,
			(value: number) => {
				this.mesh.rotation.x =
					this.rotation!.x + (this.targetRotation!.x * value * Math.PI) / 2;
				this.mesh.rotation.y =
					this.rotation!.y + (this.targetRotation!.y * value * Math.PI) / 2;
				this.mesh.rotation.z =
					this.rotation!.z + (this.targetRotation!.z * value * Math.PI) / 2;
				this.world.cameraManager.updatePosition();
			},
			() => {
				this.world.playSound('move.wav');

				if (this.spewing && this.metal > 0) {
					// Add struct
					const placed = this.world.addStruct(
						this.mesh.position.clone().add(new Three.Vector3(0, -1, 0)),
					);
					if (placed) {
						this.setMetal(this.metal - 1);
					}
				}

				if (this.metal === 0) {
					this.spewing = false;
				}

				// Check for below
				this.checkPickup();
				this.checkDead();

				const beneath = this.position!.clone();
				beneath.y--;

				const block = this.world.getBlock(beneath);

				if (block && block.type === 'struct' && block.mask !== 'police') {
					this.world.checkStructForRing(block);
				}
			},
			() => {
				this.checkPickup();
				this.checkDead();
				this.world.playSound('land.wav');
			},
		);
	}

	checkPickup(): void {
		const pickup = this.world.getPickup(this.mesh.position);
		if (pickup) {
			if (!localStorage.unlockedMute) {
				localStorage.unlockedMute = true;
				const muteElement = document.getElementById('polys-mute');
				if (muteElement) {
					muteElement.style.display = 'block';
					setTimeout(() => {
						muteElement.style.opacity = '1';
					}, 1000);
				}
			}

			this.world.playSound('pickup.wav');
			this.setMetal(this.metal + 5);
			pickup.destroy();
		}
	}

	releaseSpew(): void {
		this.spewing = false;
	}

	spew(): void {
		if (this.dead) return;

		if (this.state !== this.STOPPED || this.spewing) {
			return;
		}

		if (this.metal === 0) return;

		this.spewing = true;

		this.position = this.mesh.position.clone();
		this.rotation = this.mesh.rotation.clone();
		this.targetPosition = new Three.Vector3(0, 1, 0);

		this.state = this.JUMPING;
		this.world.playSound('jump.wav');

		const lerp = new Lerper(
			this.world.taskManager,
			this.speed,
			(value: number) => {
				const height = -4 * Math.pow(value, 2) + 5 * value;
				this.mesh.position.copy(
					this.position!.clone().add(this.targetPosition!.clone().multiplyScalar(height)),
				);
				this.world.cameraManager.updatePosition();
			},
			() => {
				this.state = this.STOPPED;

				// Add struct
				const placed = this.world.addStruct(this.position!);
				if (placed) {
					this.setMetal(this.metal - 1);
				}
			},
		);
		lerp.start();
	}

	moveLeft = () => {
		this.move(-1, 0);
	};

	moveRight = () => {
		this.move(1, 0);
	};

	moveUp = () => {
		this.move(0, -1);
	};

	moveDown = () => {
		this.move(0, 1);
	};

	checkDead = () => {
		if (this.dead) return;

		const mark = this.world.getDropMark(this.position);

		if (mark === 'police') {
			this.world.playSound('gameover.wav');
			this.dead = true;
			const containerElement = document.getElementById('polys-container');
			if (containerElement) {
				containerElement.style.display = 'none';
			}
			const finalScoreElement = document.getElementById('polys-finalScore');
			if (finalScoreElement) {
				finalScoreElement.style.display = 'block';
				finalScoreElement.innerHTML += 'You captured ' + this.world.estate + ' estate';
			}
		}
	};
}
