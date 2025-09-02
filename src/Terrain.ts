import * as Three from 'three';
import { Junk } from './Junk';
import { World } from './World';

export interface Block {
	type: string;
	mesh: Three.Mesh;
	position: Three.Vector3;
	destroy(): void;
	mark?: string;
}

export interface Tile {
	mesh: Three.Mesh;
	height: number;
	blocks: Block[];
	pickups: Junk[];
	mark?: string;
}

export class Terrain {
	constructor(public world: World) {
		this.initTiles();
	}

	start(): void {
		this.world.taskManager.addTask(this.raise.bind(this));
	}

	raise(frame: number): void {
		if (frame % 5) return;

		const x = Math.floor(Math.random() * this.world.width);
		const z = Math.floor(Math.random() * this.world.depth);

		this.raiseTile(x, z);

		if (frame % 1000 == 0) {
			this.placePolice();
		}
	}

	placePolice(): void {
		let n = 100;
		while (n--) {
			const x = Math.floor(Math.random() * this.world.width);
			const z = Math.floor(Math.random() * this.world.depth);

			const tile = this.world.getTile(x, z);
			if (tile.mark != 'saved') {
				this.world.addPolice(new Three.Vector3(x, 0, z));
				break;
			}
		}
	}

	raiseTile(x: number, z: number): void {
		const tile = this.world.getTile(x, z);

		if (tile.mark == 'saved') return;
		if (tile.height > 8) return;

		if (tile.pickups.length == 0 && tile.blocks.length == 0) {
			if (tile.height == 0) {
				tile.mesh.geometry = this.world.modelManager.get('tower');
			}

			tile.height++;
			tile.mesh.material = this.world.materialManager.get((x + z) % 2 ? 'tower' : 'tower2');
			tile.mesh.position.y = tile.height - 0.1 * ((x + z) % 2) - this.world.HEIGHT / 2 - 0.5;
		}
	}

	initTiles(): void {
		const geometry = new Three.BoxGeometry(
			this.world.SIZE,
			this.world.SIZE * this.world.HEIGHT,
			this.world.SIZE,
		);

		for (let x = 0; x < this.world.width; x++) {
			for (let z = 0; z < this.world.depth; z++) {
				const height = 0;
				// Math.floor( Math.pow( Math.random(), 6 ) * 3 );

				const mesh = new Three.Mesh(
					geometry,
					(x + z) % 2
						? this.world.materialManager.get('floor1')
						: this.world.materialManager.get('floor2'),
				);
				mesh.position.x = x * this.world.SIZE;
				mesh.position.z = z * this.world.SIZE;
				mesh.position.y = height - 0.1 * ((x + z) % 2) - this.world.HEIGHT / 2 - 0.5;
				this.world.scene.add(mesh);
				this.world.tiles.set(`${x},${z}`, {
					mesh: mesh,
					height: height,
					blocks: [],
					pickups: [],
				});
			}
		}
	}
}
