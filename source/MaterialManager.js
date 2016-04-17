'use strict';

module.exports = class {

	constructor() {

		this.materials = {};

	}

	get( name ) {

		return this.materials[ name ];

	}

	load() {

		this.loadStatic();

		return Promise.all( [

			this.loadTexture( 'lava' ),
			this.loadTexture( 'policeTemplate', 'png' )

		] );

	}

	loadStatic() {

		this.materials.police = new THREE.MeshLambertMaterial( {
			color: 0x3d73ed
		} );

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