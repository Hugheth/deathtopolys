'use strict';

global.$ = require( 'jquery' );
global._ = require( 'lodash' );
global.THREE = require( 'three' );

var World = require( './World' );

$( function() {

	window.world = new World();

} );