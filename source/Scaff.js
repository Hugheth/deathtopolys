'use strict';

var Lerper = require( './Lerper' );
var Struct = require( './Struct' );

module.exports = class {

	constructor( world ) {

		this.STOPPED = 0;
		this.MOVING = 1;
		this.JUMPING = 2;
		this.FALLING = 3;

		this.state = this.STOPPED;
		this.spewing = false;

		this.world = world;

		this.metal = 5;
		this.speed = 300;

		this.LEFT = [ 37, 'A' ];
		this.UP = [ 38, 'W' ];
		this.RIGHT = [ 39, 'D' ];
		this.DOWN = [ 40, 'S' ];
		this.SPACE = [ 32 ];

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
					color: 0xfdfd2d,
					specular: 0xffffff,
					shininess: 0.75,
					shading: THREE.FlatShading,
					vertexColors: THREE.VertexColors
				} );

				this.mesh = new THREE.Mesh( geometry, material );
				this.mesh.position.x = 16;
				this.mesh.position.y = 3;
				this.mesh.position.z = 16;
				this.world.scene.add( this.mesh );

				this.initKeys();

			}
		);

	}

	initKeys() {

		this.world.keyManager.addKeyBinding( this.LEFT, this.moveLeft.bind( this ) );
		this.world.keyManager.addKeyBinding( this.RIGHT, this.moveRight.bind( this ) );
		this.world.keyManager.addKeyBinding( this.UP, this.moveUp.bind( this ) );
		this.world.keyManager.addKeyBinding( this.DOWN, this.moveDown.bind( this ) );
		this.world.keyManager.addKeyBinding( this.SPACE, this.spew.bind( this ), null, this.releaseSpew.bind( this ) );

	}

	move( x, z ) {

		if ( this.state !== this.STOPPED ) return;
		this.state = this.MOVING;

		this.position = this.mesh.position.clone();
		this.rotation = this.mesh.rotation.clone();
		this.targetPosition = new THREE.Vector3( x, 0, z );

		var modZ = Math.round( ( this.mesh.rotation.x / Math.PI * 2 ) ) % 4;
		var rZ = [ -x, x, x, -x ][ modZ ];

		this.targetRotation = new THREE.Vector3( z, 0, rZ );

		var lerp = new Lerper( this.world.taskManager, this.speed, value => {

			this.mesh.position.copy( this.position.clone().add( this.targetPosition.clone().multiplyScalar( value ) ) );
			this.mesh.rotation.x = this.rotation.x + this.targetRotation.x * value * Math.PI / 2;
			this.mesh.rotation.y = this.rotation.y + this.targetRotation.y * value * Math.PI / 2;
			this.mesh.rotation.z = this.rotation.z + this.targetRotation.z * value * Math.PI / 2;
			this.world.cameraManager.updatePosition();


		}, () => {

			this.state = this.STOPPED;

			if ( this.spewing && this.metal > 0 ) {

				// Add struct
				new Struct( this.world, this.mesh.position.clone().add( new THREE.Vector3( 0, -1, 0 ) ) );
				this.metal--;
				// Mark tile
				this.world.markTile( this.mesh.position.x, this.mesh.position.z );

			}

			if ( this.metal === 0 ) {

				this.spewing = false;

			}

			// Check for below
			this.fall();

		} );
		lerp.start();

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

		this.metal--;

		this.position = this.mesh.position.clone();
		this.rotation = this.mesh.rotation.clone();
		this.targetPosition = new THREE.Vector3( 0, 1, 0 );

		this.state = this.JUMPING;

		var lerp = new Lerper( this.world.taskManager, this.speed, value => {

			var height = -4 * Math.pow( value, 2 ) + 5 * value;

			this.mesh.position.copy( this.position.clone().add( this.targetPosition.clone().multiplyScalar( height ) ) );
			this.world.cameraManager.updatePosition();


		}, () => {

			this.state = this.STOPPED;

			// Add struct
			new Struct( this.world, this.position );

			// Mark tile
			this.world.markTile( this.mesh.position.x, this.mesh.position.z );

		} );
		lerp.start();

	}

	fall() {

		var floor = this.world.getBaseHeight( this.mesh.position.x, this.mesh.position.z );

		var drop = this.mesh.position.y - floor;

		if ( drop <= 0 ) return;

		var acceleration = 40;

		var duration = Math.sqrt( 2 * drop / acceleration ) * 1000;

		this.state = this.FALLING;
		this.position = this.mesh.position.clone();
		this.targetPosition = new THREE.Vector3( 0, -drop, 0 );

		var lerp = new Lerper( this.world.taskManager, duration, value => {

			var height = Math.pow( value, 2 );

			this.mesh.position.copy( this.position.clone().add( this.targetPosition.clone().multiplyScalar( height ) ) );
			this.world.cameraManager.updatePosition();


		}, () => {

			this.state = this.STOPPED;

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

};