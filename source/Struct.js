'use strict';

module.exports = class {

	constructor( world, position ) {

		this.world = world;
		this.position = position;
		this.initMesh();

	}

	initMesh() {

		var material = new THREE.MeshPhongMaterial( {
			color: 0xaaaaaa,
			specular: 0xffffff,
			shininess: 0.75,
			shading: THREE.FlatShading,
			vertexColors: THREE.VertexColors
		} );

		this.mesh = new THREE.Mesh( this.world.modelManager.get( 'scaff' ), material );
		this.mesh.position.copy( this.position );
		this.world.scene.add( this.mesh );

	}

};