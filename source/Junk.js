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

		var material = new THREE.MeshPhongMaterial( {
			color: 0xaaaaaa,
			specular: 0xffffff,
			shininess: 0.75,
			shading: THREE.FlatShading,
			vertexColors: THREE.VertexColors
		} );

		this.mesh = new THREE.Mesh( this.world.modelManager.get( 'junk' ), material );
		this.mesh.position.copy( this.position );
		this.world.scene.add( this.mesh );

	}

	animate( frame ) {

		this.mesh.rotation.y += 0.1;
		this.mesh.position.y = this.position.y + ( Math.sin( frame / 10 + this.animateOffset ) * 0.2 );

	}

	destroy() {

		this.world.taskManager.removeTask( this.animate );

		var tile = this.world.getTile( this.position.x, this.position.z );

		tile.pickups.splice( _.indexOf( tile.pickups, this ), 1 );

		this.world.scene.remove( this.mesh );

	}

};