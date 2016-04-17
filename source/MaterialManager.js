'use strict';

module.exports = class {

	constructor() {

		this.materials = {};

	}

	get( name ) {

		return this.materials[ name ];

	}

	load() {

		return Promise.all( [

			this.loadTexture( 'lava' ),
			this.loadTexture( 'policeTemplate', 'png' )

		] );

	}

	loadTexture( name, ext ) {

		return new Promise( fulfil => {

			var loader = new THREE.TextureLoader();
			// load a resource
			loader.load(
				// resource URL
				'lib/img/' + name + '.' + ( ext || 'jpg' ),
				// Function when resource is loaded
				texture => {

					this.materials[ name ] = new THREE.MeshBasicMaterial( {
						map: texture,
					} );
					fulfil();

				}

			);

		} );

	}

};