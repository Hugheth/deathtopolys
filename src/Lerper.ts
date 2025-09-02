import { TaskManager } from './TaskManager';

export class Lerper {
	startTime: number = 0;
	endTime: number = 0;

	constructor(
		public taskManager: TaskManager,
		public duration: number,
		public onStep: (interval: number) => void,
		public onComplete: (overrun: number) => void,
	) {
		this.taskManager = taskManager;
		this.duration = duration;
		this.onStep = onStep;
		this.onComplete = onComplete;
	}

	start(lag?: number): void {
		this.startTime = Date.now() - (lag || 0);
		this.endTime = this.startTime + this.duration;
		this.taskManager.addTask(this.step);
		this.onStep(0);
	}

	step = () => {
		const currentTime = Date.now();
		const interval = (currentTime - this.startTime) / this.duration;
		if (interval >= 1) {
			this.taskManager.removeTask(this.step);
			this.onStep(1);
			this.onComplete(currentTime - this.endTime);
			return;
		}
		this.onStep(interval);
	};
}
