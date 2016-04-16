'use strict';

module.exports = class {

	constructor() {

		this.frame = 0;
		this.tasks = [];
		this.addedTasks = [];
		this.removedTasks = [];
		this.running = false;

		this.run = () => {

			var tasks = [].concat( this.tasks );
			var newTasks = [];

			this.running = true;

			_.map( tasks, ( task ) => {

				this.currentTask = task;

				var output = task( this.frame );

				if ( output !== false ) {

					newTasks.push( task );

				}

			} );

			this.running = false;
			this.tasks = newTasks;
			this.frame++;

			_.each( this.addedTasks, this.addTask, this );
			_.each( this.removedTasks, this.removeTask, this );

			this.addedTasks = [];
			this.removedTasks = [];

			requestAnimationFrame( this.run );

		};

	}

	start() {

		requestAnimationFrame( this.run );

	}

	stop() {

		cancelAnimationFrame( this.run );

	}

	addTaskBefore( beforeTask, callback ) {

		if ( !_.isFunction( callback ) ) {

			return console.warn( "Missing callback", callback );

		}

		var index = _.indexOf( beforeTask, callback );

		if ( index === -1 ) {

			this.tasks.push( callback );

		} else {

			this.tasks.splice( index, 0, callback );

		}

	}

	addTask( callback ) {

		if ( !_.isFunction( callback ) ) {

			return console.warn( "Missing callback", callback );

		}

		if ( this.running ) {

			this.addedTasks.push( callback );
			return;

		}

		var index = _.indexOf( this.tasks, callback );
		if ( index !== -1 ) {

			console.warn( "Can't add duplicate task ", callback );
			return;

		}

		this.tasks.push( callback );
		return callback;

	}

	removeTask( callback ) {

		if ( callback === this.currentTask ) {

			this.currentTask = null;

		}

		if ( this.running ) {

			this.removedTasks.push( callback );
			return;

		}

		var index = _.indexOf( this.tasks, callback );

		if ( index !== -1 ) {

			this.tasks.splice( index, 1 );

		}

	}

};