'use strict';

module.exports = class {

	constructor( taskManager, duration, onStep, onComplete ) {

		this.taskManager = taskManager;
		this.duration = duration;
		this.onStep = onStep;
		this.onComplete = onComplete;
		this.step = this.step.bind( this );

	}

	start( lag ) {

		this.startTime = _.now() - ( lag || 0 );
		this.endTime = this.startTime + this.duration;
		this.taskManager.addTask( this.step );
		this.onStep( 0 );

	}

	step() {

		var currentTime = _.now();
		var interval = ( currentTime - this.startTime ) / this.duration;

		if ( interval >= 1 ) {

			this.taskManager.removeTask( this.step );
			this.onStep( 1 );
			this.onComplete( currentTime - this.endTime );
			return;

		}

		this.onStep( interval );

	}

};