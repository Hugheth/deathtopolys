'use strict';

var MovingObject = require( './MovingObject' );

module.exports = class extends MovingObject {

	constructor( world, position ) {

		super();

		this.speed = 800;

		this.world = world;
		this.position = position;
		this.initMesh();

		this.animateOffset = Math.random() * Math.PI * 2;

		this.animate = this.animate.bind( this );
		this.world.taskManager.addTask( this.animate );

		this.LOCALS = [
			new THREE.Vector3( 0, 0, 1 ),
			new THREE.Vector3( 0, 0, -1 ),
			new THREE.Vector3( 1, 0, 0 ),
			new THREE.Vector3( -1, 0, 0 )

		];

		this.wander();

	}

	wander() {

		var wait = Math.random() > 0.8;

		if ( wait ) {

			setTimeout( () => {

				this.wander();

			}, 4000 );
			return;

		}

		var moveIn;

		// Pick a direction that's empty
		_.each( _.shuffle( this.LOCALS ), local => {

			var target = this.position.clone().add( local );
			var drop = this.world.getDrop( target );
			if ( drop >= 0 ) {

				moveIn = local;
				return false;

			}

		} );

		if ( !moveIn ) return;

		this.doMove( moveIn.x, moveIn.z, () => {}, ( unstable ) => {

			// Mark tile
			this.world.markTile( this.position.x, this.position.z, 'police' );

			if ( !unstable ) {

				this.wander();

			}

		}, () => {

			this.wander();

		} );

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