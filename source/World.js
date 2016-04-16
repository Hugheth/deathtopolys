'use strict';

var TaskManager = require( './TaskManager' );
var KeyManager = require( './KeyManager' );
var CameraManager = require( './CameraManager' );
var Skybox = require( './Skybox' );
var Terrain = require( './Terrain' );
var Scaff = require( './Scaff' );
var Struct = require( './Struct' );


module.exports = class {

	constructor() {

		this.init();

		this.setupRenderer();
		this.setupLighting();

		this.taskManager.start();

		this.animate();

	}

	init() {

		this.taskManager = new TaskManager( this );
		this.keyManager = new KeyManager( this );
		this.cameraManager = new CameraManager( this );

		this.scene = new THREE.Scene();

		this.width = 32;
		this.depth = 32;

		this.SIZE = 1;
		this.HEIGHT = 10;

		var geometry = new THREE.BoxBufferGeometry( this.SIZE, this.SIZE * this.HEIGHT, this.SIZE );
		var darkCubeMaterial = new THREE.MeshLambertMaterial( {
			color: 0x2d2d2d,
			shading: THREE.FlatShading
		} );
		var lavaMaterial = new THREE.MeshLambertMaterial( {
			color: 0xfd2d6d,
			shading: THREE.FlatShading
		} );
		this.hoverMaterial = new THREE.MeshLambertMaterial( {
			color: 0x3dfd6d,
			shading: THREE.FlatShading
		} );

		this.tiles = [];

		for ( let x = 0; x < this.width; x++ ) {

			var row = [];

			for ( let z = 0; z < this.depth; z++ ) {

				var height = Math.floor( Math.pow( Math.random(), 6 ) * 3 );

				var mesh = new THREE.Mesh( geometry, Math.random() > 0.8 ? lavaMaterial : darkCubeMaterial );
				mesh.position.x = x * this.SIZE;
				mesh.position.z = z * this.SIZE;
				mesh.position.y = height - 0.1 * ( ( x + z ) % 2 ) - this.HEIGHT / 2 - 0.5;
				this.scene.add( mesh );

				row.push( {

					mesh: mesh,
					height: height,
					objects: []

				} );

			}

			this.tiles.push( row );

		}

		this.scaff = new Scaff( this );

		this.skybox = new Skybox( this, 'skybox-' );
		this.scene.add( this.skybox.mesh );

	}

	getDrop( pos ) {

		var tile = this.getTile( pos.x, pos.z );
		var low = tile.height;
		_.each( tile.objects, object => {

			if ( object.position.y <= pos.y ) {

				low = Math.max( low, pos.y );

			}
		} );

		return pos.y - low;

	}

	addStruct( pos ) {

		var drop = this.getDrop( pos );
		if ( drop > 0 ) {

			this.getTile( pos.x, pos.z ).objects.push( new Struct( this, pos ) );

		} else {
			console.log( "Skipping due to drop" );
		}

	}

	getTile( x, z ) {

		return this.tiles[ x ][ z ];

	}

	markTile( x, z ) {

		this.tiles[ x ][ z ].mesh.material = this.hoverMaterial;

	}

	onWindowResize() {

		this.cameraManager.camera.aspect = window.innerWidth / window.innerHeight;
		this.cameraManager.camera.updateProjectionMatrix();
		// this.cameraManager.resizeWindow( window.innerWidth, window.innerHeight );
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