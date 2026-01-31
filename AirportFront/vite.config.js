import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
	build: {
		outDir: 'build/vite',
		chunkSizeWarningLimit: 1000, // Aumentado para styled-components y react-spring
		rollupOptions: {
			output: {
				assetFileNames: 'assets/[name][extname]',
				chunkFileNames: '[name]-[hash].js',
				entryFileNames: 'main.js',
			},
		},
		commonjsOptions: {
			include: [/styled-components/, /node_modules/],
		},
	},
	optimizeDeps: {
		include: ['styled-components'],
	},
	css: {
		postcss: {
			plugins: [
				{
					postcssPlugin: 'scoped-css',
					Rule(rule) {
						// Prefijar todos los selectores excepto los que ya tienen el prefijo
						// y excepto @keyframes, @media, etc.
						if (rule.selector && !rule.selector.includes('liferay-custom-element-react')) {
							rule.selector = rule.selector
								.split(',')
								.map(sel => `liferay-custom-element-react ${sel.trim()}`)
								.join(', ')
						}
					}
				}
			]
		}
	},
	experimental: {
		renderBuiltUrl(filename) {
			return `/o/liferay-custom-element-react/${filename}`;
		},
	},
	plugins: [react()],
	server: {
		origin: 'http://localhost:5173',
	},
})
