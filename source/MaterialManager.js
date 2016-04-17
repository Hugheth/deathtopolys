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
		this.materials.floor1 = new THREE.MeshLambertMaterial( {
			color: 0x333333
		} );
		this.materials.floor2 = new THREE.MeshLambertMaterial( {
			color: 0x222222
		} );
		this.materials.tower = new THREE.MeshLambertMaterial( {
			color: 0xaaaaaa
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