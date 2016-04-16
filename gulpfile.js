var _ = require( 'lodash' );
var gulp = require( 'gulp' );
var config = require( './config' );
var webpack = require( 'webpack' );
var WebpackDevServer = require( 'webpack-dev-server' );
var path = require( 'path' );

var createWebpackCompiler = ( debug ) => {

	var app = [ "./source/main.js" ];

	if ( debug ) {

		app.unshift( "webpack-dev-server/client?http://localhost:" + config.testPort + "/", "webpack/hot/dev-server" );

	}

	config.compiler = webpack( {

		entry: {

			app: app

		},

		devtool: 'source-map',
		output: {
			filename: 'bundle.js',
			path: path.resolve( __dirname, 'source/' ),
			publicPath: "http://localhost:" + config.testPort + "/"
		},

		plugins: debug ? [ new webpack.HotModuleReplacementPlugin() ] : []

	} );

	return config.compiler;

};

gulp.task( 'default', ( done ) => {

	var compiler = createWebpackCompiler( true );

	var server = new WebpackDevServer( compiler, {

		contentBase: path.resolve( __dirname, 'source/' ),
		publicPath: "http://localhost:" + config.testPort + "/",
		hot: true

	} );
	server.listen( config.testPort );
	done();


} );

gulp.task( 'pack', done => {

	var compiler = createWebpackCompiler();

	compiler.run( function( err, stats ) {

		if ( err ) {
			throw err;
		}

		var jsonStats = stats.toJson();

		_.each( jsonStats.errors, console.error.bind( console ) );
		_.each( jsonStats.warnings, console.warn.bind( console ) );

		done();

	} );

} );