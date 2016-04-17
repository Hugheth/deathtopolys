'use strict';

var TaskManager = require( './TaskManager' );
var KeyManager = require( './KeyManager' );
var CameraManager = require( './CameraManager' );
var ModelManager = require( './ModelManager' );
var MaterialManager = require( './MaterialManager' );
var TutorialManager = require( './TutorialManager' );
var Skybox = require( './Skybox' );
var Terrain = require( './Terrain' );
var Scaff = require( './Scaff' );
var Struct = require( './Struct' );
var Junk = require( './Junk' );
var Police = require( './Police' );

module.exports = class {

	constructor() {

		this.init();

		this.estate = 0;

		this.setupRenderer();
		this.setupLighting();
		this.playMusic();

		this.taskManager.start();
		this.materialManager.load().then( () => {

			return this.modelManager.load();

		} ).then( () => {

			this.initTerrain();
			this.initModels();
			this.animate();

		} );

		this.towerTasks = {};
		this.taskManager.addTask( this.checkTowers.bind( this ) );

		var next = $( '<div id="#retry" class="option">' ).append( 'Reset' ).click( () => {

			document.location.reload();

		} );
		$( '#hud' ).append( next );

	}

	checkTowers( frame ) {

		var frameTasks = this.towerTasks[ frame ];

		if ( frameTasks ) {

			_.each( frameTasks, position => {

				if ( !this.getPickup( position ) ) {

					this.addJunk( position );
					var timeToNext = frame + Math.floor( Math.random() * 1000 ) + 1000 - position.y * 200;
					if ( !this.towerTasks[ timeToNext ] ) {
						this.towerTasks[ timeToNext ] = [];
					}
					this.towerTasks[ timeToNext ].push( position );

				}


			} );

			delete this.towerTasks[ frame ];

		}

	}

	init() {

		this.taskManager = new TaskManager( this );
		this.keyManager = new KeyManager( this );
		this.cameraManager = new CameraManager( this );
		this.modelManager = new ModelManager( this );
		this.materialManager = new MaterialManager( this );
		this.tutorialManager = new TutorialManager( this );

		this.playingSounds = {};

		this.scene = new THREE.Scene();

		this.width = 32;
		this.depth = 32;

		this.SIZE = 1;
		this.HEIGHT = 10;

		this.skybox = new Skybox( this, 'skybox-' );
		this.scene.add( this.skybox.mesh );

	}

	initModels() {

		// var i = 0;
		// while ( i < 20 ) {
		//
		// 	let pos = new THREE.Vector3( Math.floor( Math.random() * 32 ), 10, Math.floor( Math.random() * 32 ) );
		// 	pos.y = this.getTile( pos.x, pos.z ).height;
		//
		// 	this.addJunk( pos );
		// 	i++;
		//
		// }
		//
		// var j = 0;
		// while ( j < 20 ) {
		//
		// 	let pos = new THREE.Vector3( Math.floor( Math.random() * 32 ), 10, Math.floor( Math.random() * 32 ) );
		// 	pos.y = this.getTile( pos.x, pos.z ).height;
		//
		// 	this.addPolice( pos );
		// 	j++;
		//
		// }

		this.scaff = new Scaff( this );
		this.cameraManager.camera.position.copy( this.scaff.mesh.position.clone().add( this.cameraManager.offset ) );

	}

	initTerrain() {

		this.terrain = new Terrain( this );

	}

	getDrop( pos ) {

		var tile = this.getTile( pos.x, pos.z );

		if ( !tile ) {
			return -Infinity;
		}
		var low = tile.height;
		_.each( tile.blocks, object => {

			if ( object.position.y <= pos.y ) {

				low = Math.max( low, object.position.y + 1 );

			}

		} );

		return pos.y - low;

	}

	addStruct( pos ) {

		var drop = this.getDrop( pos );
		if ( drop >= 0 ) {

			var struct = new Struct( this, pos );

			this.playSound( 'spew.wav' );
			this.getTile( pos.x, pos.z ).blocks.push( struct );

			this.checkStructForRing( struct );

			return true;

		} else {
			// console.log( "Skipping due to drop" );
		}

	}

	checkStructForRing( struct ) {

		var rings = [];
		var pos = struct.position;
		let vPos = pos.clone();

		var n = 32;
		while ( n-- ) {

			vPos.x++;
			vPos.z = pos.z;

			if ( !this.hasGoodStruct( vPos ) ) {

				break;

			}

			var m = 32;
			while ( m-- ) {

				vPos.z++;
				if ( !this.hasGoodStruct( vPos ) ) {

					break;

				}

				this.contributeRing( pos, vPos, 1, 1, rings );

			}

			vPos.z = pos.z;

			m = 32;
			while ( m-- ) {

				vPos.z--;
				if ( !this.hasGoodStruct( vPos ) ) {

					break;

				}

				this.contributeRing( pos, vPos, 1, -1, rings );

			}

		}

		vPos.x = pos.x;

		n = 32;
		while ( n-- ) {

			vPos.x--;
			vPos.z = pos.z;

			if ( !this.hasGoodStruct( vPos ) ) {

				break;

			}

			let m = 32;
			while ( m-- ) {

				vPos.z++;
				if ( !this.hasGoodStruct( vPos ) ) {

					break;

				}

				this.contributeRing( pos, vPos, -1, 1, rings );

			}

			vPos.z = pos.z;

			m = 32;
			while ( m-- ) {

				vPos.z--;
				if ( !this.hasGoodStruct( vPos ) ) {

					break;

				}

				this.contributeRing( pos, vPos, -1, -1, rings );

			}

		}

		var foundNew = false;

		_.each( rings, ring => {

			var currentPos = ring[ 0 ].clone();
			var vX = ring[ 1 ].x > ring[ 0 ].x ? 1 : -1;
			var vZ = ring[ 1 ].z > ring[ 0 ].z ? 1 : -1;

			var area = 0;

			while ( currentPos.x !== ring[ 1 ].x + vX ) {

				currentPos.z = ring[ 0 ].z;

				while ( currentPos.z !== ring[ 1 ].z + vZ ) {

					var block = this.getBlock( currentPos );
					if ( block && block.type === 'struct' ) {

						block.mesh.material = this.materialManager.get( 'saved' );
						block.mark = 'saved';

					}

					var tile = this.getTile( currentPos.x, currentPos.z );

					this.destroyPolice( currentPos );

					if ( tile.mark !== 'saved' ) {

						tile.mark = 'saved';
						this.estate++;
						foundNew = true;

						if ( tile.height ) {

							tile.mesh.material = this.materialManager.get( 'saved' );
							var time = this.taskManager.frame + Math.floor( Math.random() * 200 );
							if ( !this.towerTasks[ time ] ) {

								this.towerTasks[ time ] = [];

							}
							this.towerTasks[ time ].push( new THREE.Vector3( currentPos.x, tile.height, currentPos.z ) );

						} else if ( ( currentPos.x + currentPos.z ) % 2 ) {

							tile.mesh.material = this.materialManager.get( 'floor3' );

						} else {

							tile.mesh.material = this.materialManager.get( 'floor4' );

						}

					}

					area++;

					currentPos.z += vZ;


				}

				currentPos.x += vX;

			}

			if ( area === this.width * this.depth ) {

				alert( "YOU WON!" );

			}

		} );

		if ( foundNew ) {

			this.playSound( 'pop.wav' );
			$( '#estate' ).html( this.estate + ' estate' );

		}

	}

	contributeRing( pos, outPos, vX, vZ, rings ) {

		var vPos = outPos.clone();

		while ( vPos.x !== pos.x ) {

			vPos.x -= vX;
			if ( !this.hasGoodStruct( vPos ) ) {

				return;

			}

			// console.log( 'good at', vPos );

		}

		while ( vPos.z !== pos.z ) {

			vPos.z -= vZ;
			if ( !this.hasGoodStruct( vPos ) ) {

				return;

			}

			// console.log( 'good at', vPos );

		}

		rings.push( [ pos.clone(), outPos.clone() ] );
		// console.log( 'Found ring!' );

	}

	destroyPolice( pos ) {

		var tile = this.getTile( pos.x, pos.z );
		_.each( tile.blocks, object => {

			if ( object.type === 'police' ) {

				object.destroy();

			}

		} );

	}

	addJunk( pos ) {

		this.getTile( pos.x, pos.z ).pickups.push( new Junk( this, pos ) );

	}

	addPolice( pos ) {

		this.getTile( pos.x, pos.z ).blocks.push( new Police( this, pos ) );

	}

	getTile( x, z ) {

		if ( !this.tiles[ x ] ) {
			return;
		}

		return this.tiles[ x ][ z ];

	}

	playSound( sound ) {

		var id = sound + _.now();

		if ( this.mute ) return;

		this.playingSounds[ id ] = new Audio( 'lib/audio/' + sound );
		this.playingSounds[ id ].onended = () => {
			delete this.playingSounds[ id ];
		};
		this.playingSounds[ id ].play();

	}

	playMusic() {

		this.music = new Audio( 'lib/audio/music.mp3' );
		this.music.loop = true;
		this.music.play();
		this.music.volume = 0.5;

		if ( !localStorage.unlockedMute ) {
			$( '#mute' ).hide();
		}

		$( '#mute' ).click( () => {

			this.mute = true;
			$( '#mute' ).hide();
			this.music.pause();

		} );
	}

	getPickup( pos ) {

		var currentPickup;

		var tile = this.getTile( pos.x, pos.z );
		_.each( tile.pickups, pickup => {

			if ( pickup.position.y == pos.y ) {

				currentPickup = pickup;

			}

		} );

		return currentPickup;

	}

	markTile( x, z, mark ) {

		var tile = this.getTile( x, z );
		tile.mesh.material = this.materialManager.get( mark );
		tile.mark = mark;

	}

	getDropMark( pos ) {

		var tile = this.getTile( pos.x, pos.z );
		var mark = tile.mark;

		if ( !tile ) {
			return;
		}
		var low = -1;
		_.each( tile.blocks, object => {

			if ( object.position.y <= pos.y ) {

				if ( object.position.y > low ) {
					low = object.position.y;
					mark = object.mark;
				}

			}

		} );

		return mark;

	}

	hasGoodStruct( pos ) {

		var block = this.getBlock( pos );

		if ( block && block.type === 'struct' && block.mark !== "police" ) {

			return true;

		}

	}

	getBlock( pos ) {

		var block;

		var tile = this.getTile( pos.x, pos.z );
		_.each( tile.blocks, object => {

			if ( object.position.y === pos.y ) {

				block = object;
				return false;

			}

		} );

		return block;

	}


	onWindowResize() {

		this.cameraManager.resizeWindow( window.innerWidth, window.innerHeight );
		this.renderer.setSize( window.innerWidth, window.innerHeight );

	}

	setupRenderer() {

		this.renderer = new THREE.WebGLRenderer( {
			antialias: true
		} );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		$( '#container' ).append( this.renderer.domElement );
		window.addEventListener( 'resize', this.onWindowResize.bind( this ), false );

	}

	setupLighting() {

		this.sun = new THREE.DirectionalLight( 0xffffef, 1 );
		this.sun.position.set( -600, 300, 400 );
		this.scene.add( this.sun );

		var shadowColor = "#2c2c5c";
		this.shadowSun = new THREE.DirectionalLight( shadowColor, 1 );
		this.shadowSun.position.set( 600, 300, -200 );
		this.scene.add( this.shadowSun );

		var ambiColor = "#3d3d3d";
		this.ambient = new THREE.AmbientLight( ambiColor );
		this.scene.add( this.ambient );

	}

	animate() {

		requestAnimationFrame( this.animate.bind( this ) );
		this.render();

	}

	render() {

		this.renderer.render( this.scene, this.cameraManager.camera );

	}

};