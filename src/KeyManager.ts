import { World } from './World';

type KeyData = {
	onPressing: () => void;
	onPress?: () => void;
	onRelease?: () => void;
};

export class KeyManager {
	keys = new Map<string, boolean>();
	keyTasks = new Map<string, KeyData>();
	constructor(public world: World) {
		window.addEventListener('keydown', this.addTask);
		window.addEventListener('keyup', this.removeTask);
		window.addEventListener('blur', this.blur);
	}

	addTask = (e: { key: string }) => {
		const key = e.key;
		const keyDown = this.keys.get(key),
			keyData = this.keyTasks.get(key);

		if (keyData && keyData.onPress) {
			keyData.onPress();
		}

		if (!keyDown && keyData) {
			this.world.taskManager.addTask(keyData.onPressing);
		}
		this.keys.set(key, true);
	};

	removeTask = (e: { key: string }) => {
		const key = e.key;
		var keyDown = this.keys.get(key),
			keyData = this.keyTasks.get(key);

		if (keyData && keyData.onRelease) {
			keyData.onRelease();
		}

		if (keyDown && keyData) {
			this.world.taskManager.removeTask(keyData.onPressing);
		}
		this.keys.set(key, false);
	};

	blur = () => {
		for (const [key, keyDown] of this.keys) {
			if (keyDown) {
				this.removeTask({ key });
			}
		}
		this.keys.clear();
	};

	addKeyBinding(
		input: string | string[],
		onPressing: () => void,
		onPress?: () => void,
		onRelease?: () => void,
	) {
		const keys = Array.isArray(input) ? input : [input];
		for (const key of keys) {
			this.keyTasks.set(key, {
				onPressing: onPressing,
				onPress: onPress,
				onRelease: onRelease,
			});
		}
	}

	destroy() {
		window.removeEventListener('keydown', this.addTask);
		window.removeEventListener('keyup', this.removeTask);
		window.removeEventListener('blur', this.blur);
	}
}
