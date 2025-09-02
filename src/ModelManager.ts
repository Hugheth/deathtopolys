import * as THREE from 'three';

export class ModelManager {
	public models: { [key: string]: THREE.Object3D } = {};

	load(): Promise<void[]> {
		return Promise.all([
			this.loadModel('scaff'),
			this.loadModel('junk'),
			this.loadModel('police'),
			this.loadModel('tower'),
		]);
	}

	get(name: string): THREE.Object3D | undefined {
		return this.models[name];
	}

	loadModel(name: string): Promise<void> {
		return new Promise((fulfil, reject) => {
			const loader = new THREE.ObjectLoader();
			loader.load(
				'/assets/polys/models/' + name + '.json',
				(object: THREE.Object3D) => {
					console.log('NICE', object);
					this.models[name] = object;
					fulfil();
				},
				undefined,
				err => {
					reject(err);
				},
			);
		});
	}
}
