'use strict';

module.exports = class {

	constructor( world ) {

		this.LEFT = [ 37, 'A' ];
		this.UP = [ 38, 'W' ];
		this.RIGHT = [ 39, 'D' ];
		this.DOWN = [ 40, 'S' ];

		this.scrollSpeed = 0.3;

		this.world = world;

		this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 80000 );
		this.camera.position.set( 16, 7, 24 );
		this.camera.lookAt( new THREE.Vector3( 16, 1, 16 ) );

		this.initKeys();

	}

	initKeys() {

		this.world.keyManager.addKeyBinding( this.LEFT, this.moveLeft.bind( this ) );
		this.world.keyManager.addKeyBinding( this.RIGHT, this.moveRight.bind( this ) );
		this.world.keyManager.addKeyBinding( this.UP, this.moveUp.bind( this ) );
		this.world.keyManager.addKeyBinding( this.DOWN, this.moveDown.bind( this ) );

	}

	moveLeft() {

		this.camera.position.x -= this.scrollSpeed;

	}

	moveRight() {

		this.camera.position.x += this.scrollSpeed;

	}

	moveUp() {

		this.camera.position.z -= this.scrollSpeed;

	}

	moveDown() {

		this.camera.position.z += this.scrollSpeed;

	}

	updatePosition() {

		this.camera.lookAt( this.currentTarget );

	}

	resizeWindow( w, h ) {

		this.camera.aspect = w / h;
		this.camera.updateProjectionMatrix();

	}

};