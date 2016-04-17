'use strict';

var Lerper = require( './Lerper' );

module.exports = class {

	constructor() {

		this.STOPPED = 0;
		this.MOVING = 1;
		this.JUMPING = 2;
		this.FALLING = 3;

		this.state = this.STOPPED;

	}

	doMove( x, z, onMove, onMoved, onFall ) {

		if ( this.state !== this.STOPPED ) return;

		this.position = this.mesh.position.clone();
		this.rotation = this.mesh.rotation.clone();
		var moveIn = new THREE.Vector3( x, 0, z );

		var target = this.position.clone().add( moveIn );
		var drop = this.world.getDrop( target );
		if ( drop < 0 ) return;

		this.state = this.MOVING;

		this.world.playSound( 'move.wav' );

		var modZ = Math.round( ( this.mesh.rotation.x / Math.PI * 2 ) ) % 4;
		var rZ = [ -x, x, x, -x ][ modZ ];

		this.targetRotation = new THREE.Vector3( z, 0, rZ );

		var lerp = new Lerper( this.world.taskManager, this.speed, value => {

			this.mesh.position.copy( this.position.clone().add( moveIn.clone().multiplyScalar( value ) ) );
			onMove( value );


		}, () => {

			this.state = this.STOPPED;
			this.position = this.mesh.position.clone();

			var drop = this.world.getDrop( this.mesh.position );

			var unstable = drop > 0;

			onMoved( unstable );

			if ( unstable ) {

				this.fall( onFall );

			}

		} );
		lerp.start();

	}

	fall( onFall ) {

		var acceleration = 40;
		var drop = this.world.getDrop( this.mesh.position );

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

			onFall();

		} );
		lerp.start();

	}

};