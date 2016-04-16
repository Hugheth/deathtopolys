'use strict';

module.exports = class {

	constructor( world ) {

		this.world = world;
		this.keys = {};
		this.keyTasks = {};

		this.setupEvents();

	}

	setupEvents() {

		$( window ).on( 'keydown', ( e ) => {

			this.addTask( e.which );

		} ).on( 'keyup', ( e ) => {

			this.removeTask( e.which );


		} ).on( 'blur', () => {

			_.map( this.keys, ( keyDown, key ) => {

				if ( keyDown ) {

					this.removeTask( key );

				}

			} );
			this.keys = {};

		} );

	}

	addTask( key ) {

		var keyDown = this.keys[ key ],
			keyData = this.keyTasks[ key ];

		if ( keyData.onPress ) {

			keyData.onPress();

		}

		if ( !keyDown && keyData ) {

			this.world.taskManager.addTask( keyData.onPressing );

		}
		this.keys[ key ] = true;

	}

	removeTask( key ) {

		var keyDown = this.keys[ key ],
			keyData = this.keyTasks[ key ];

		if ( keyData.onRelease ) {

			keyData.onRelease();

		}

		if ( keyDown && keyData ) {

			this.world.taskManager.removeTask( keyData.onPressing );

		}
		this.keys[ key ] = false;

	}

	formatKey( key ) {

		if ( _.isString( key ) ) return key.charCodeAt( 0 );

		return key;

	}

	addKeyBinding( input, onPressing, onPress, onRelease ) {

		var keys = input;

		if ( !_.isArray( input ) ) {

			keys = [ input ];

		}

		_.map( keys, ( key ) => {

			this.keyTasks[ this.formatKey( key ) ] = {

				onPressing: onPressing,
				onPress: onPress,
				onRelease: onRelease

			};

		} );

	}

};