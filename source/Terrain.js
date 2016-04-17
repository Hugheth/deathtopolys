'use strict';

module.exports = class {

	constructor( world ) {

		this.world = world;
		this.initTiles();

	}

	start() {

		this.world.taskManager.addTask( this.raise.bind( this ) );

	}

	raise( frame ) {

		if ( frame % 5 ) return;

		var x = Math.floor( Math.random() * this.world.width );
		var z = Math.floor( Math.random() * this.world.depth );

		this.raiseTile( x, z );

		if ( frame % 1000 === 0 ) {

			this.placePolice();

		}

	}

	placePolice() {

		var n = 100;
		while ( n-- ) {

			var x = Math.floor( Math.random() * this.world.width );
			var z = Math.floor( Math.random() * this.world.depth );

			var tile = this.world.getTile( x, z );
			if ( tile.mark !== 'saved' ) {

				this.world.addPolice( new THREE.Vector3( x, 0, z ) );
				break;

			}

		}

	}

	raiseTile( x, z ) {

		var tile = this.world.getTile( x, z );

		if ( tile.mark === 'saved' ) return;
		if ( tile.height > 8 ) return;

		if ( tile.pickups.length === 0 && tile.blocks.length === 0 ) {

			if ( tile.height === 0 ) {

				tile.mesh.geometry = this.world.modelManager.get( 'tower' );

			}

			tile.height++;
			tile.mesh.material = this.world.materialManager.get( ( x + z ) % 2 ? 'tower' : 'tower2' );
			tile.mesh.position.y = tile.height - 0.1 * ( ( x + z ) % 2 ) - this.world.HEIGHT / 2 - 0.5;

		}

	}

	initTiles() {

		var geometry = new THREE.BoxBufferGeometry( this.world.SIZE, this.world.SIZE * this.world.HEIGHT, this.world.SIZE );

		this.world.tiles = [];

		for ( let x = 0; x < this.world.width; x++ ) {

			var row = [];

			for ( let z = 0; z < this.world.depth; z++ ) {

				var height = 0;
				// Math.floor( Math.pow( Math.random(), 6 ) * 3 );

				var mesh = new THREE.Mesh( geometry, ( x + z ) % 2 ? this.world.materialManager.get( 'floor1' ) : this.world.materialManager.get( 'floor2' ) );
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