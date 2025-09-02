import * as Three from 'three';
import { TaskManager } from './TaskManager';
import { KeyManager } from './KeyManager';
import { CameraManager } from './CameraManager';
import { ModelManager } from './ModelManager';
import { MaterialManager } from './MaterialManager';
import { TutorialManager } from './TutorialManager';
import { Block, Terrain } from './Terrain';
import { Skybox } from './Skybox';
import { Scaff } from './Scaff';
import { Struct } from './Struct';
import { Junk } from './Junk';
import { Police } from './Police';
import { Tile } from './Terrain';

type Ring = [Three.Vector3, Three.Vector3];

export class World {
	alive = true;

	estate = 0;
	towerTasks = new Map<number, Three.Vector3[]>();
	taskManager = new TaskManager();
	keyManager = new KeyManager(this);
	cameraManager = new CameraManager(this);
	modelManager = new ModelManager();
	materialManager = new MaterialManager();
	tutorialManager = new TutorialManager(this);
	renderer = new Three.WebGLRenderer({
		antialias: true,
	});

	tiles = new Map<string, Tile>();

	playingSounds = {};

	scene = new Three.Scene();

	width = 32;
	depth = 32;

	SIZE = 1;
	HEIGHT = 10;

	mute = false;
	music = new Audio('/assets/polys/audio/music.mp3');

	skybox = new Skybox(this);
	sun = new Three.DirectionalLight(0xffffef, 1);
	shadowSun = new Three.DirectionalLight('#2c2c5c', 1);
	ambient = new Three.AmbientLight('#3d3d3d');

	terrain?: Terrain;
	scaff?: Scaff;

	constructor() {
		this.scene.add(this.skybox.mesh);

		this.setupRenderer();
		this.setupLighting();
		this.playMusic();

		this.taskManager.start();
		this.materialManager
			.load()
			.then(() => {
				return this.modelManager.load();
			})
			.then(() => {
				this.terrain = new Terrain(this);
				this.scaff = new Scaff(this);
				this.cameraManager.camera.position.copy(
					this.scaff.mesh.position.clone().add(this.cameraManager.offset),
				);
				this.animate();
			});

		this.taskManager.addTask(this.checkTowers.bind(this));

		document.getElementById('polys-retry').addEventListener('click', () => {
			document.location.reload();
		});
	}

	checkTowers(frame: number) {
		const frameTasks = this.towerTasks.get(frame);
		if (frameTasks) {
			for (const position of frameTasks) {
				if (!this.getPickup(position)) {
					this.addJunk(position);
					const timeToNext =
						frame + Math.floor(Math.random() * 1000) + 1000 - position.y * 200;
					if (!this.towerTasks.get(timeToNext)) {
						this.towerTasks.set(timeToNext, []);
					}
					this.towerTasks.get(timeToNext)!.push(position);
				}
			}
			this.towerTasks.delete(frame);
		}
	}

	getDrop(pos: Three.Vector3) {
		const tile = this.getTile(pos.x, pos.z);

		if (!tile) {
			return -Infinity;
		}
		let low = tile.height;
		for (const object of tile.blocks) {
			if (object.position.y <= pos.y) {
				low = Math.max(low, object.position.y + 1);
			}
		}
		return pos.y - low;
	}

	addStruct(pos: Three.Vector3) {
		const drop = this.getDrop(pos);
		if (drop >= 0) {
			const struct = new Struct(this, pos);

			this.playSound('spew.wav');
			this.getTile(pos.x, pos.z).blocks.push(struct);

			this.checkStructForRing(struct);

			return true;
		} else {
			// console.log( "Skipping due to drop" );
		}
	}

	checkStructForRing(struct: Block) {
		const rings: Ring[] = [];
		const pos = struct.position;
		let vPos = pos.clone();

		let n = 32;
		while (n--) {
			vPos.x++;
			vPos.z = pos.z;

			if (!this.hasGoodStruct(vPos)) {
				break;
			}

			let m = 32;
			while (m--) {
				vPos.z++;
				if (!this.hasGoodStruct(vPos)) {
					break;
				}

				this.contributeRing(pos, vPos, 1, 1, rings);
			}

			vPos.z = pos.z;

			m = 32;
			while (m--) {
				vPos.z--;
				if (!this.hasGoodStruct(vPos)) {
					break;
				}

				this.contributeRing(pos, vPos, 1, -1, rings);
			}
		}

		vPos.x = pos.x;

		n = 32;
		while (n--) {
			vPos.x--;
			vPos.z = pos.z;

			if (!this.hasGoodStruct(vPos)) {
				break;
			}

			let m = 32;
			while (m--) {
				vPos.z++;
				if (!this.hasGoodStruct(vPos)) {
					break;
				}

				this.contributeRing(pos, vPos, -1, 1, rings);
			}

			vPos.z = pos.z;

			m = 32;
			while (m--) {
				vPos.z--;
				if (!this.hasGoodStruct(vPos)) {
					break;
				}

				this.contributeRing(pos, vPos, -1, -1, rings);
			}
		}

		let foundNew = false;

		for (const ring of rings) {
			const currentPos = ring[0].clone();
			const vX = ring[1].x > ring[0].x ? 1 : -1;
			const vZ = ring[1].z > ring[0].z ? 1 : -1;

			let area = 0;

			while (currentPos.x != ring[1].x + vX) {
				currentPos.z = ring[0].z;

				while (currentPos.z != ring[1].z + vZ) {
					const block = this.getBlock(currentPos);
					if (block && block.type == 'struct') {
						block.mesh.material = this.materialManager.get('saved');
						block.mark = 'saved';
					}

					const tile = this.getTile(currentPos.x, currentPos.z);

					this.destroyPolice(currentPos);

					if (tile.mark != 'saved') {
						tile.mark = 'saved';
						this.estate++;
						foundNew = true;

						if (tile.height) {
							tile.mesh.material = this.materialManager.get('saved');
							const time = this.taskManager.frame + Math.floor(Math.random() * 200);
							if (!this.towerTasks.get(time)) {
								this.towerTasks.set(time, []);
							}
							this.towerTasks
								.get(time)
								?.push(new Three.Vector3(currentPos.x, tile.height, currentPos.z));
						} else if ((currentPos.x + currentPos.z) % 2) {
							tile.mesh.material = this.materialManager.get('floor3');
						} else {
							tile.mesh.material = this.materialManager.get('floor4');
						}
					}

					area++;

					currentPos.z += vZ;
				}

				currentPos.x += vX;
			}

			if (area == this.width * this.depth) {
				alert('YOU WON!');
			}
		}

		if (foundNew) {
			this.playSound('pop.wav');
			document.getElementById('polys-estate').innerText = this.estate + ' estate';
		}
	}

	contributeRing(
		pos: Three.Vector3,
		outPos: Three.Vector3,
		vX: number,
		vZ: number,
		rings: Ring[],
	) {
		const vPos = outPos.clone();

		while (vPos.x != pos.x) {
			vPos.x -= vX;
			if (!this.hasGoodStruct(vPos)) {
				return;
			}

			// console.log( 'good at', vPos );
		}

		while (vPos.z != pos.z) {
			vPos.z -= vZ;
			if (!this.hasGoodStruct(vPos)) {
				return;
			}

			// console.log( 'good at', vPos );
		}

		rings.push([pos.clone(), outPos.clone()]);
		// console.log( 'Found ring!' );
	}

	destroyPolice(pos: Three.Vector3) {
		const tile = this.getTile(pos.x, pos.z);
		for (const object of tile.blocks) {
			if (object.type == 'police') {
				object.destroy();
			}
		}
	}

	addJunk(pos: Three.Vector3) {
		this.getTile(pos.x, pos.z).pickups.push(new Junk(this, pos));
	}

	addPolice(pos: Three.Vector3) {
		this.getTile(pos.x, pos.z).blocks.push(new Police(this, pos));
	}

	getTile(x: number, z: number) {
		return this.tiles.get(`${x},${z}`);
	}

	playSound(sound: string) {
		const id = sound + Math.random();

		if (this.mute) return;

		this.playingSounds[id] = new Audio('/assets/polys/audio/' + sound);
		this.playingSounds[id].onended = () => {
			delete this.playingSounds[id];
		};
		this.playingSounds[id].play();
	}

	playMusic() {
		this.music.loop = true;
		this.music.play();
		this.music.volume = 0.5;

		if (!localStorage.unlockedMute) {
			document.getElementById('polys-mute').style.display = 'none';
		}

		document.getElementById('polys-mute').addEventListener('click', () => {
			this.mute = true;
			document.getElementById('polys-mute').style.display = 'none';
			this.music.pause();
		});
	}

	getPickup(pos: Three.Vector3) {
		let currentPickup: Junk | undefined;

		const tile = this.getTile(pos.x, pos.z);
		if (!tile) {
			return;
		}
		for (const pickup of tile.pickups) {
			if (pickup.position.y == pos.y) {
				currentPickup = pickup;
			}
		}

		return currentPickup;
	}

	markTile(x: number, z: number, mark: string) {
		const tile = this.getTile(x, z);
		if (!tile) {
			return;
		}
		tile.mesh.material = this.materialManager.get(mark);
		tile.mark = mark;
	}

	getDropMark(pos: Three.Vector3) {
		const tile = this.getTile(pos.x, pos.z);
		let mark = tile.mark;

		if (!tile) {
			return;
		}
		let low = -1;
		for (const object of tile.blocks) {
			if (object.position.y <= pos.y) {
				if (object.position.y > low) {
					low = object.position.y;
					mark = object.mark;
				}
			}
		}

		return mark;
	}

	hasGoodStruct(pos: Three.Vector3) {
		const block = this.getBlock(pos);

		if (block && block.type == 'struct' && block.mark != 'police') {
			return true;
		}
	}

	getBlock(pos: Three.Vector3): Block | undefined {
		const tile = this.getTile(pos.x, pos.z);
		if (!tile) {
			return;
		}
		for (const object of tile.blocks) {
			if (object.position.y == pos.y) {
				return object;
			}
		}
	}

	onWindowResize = () => {
		this.cameraManager.resizeWindow(window.innerWidth, window.innerHeight);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	};

	setupRenderer() {
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.getElementById('polys-container').append(this.renderer.domElement);
		window.addEventListener('resize', this.onWindowResize, false);
	}

	setupLighting() {
		this.sun.position.set(-600, 300, 400);
		this.scene.add(this.sun);

		this.shadowSun.position.set(600, 300, -200);
		this.scene.add(this.shadowSun);
		this.scene.add(this.ambient);
	}

	animate = () => {
		if (this.alive) {
			requestAnimationFrame(this.animate);
			this.render();
		}
	};

	render() {
		this.renderer.render(this.scene, this.cameraManager.camera);
	}

	dispose() {
		this.alive = false;
		this.renderer.dispose();
		this.keyManager.destroy();
	}
}
