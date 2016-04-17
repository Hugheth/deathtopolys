'use strict';

module.exports = class {

	constructor( world, position ) {

		this.world = world;
		this.position = position;
		this.initMesh();

		this.animateOffset = Math.random() * Math.PI * 2;

		this.animate = this.animate.bind( this );
		this.world.taskManager.addTask( this.animate );

	}

	initMesh() {

		this.mesh = new THREE.Mesh( this.world.modelManager.get( 'police' ), this.world.materialManager.get( 'policeTemplate' ) );
		this.mesh.position.copy( this.position );
		this.world.scene.add( this.mesh );

	}

	animate( frame ) {

		this.mesh.rotation.y += 0.01;

	}

};