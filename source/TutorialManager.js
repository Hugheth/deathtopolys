'use strict';

module.exports = class {

	constructor( world ) {

		this.world = world;
		this.count = 0;

		this.onlyEnglishSorry = [

			'Hello there, brave Scaffold!<br><small>Press enter for more...</small>',
			'You have reached a city ruled by devious junk smugglers...',
			'Good thing too because you were running out!',
			'Use WASD to move...',
			'Press SPACEBAR to jump<br><small>- or SHIFT (srsly Ludum?!)</small>',
			"O sorry I forgot! You can build more scaffold.<br><small>(You're like a metal spider)</small>",
			'See that junk over there? Go pick it up!',
			'MMMMM Tasty. And shiny too.<br><small>(Cheers THREE.MeshPhongMaterial)</small>',
			'Some tower blocks have SHIFTED out of the city fabric over there!',
			'You can capture them by surrounding them in a rectangle of scaffold<br><small>Have you tried holding the SPACEBAR down?</small>',
			"Make sure you roll over a corner to ensure capture!<br><small>(You let me down 11:30pm algorithm!!!)</small>",
			"Your captured buildings will generate more junk for you!",
			"The taller they are when you capture them the more junk you get...",
			"Oh yeh there are also police trying to bust yow.",
			"This is where I do a runner...",
			"...",
			"????",
			"<small>(there's a win condition. can you guess it?)"

		];

		$( '#skipTutorial' ).click( () => {

			this.done();

		} );

		$( window ).on( 'keydown', ( e ) => {

			if ( e.which === 12 + 1 ) {

				this.next();

			}

		} );

		this.next();


	}

	done() {

		$( '#skipTutorial' ).remove();
		$( '#tutorial' ).remove();
		if ( !this.police ) {

			this.world.addPolice( new THREE.Vector3( 15, 0, 12 ) );
			this.world.addPolice( new THREE.Vector3( 12, 0, 15 ) );

		}

		this.world.scaff.setMetal( 20 );
		this.world.terrain.start();

	}

	next() {

		var text = this.onlyEnglishSorry.shift();
		$( '#tutorial' ).html( text );

		switch ( this.count++ ) {

			case 6:

				this.world.addJunk( new THREE.Vector3( 18, 0, 14 ) );
				break;

			case 8:

				this.world.terrain.raiseTile( 5, 8 );
				this.world.terrain.raiseTile( 5, 8 );
				this.world.terrain.raiseTile( 6, 6 );
				this.world.terrain.raiseTile( 7, 10 );
				this.world.terrain.raiseTile( 7, 10 );
				this.world.terrain.raiseTile( 7, 10 );
				break;

			case 9:

				this.world.addJunk( new THREE.Vector3( 19, 0, 14 ) );
				this.world.addJunk( new THREE.Vector3( 14, 0, 12 ) );
				this.world.addJunk( new THREE.Vector3( 12, 0, 8 ) );
				this.world.addJunk( new THREE.Vector3( 15, 0, 18 ) );
				break;

			case 13:
				this.police = true;
				this.world.addPolice( new THREE.Vector3( 15, 0, 12 ) );
				this.world.addPolice( new THREE.Vector3( 12, 0, 15 ) );
				break;
		}

		if ( !text ) {

			this.done();

		}

	}


};