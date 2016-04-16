var _ = require( 'lodash' );
var gulp = require( 'gulp' );
var config = require('./config');

var createWebpackCompiler = ( debug ) => {

	var app = [ "./source/main.js" ];

	if ( debug ) {

		config.expandedJs.unshift( "webpack-dev-server/client?http://localhost:" + config.testPort + "/", "webpack/hot/dev-server" );

	}

	config.compiler = webpack( {

		entry: {

			app: config.expandedJs

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

	createWebpackCompiler( true ).then( compiler => {

		var server = new WebpackDevServer( compiler, {

			contentBase: path.resolve( __dirname, 'bin/client/' ),
			publicPath: 'http://localhost:8088/',
			hot: true

		} );
		server.listen( 8088 );
		done();

	} ).catch( err => {

		console.warn( err );

	} );

} );

gulp.task('pack', done => {

  createWebpackCompiler().then( compiler => {

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

});
