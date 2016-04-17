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

		this.materials.police = new THREE.MeshPhongMaterial( {
			color: 0x3d73ed,
			shading: THREE.FlatShading
		} );
		this.materials.floor1 = new THREE.MeshLambertMaterial( {
			color: 0x333333
		} );
		this.materials.floor2 = new THREE.MeshLambertMaterial( {
			color: 0x222222
		} );
		this.materials.tower = new THREE.MeshPhongMaterial( {
			color: 0xaaaaaa,
			shading: THREE.FlatShading
		} );
		this.materials.tower2 = new THREE.MeshPhongMaterial( {
			color: 0x666666,
			shading: THREE.FlatShading
		} );
		this.materials.saved = new THREE.MeshPhongMaterial( {
			color: 0xaaff00,
			shading: THREE.FlatShading
		} );
		this.materials.floor3 = new THREE.MeshLambertMaterial( {
			color: 0x558800
		} );
		this.materials.floor4 = new THREE.MeshLambertMaterial( {
			color: 0x447700
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