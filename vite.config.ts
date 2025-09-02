import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	build: {
		outDir: 'build',
		lib: {
			entry: path.resolve(__dirname, 'src/createPolysGame.ts'),
			// add a hash to the file name for cache busting
			fileName: 'polys-[hash]',
			formats: ['es'],
		},
	},
	plugins: [],
});
