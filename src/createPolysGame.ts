import { World } from './World';

export function create() {
	let world: World | null = null;
	fetch('/assets/polys/stage.html').then(async data => {
		document.getElementById('game-container').innerHTML = await data.text();
		world = new World();
	});
	return {
		close() {
			world?.dispose();
			document.getElementById('game-container').innerHTML = '';
		},
	};
}
