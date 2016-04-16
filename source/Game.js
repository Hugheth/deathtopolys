'use strict';

module.exports = class {

	constructor() {

		this.init();
		this.animate();

	}

	init() {

		this.clock = new THREE.Clock();

		var worldWidth = 256,
			worldDepth = 256,
			worldHalfWidth = worldWidth / 2,
			worldHalfDepth = worldDepth / 2;

		this.container = $( '#container' )[ 0 ];
		this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
		this.scene = new THREE.Scene();

		this.controls = new THREE.FirstPersonControls( camera );
		this.controls.movementSpeed = 1000;
		this.controls.lookSpeed = 0.1;

		this.data = generateHeight( worldWidth, worldDepth );

		this.camera.position.y = data[ worldHalfWidth + worldHalfDepth * worldWidth ] * 10 + 500;

		this.geometry = new THREE.PlaneBufferGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
		this.geometry.rotateX( -Math.PI / 2 );
		var vertices = this.geometry.attributes.position.array;
		for ( var i = 0, j = 0, l = vertices.length; i < l; i++, j += 3 ) {
			vertices[ j + 1 ] = data[ i ] * 10;
		}
		this.texture = new THREE.CanvasTexture( generateTexture( data, worldWidth, worldDepth ) );
		this.texture.wrapS = THREE.ClampToEdgeWrapping;
		this.texture.wrapT = THREE.ClampToEdgeWrapping;
		this.mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( {
			map: this.texture
		} ) );
		this.scene.add( mesh );
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setClearColor( 0xbfd1e5 );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.container.innerHTML = "";
		this.container.appendChild( renderer.domElement );

		window.addEventListener( 'resize', this.onWindowResize, false );

	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( window.innerWidth, window.innerHeight );

	}

	generateHeight( width, height ) {
		var size = width * height,
			data = new Uint8Array( size ),
			perlin = new ImprovedNoise(),
			quality = 1,
			z = Math.random() * 100;
		for ( var j = 0; j < 4; j++ ) {
			for ( var i = 0; i < size; i++ ) {
				var x = i % width,
					y = ~~( i / width );
				data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );
			}
			quality *= 5;
		}
		return data;
	}

	generateTexture( data, width, height ) {

		var canvas, canvasScaled, context, image, imageData,
			level, diff, vector3, sun, shade;
		vector3 = new THREE.Vector3( 0, 0, 0 );
		sun = new THREE.Vector3( 1, 1, 1 );
		sun.normalize();
		canvas = document.createElement( 'canvas' );
		canvas.width = width;
		canvas.height = height;
		context = canvas.getContext( '2d' );
		context.fillStyle = '#000';
		context.fillRect( 0, 0, width, height );
		image = context.getImageData( 0, 0, canvas.width, canvas.height );
		imageData = image.data;
		for ( var i = 0, j = 0, l = imageData.length; i < l; i += 4, j++ ) {
			vector3.x = data[ j - 2 ] - data[ j + 2 ];
			vector3.y = 2;
			vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
			vector3.normalize();
			shade = vector3.dot( sun );
			imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
			imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
			imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
		}
		context.putImageData( image, 0, 0 );
		// Scaled 4x
		canvasScaled = document.createElement( 'canvas' );
		canvasScaled.width = width * 4;
		canvasScaled.height = height * 4;
		context = canvasScaled.getContext( '2d' );
		context.scale( 4, 4 );
		context.drawImage( canvas, 0, 0 );
		image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
		imageData = image.data;
		for ( var i = 0, l = imageData.length; i < l; i += 4 ) {
			var v = ~~( Math.random() * 5 );
			imageData[ i ] += v;
			imageData[ i + 1 ] += v;
			imageData[ i + 2 ] += v;
		}
		context.putImageData( image, 0, 0 );
		return canvasScaled;
	}

	animate() {
		requestAnimationFrame( this.animate.bind( this ) );
		render();
	}

	render() {
		controls.update( this.clock.getDelta() );
		renderer.render( this.scene, this.camera );
	}

}

};