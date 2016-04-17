'use strict';

module.exports = class {

	constructor( world ) {

		this.world = world;
		this.initTiles();

	}

	initTiles() {

		var geometry = new THREE.BoxBufferGeometry( this.SIZE, this.SIZE * this.HEIGHT, this.SIZE );
		var darkCubeMaterial = new THREE.MeshLambertMaterial( {
			color: 0xaaaaaa
		} );
		var darkCubeMaterial2 = new THREE.MeshLambertMaterial( {
			color: 0x999999
		} );

		this.world.tiles = [];

		for ( let x = 0; x < this.world.width; x++ ) {

			var row = [];

			for ( let z = 0; z < this.world.depth; z++ ) {

				var height = 0;
				// Math.floor( Math.pow( Math.random(), 6 ) * 3 );

				var mesh = new THREE.Mesh( geometry, ( x + z ) % 2 ? darkCubeMaterial : darkCubeMaterial2 );
				mesh.position.x = x * this.world.SIZE;
				mesh.position.z = z * this.world.SIZE;
				mesh.position.y = height - 0.1 * ( ( x + z ) % 2 ) - this.world.HEIGHT / 2 - 0.5;
				this.world.scene.add( mesh );

				row.push( {

					mesh: mesh,
					height: height,
					blocks: [],
					pickups: []

				} );

			}

			this.world.tiles.push( row );

		}

	}

}