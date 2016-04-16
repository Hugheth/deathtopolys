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
			keyTask = this.keyTasks[ key ];

		if ( !keyDown && keyTask ) {

			this.world.taskManager.addTask( keyTask );

		}
		this.keys[ key ] = true;

	}

	removeTask( key ) {

		var keyDown = this.keys[ key ],
			keyTask = this.keyTasks[ key ];

		if ( keyDown && keyTask ) {

			this.world.taskManager.removeTask( keyTask );

		}
		this.keys[ key ] = false;

	}

	formatKey( key ) {

		if ( _.isString( key ) ) return key.charCodeAt( 0 );

		return key;

	}

	addKeyBinding( input, task ) {

		var keys = input;

		if ( !_.isArray( input ) ) {

			keys = [ input ];

		}

		_.map( keys, ( key ) => {

			this.keyTasks[ this.formatKey( key ) ] = task;

		} );

	}

};