'use strict';

var MovingObject = require( './MovingObject' );
var Lerper = require( './Lerper' );

module.exports = class extends MovingObject {

	constructor( world ) {

		super();

		this.spewing = false;

		this.world = world;

		this.setMetal( 20 );
		this.speed = 300;

		this.LEFT = [ 37, 'A' ];
		this.UP = [ 38, 'W' ];
		this.RIGHT = [ 39, 'D' ];
		this.DOWN = [ 40, 'S' ];
		this.SPACE = [ 32 ];

		this.initMesh();
		this.initKeys();

	}

	setMetal( metal ) {

		this.metal = metal;
		$( '#metal' ).html( metal + ' metal' );

	}

	initMesh() {

		var material = new THREE.MeshPhongMaterial( {
			color: 0xfdfd2d,
			specular: 0xffffff,
			shininess: 0.75,
			shading: THREE.FlatShading,
			vertexColors: THREE.VertexColors
		} );

		this.mesh = new THREE.Mesh( this.world.modelManager.get( 'scaff' ), material );
		this.mesh.position.set( 16, this.world.getTile( 16, 16 ).height, 16 );
		this.world.scene.add( this.mesh );

	}

	initKeys() {

		this.world.keyManager.addKeyBinding( this.LEFT, this.moveLeft.bind( this ) );
		this.world.keyManager.addKeyBinding( this.RIGHT, this.moveRight.bind( this ) );
		this.world.keyManager.addKeyBinding( this.UP, this.moveUp.bind( this ) );
		this.world.keyManager.addKeyBinding( this.DOWN, this.moveDown.bind( this ) );
		this.world.keyManager.addKeyBinding( this.SPACE, this.spew.bind( this ), null, this.releaseSpew.bind( this ) );

	}

	move( x, z ) {

		this.doMove( x, z, ( value ) => {

			this.mesh.rotation.x = this.rotation.x + this.targetRotation.x * value * Math.PI / 2;
			this.mesh.rotation.y = this.rotation.y + this.targetRotation.y * value * Math.PI / 2;
			this.mesh.rotation.z = this.rotation.z + this.targetRotation.z * value * Math.PI / 2;
			this.world.cameraManager.updatePosition();

		}, () => {

			if ( this.spewing && this.metal > 0 ) {

				// Add struct
				var placed = this.world.addStruct( this.mesh.position.clone().add( new THREE.Vector3( 0, -1, 0 ) ) );
				if ( placed ) {
					this.setMetal( this.metal - 1 );
				}
			}

			if ( this.metal === 0 ) {

				this.spewing = false;

			}

			// Check for below
			this.checkPickup();
			this.checkDead();

		}, () => {

			this.checkPickup();
			this.checkDead();

			this.world.playSound( 'land.wav' );

		} );

	}

	checkPickup() {

		var pickup = this.world.getPickup( this.mesh.position );
		if ( pickup ) {

			this.world.playSound( 'pickup.wav' );
			this.setMetal( this.metal + 5 );
			pickup.destroy();

		}

	}

	releaseSpew() {

		this.spewing = false;

	}

	spew() {

		if ( this.state !== this.STOPPED || this.spewing ) {

			return;

		}

		if ( this.metal === 0 ) return;

		this.spewing = true;

		this.position = this.mesh.position.clone();
		this.rotation = this.mesh.rotation.clone();
		this.targetPosition = new THREE.Vector3( 0, 1, 0 );

		this.state = this.JUMPING;
		this.world.playSound( 'jump.wav' );

		var lerp = new Lerper( this.world.taskManager, this.speed, value => {

			var height = -4 * Math.pow( value, 2 ) + 5 * value;

			this.mesh.position.copy( this.position.clone().add( this.targetPosition.clone().multiplyScalar( height ) ) );
			this.world.cameraManager.updatePosition();


		}, () => {

			this.state = this.STOPPED;

			// Add struct
			var placed = this.world.addStruct( this.position );
			if ( placed ) {
				this.setMetal( this.metal - 1 );
			}

		} );
		lerp.start();

	}

	moveLeft() {

		this.move( -1, 0 );

	}

	moveRight() {

		this.move( 1, 0 );

	}

	moveUp() {

		this.move( 0, -1 );

	}

	moveDown() {

		this.move( 0, 1 );

	}

	checkDead() {

		var mark = this.world.getDropMark( this.position );

		if ( mark === 'police' ) {
			console.log( 'Yo Dead' );
		}

	}

};