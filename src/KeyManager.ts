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
		const container = document.getElementById('polys-container');
		container.addEventListener('keydown', e => {
			this.addTask(e.key);
		});
		container.addEventListener('keyup', e => {
			this.removeTask(e.key);
		});
		container.addEventListener('blur', () => {
			for (const [key, keyDown] of this.keys) {
				if (keyDown) {
					this.removeTask(key);
				}
			}
			this.keys.clear();
		});
	}

	addTask(key: string) {
		const keyDown = this.keys.get(key),
			keyData = this.keyTasks.get(key);

		if (keyData && keyData.onPress) {
			keyData.onPress();
		}

		if (!keyDown && keyData) {
			this.world.taskManager.addTask(keyData.onPressing);
		}
		this.keys.set(key, true);
	}

	removeTask(key: string) {
		var keyDown = this.keys.get(key),
			keyData = this.keyTasks.get(key);

		if (keyData && keyData.onRelease) {
			keyData.onRelease();
		}

		if (keyDown && keyData) {
			this.world.taskManager.removeTask(keyData.onPressing);
		}
		this.keys.set(key, false);
	}

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
}
