'use strict';

module.exports = class {

	constructor( world ) {

		var urlPrefix = "lib/img/";
		var urls = [ urlPrefix + "skybox.png", urlPrefix + "skybox.png",
			urlPrefix + "skybox.png", urlPrefix + "bottombox.png",
			urlPrefix + "skybox.png", urlPrefix + "skybox.png"
		];

		var textureCube = new THREE.ImageUtils.loadTextureCube( urls );
		textureCube.format = THREE.RGBFormat;

		const SIZE = world.SIZE * world.width * 20;

		var geometry = new THREE.BoxGeometry( SIZE, SIZE, SIZE );

		// Skybox
		var shader = THREE.ShaderLib[ "cube" ];
		shader.uniforms[ "tCube" ].value = textureCube;

		var material = new THREE.ShaderMaterial( {
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: shader.uniforms,
			depthWrite: false,
			side: THREE.BackSide
		} );

		this.mesh = new THREE.Mesh( geometry, material );
		this.mesh.position.set( world.width / 2 * world.SIZE, 0, world.width / 2 * world.SIZE );

	}

};