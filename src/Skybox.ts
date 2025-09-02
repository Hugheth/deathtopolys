import * as THREE from 'three';
import { World } from './World';

export class Skybox {
	mesh: THREE.Mesh;

	constructor(world: World) {
		const urlPrefix = '/assets/polys/img/';
		const urls = [
			urlPrefix + 'skybox.png',
			urlPrefix + 'skybox.png',
			urlPrefix + 'skybox.png',
			urlPrefix + 'bottombox.png',
			urlPrefix + 'skybox.png',
			urlPrefix + 'skybox.png',
		];

		const textureCube = new THREE.CubeTextureLoader().load(urls);
		textureCube.format = THREE.RGBFormat;

		const SIZE = world.SIZE * world.width * 20;

		const geometry = new THREE.BoxGeometry(SIZE, SIZE, SIZE);

		// Skybox
		const shader = THREE.ShaderLib['cube'];
		shader.uniforms['tCube'].value = textureCube;

		const material = new THREE.ShaderMaterial({
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: shader.uniforms,
			depthWrite: false,
			side: THREE.BackSide,
		});

		this.mesh = new THREE.Mesh(geometry, material);
	}
}
