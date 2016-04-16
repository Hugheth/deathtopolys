'use strict';

module.exports = class {

	constructor( world ) {

		this.world = world;

		this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 80000 );
		this.camera.position.set( 16, 7, 24 );
		this.camera.lookAt( new THREE.Vector3( 16, 1, 16 ) );
		this.offset = new THREE.Vector3( 0, 5, 5 );

	}

	updatePosition() {

		this.camera.position.copy( this.world.scaff.mesh.position.clone().add( this.offset ) );

	}

	resizeWindow( w, h ) {

		this.camera.aspect = w / h;
		this.camera.updateProjectionMatrix();

	}

};