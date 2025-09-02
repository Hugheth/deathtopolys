import * as THREE from 'three';

export class MaterialManager {
	materials: { [key: string]: THREE.Material };

	constructor() {
		this.materials = {};
	}

	get(name: string): THREE.Material | undefined {
		return this.materials[name];
	}

	load(): Promise<void[]> {
		this.loadStatic();
		return Promise.all([this.loadTexture('policeTemplate', 'png')]);
	}

	loadStatic(): void {
		this.materials.police = new THREE.MeshPhongMaterial({
			color: 0x3d73ed,
			flatShading: true,
		});
		this.materials.floor1 = new THREE.MeshLambertMaterial({
			color: 0x333333,
		});
		this.materials.floor2 = new THREE.MeshLambertMaterial({
			color: 0x222222,
		});
		this.materials.tower = new THREE.MeshPhongMaterial({
			color: 0xaaaaaa,
			flatShading: true,
		});
		this.materials.tower2 = new THREE.MeshPhongMaterial({
			color: 0x666666,
			flatShading: true,
		});
		this.materials.saved = new THREE.MeshPhongMaterial({
			color: 0xaaff00,
			flatShading: true,
		});
		this.materials.floor3 = new THREE.MeshLambertMaterial({
			color: 0x558800,
		});
		this.materials.floor4 = new THREE.MeshLambertMaterial({
			color: 0x447700,
		});
	}

	loadTexture(name: string, ext?: string): Promise<void> {
		return new Promise(fulfil => {
			const loader = new THREE.TextureLoader();
			loader.load('/assets/polys/img/' + name + '.' + (ext || 'jpg'), texture => {
				this.materials[name] = new THREE.MeshBasicMaterial({
					map: texture,
				});
				fulfil();
			});
		});
	}
}
