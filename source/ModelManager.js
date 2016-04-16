'use strict';

module.exports = class {

	constructor() {

		this.models = {};


	}

	load() {

		return Promise.all( [
			this.loadModel( 'scaff' )
		] );

	}

	get( name ) {

		return this.models[ name ];

	}

	loadModel( name ) {

		return new Promise( fulfil => {

			var loader = new THREE.JSONLoader();
			// load a resource
			loader.load(
				// resource URL
				'lib/models/' + name + '.json',
				// Function when resource is loaded
				geometry => {

					this.models[ name ] = geometry;
					fulfil();

				}

			);

		} );

	}

};