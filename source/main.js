'use strict';

global.$ = require( 'jquery' );
global._ = require( 'lodash' );
global.THREE = require( 'three' );

var game = new require( './Game' );
game.start();