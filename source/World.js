'use strict';

var TaskManager = require( './TaskManager' );
var KeyManager = require( './KeyManager' );
var CameraManager = require( './CameraManager' );
var Skybox = require( './Skybox' );
var Terrain = require( './Terrain' );


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

		var geometry = new THREE.BoxBufferGeometry( this.SIZE, this.SIZE, this.SIZE );
		var cubeMaterial = new THREE.MeshPhongMaterial( {
			color: 0x2d2d2d,
			specular: 0xffffff,
			shininess: 0.75,
			shading: THREE.FlatShading,
			vertexColors: THREE.VertexColors
		} );

		// this.terrain = new Terrain( this.width );
		// this.terrain.generate( 0.001 );

		for ( let x = 0; x < this.width; x++ ) {

			for ( let z = 0; z < this.depth; z++ ) {

				var mesh = new THREE.Mesh( geometry, cubeMaterial );
				mesh.position.x = x * this.SIZE;
				mesh.position.z = z * this.SIZE;
				mesh.position.y = 0; //this.terrain.get( x, z );
				this.scene.add( mesh );

			}

		}

		var loader = new THREE.JSONLoader();
		// load a resource
		loader.load(
			// resource URL
			'lib/models/scaff.json',
			// Function when resource is loaded
			geometry => {

				var material = new THREE.MeshPhongMaterial( {
					color: 0x2d2d2d,
					specular: 0xffffff,
					shininess: 0.75,
					shading: THREE.FlatShading,
					vertexColors: THREE.VertexColors
				} );

				var object = new THREE.Mesh( geometry, material );
				object.position.x = 16;
				object.position.y = 1;
				object.position.z = 16;
				this.scene.add( object );
			}
		);

		this.skybox = new Skybox( this, 'skybox-' );
		this.scene.add( this.skybox.mesh );

	}

	onWindowResize() {

		this.cameraManager.camera.aspect = window.innerWidth / window.innerHeight;
		this.cameraManager.camera.updateProjectionMatrix();
		// this.cameraManager.resizeWindow( window.innerWidth, window.innerHeight );
		this.renderer.setSize( window.innerWidth, window.innerHeight );

	}

	setupRenderer() {

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		$( '#container' ).append( this.renderer.domElement );
		window.addEventListener( 'resize', this.onWindowResize, false );

	}

	setupLighting() {

		this.sun = new THREE.DirectionalLight( 0xefffef, 1 );
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