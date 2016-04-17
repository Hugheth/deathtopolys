'use strict';

var TaskManager = require( './TaskManager' );
var KeyManager = require( './KeyManager' );
var CameraManager = require( './CameraManager' );
var ModelManager = require( './ModelManager' );
var MaterialManager = require( './MaterialManager' );
var Skybox = require( './Skybox' );
// var Terrain = require( './Terrain' );
var Scaff = require( './Scaff' );
var Struct = require( './Struct' );
var Junk = require( './Junk' );
var Police = require( './Police' );

module.exports = class {

	constructor() {

		this.init();

		this.setupRenderer();
		this.setupLighting();
		this.playMusic();

		this.taskManager.start();
		this.materialManager.load().then( () => {

			return this.modelManager.load();

		} ).then( () => {

			this.initModels();
			this.animate();

		} );

	}

	init() {

		this.taskManager = new TaskManager( this );
		this.keyManager = new KeyManager( this );
		this.cameraManager = new CameraManager( this );
		this.modelManager = new ModelManager( this );
		this.materialManager = new MaterialManager( this );

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

		var geometry = new THREE.BoxBufferGeometry( this.SIZE, this.SIZE * this.HEIGHT, this.SIZE );
		var darkCubeMaterial = new THREE.MeshLambertMaterial( {
			color: 0xaaaaaa
		} );
		var darkCubeMaterial2 = new THREE.MeshLambertMaterial( {
			color: 0x999999
		} );
		var lavaMaterial = new THREE.MeshLambertMaterial( {
			color: 0xfd2d6d
		} );
		this.hoverMaterial = new THREE.MeshLambertMaterial( {
			color: 0x3dfd6d
		} );

		this.tiles = [];

		for ( let x = 0; x < this.width; x++ ) {

			var row = [];

			for ( let z = 0; z < this.depth; z++ ) {

				var height = Math.floor( Math.pow( Math.random(), 6 ) * 3 );

				var mesh = new THREE.Mesh( geometry, Math.random() > 0.8 ? this.materialManager.get( 'lava' ) : ( ( x + z ) % 2 ? darkCubeMaterial : darkCubeMaterial2 ) );
				mesh.position.x = x * this.SIZE;
				mesh.position.z = z * this.SIZE;
				mesh.position.y = height - 0.1 * ( ( x + z ) % 2 ) - this.HEIGHT / 2 - 0.5;
				this.scene.add( mesh );

				row.push( {

					mesh: mesh,
					height: height,
					blocks: [],
					pickups: []

				} );

			}

			this.tiles.push( row );

		}

		var i = 0;
		while ( i < 20 ) {

			let pos = new THREE.Vector3( Math.floor( Math.random() * 32 ), 10, Math.floor( Math.random() * 32 ) );
			pos.y = this.getTile( pos.x, pos.z ).height;

			this.addJunk( pos );
			i++;

		}

		var j = 0;
		while ( j < 20 ) {

			let pos = new THREE.Vector3( Math.floor( Math.random() * 32 ), 10, Math.floor( Math.random() * 32 ) );
			pos.y = this.getTile( pos.x, pos.z ).height;

			this.addPolice( pos );
			j++;

		}

		this.scaff = new Scaff( this );

	}

	getDrop( pos ) {

		var tile = this.getTile( pos.x, pos.z );
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

			this.playSound( 'spew.wav' );
			this.getTile( pos.x, pos.z ).blocks.push( new Struct( this, pos ) );
			return true;

		} else {
			console.log( "Skipping due to drop" );
		}

	}

	addJunk( pos ) {

		this.getTile( pos.x, pos.z ).pickups.push( new Junk( this, pos ) );

	}

	addPolice( pos ) {

		this.getTile( pos.x, pos.z ).blocks.push( new Police( this, pos ) );

	}

	getTile( x, z ) {

		return this.tiles[ x ][ z ];

	}

	playSound( sound ) {

		var id = sound + _.now();

		this.playingSounds[ id ] = new Audio( 'lib/audio/' + sound );
		this.playingSounds[ id ].onended = () => {
			delete this.playingSounds[ id ];
		};
		this.playingSounds[ id ].play();

	}

	playMusic() {

		this.music = new Audio( 'lib/audio/music.wav' );
		this.music.loop = true;
		this.music.play();
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

	markTile( x, z ) {

		this.tiles[ x ][ z ].mesh.material = this.hoverMaterial;

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