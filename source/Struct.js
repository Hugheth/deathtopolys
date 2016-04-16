'use strict';

module.exports = class {

	constructor( world, position ) {

		this.world = world;
		this.position = position;
		this.loadMesh();

	}

	loadMesh() {

		var loader = new THREE.JSONLoader();
		// load a resource
		loader.load(
			// resource URL
			'lib/models/scaff.json',
			// Function when resource is loaded
			geometry => {

				var material = new THREE.MeshPhongMaterial( {
					color: 0x666666,
					specular: 0xffffff,
					shininess: 0.75,
					shading: THREE.FlatShading,
					vertexColors: THREE.VertexColors
				} );

				this.mesh = new THREE.Mesh( geometry, material );
				this.mesh.position.copy( this.position );
				this.world.scene.add( this.mesh );

			}
		);

	}

};