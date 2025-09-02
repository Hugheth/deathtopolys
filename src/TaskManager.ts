export class TaskManager {
	frame: number = 0;
	tasks: ((frame: number, delta: number) => any)[] = [];
	addedTasks: ((frame: number, delta: number) => any)[] = [];
	removedTasks: ((frame: number, delta: number) => any)[] = [];
	running: boolean = false;
	lastTime: number;
	currentTime: number;
	currentTask: ((frame: number, delta: number) => any) | null = null;
	animationFrameId: number | null = null;

	run = (): void => {
		const tasks = [...this.tasks];
		const newTasks: ((frame: number, delta: number) => any)[] = [];

		this.currentTime = Date.now();
		const delta = this.currentTime - this.lastTime;

		this.running = true;

		tasks.forEach(task => {
			this.currentTask = task;

			const output = task(this.frame, delta);

			if (output !== false) {
				newTasks.push(task);
			}
		});

		this.running = false;
		this.tasks = newTasks;
		this.frame++;

		this.addedTasks.forEach(this.addTask, this);
		this.removedTasks.forEach(this.removeTask, this);

		this.addedTasks = [];
		this.removedTasks = [];
		this.lastTime = this.currentTime;

		this.animationFrameId = requestAnimationFrame(this.run);
	};

	start(): void {
		this.lastTime = Date.now();
		this.animationFrameId = requestAnimationFrame(this.run);
	}

	stop(): void {
		if (this.animationFrameId !== null) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
	}

	addTaskBefore(
		beforeTask: ((frame: number, delta: number) => any)[],
		callback: (frame: number, delta: number) => any,
	): void {
		if (typeof callback !== 'function') {
			console.warn('Missing callback', callback);
			return;
		}

		const index = beforeTask.indexOf(callback);

		if (index === -1) {
			this.tasks.push(callback);
		} else {
			this.tasks.splice(index, 0, callback);
		}
	}

	addTask(
		callback: (frame: number, delta: number) => any,
	): (frame: number, delta: number) => any | void {
		if (typeof callback !== 'function') {
			console.warn('Missing callback', callback);
			return;
		}

		if (this.running) {
			this.addedTasks.push(callback);
			return;
		}

		const index = this.tasks.indexOf(callback);
		if (index !== -1) {
			console.warn("Can't add duplicate task ", callback);
			return;
		}

		this.tasks.push(callback);
		return callback;
	}

	removeTask(callback: (frame: number, delta: number) => any): void {
		if (callback === this.currentTask) {
			this.currentTask = null;
		}

		if (this.running) {
			this.removedTasks.push(callback);
			return;
		}

		const index = this.tasks.indexOf(callback);

		if (index !== -1) {
			this.tasks.splice(index, 1);
		}
	}
}
