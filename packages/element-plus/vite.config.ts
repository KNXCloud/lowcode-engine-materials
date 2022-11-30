import { defineConfig } from 'vite';
import Vue from '@vitejs/plugin-vue';
import VueJsx from '@vitejs/plugin-vue-jsx';
import LibTypes from 'vite-plugin-lib-types';

import pkg from './package.json';

export default defineConfig({
  plugins: [Vue(), VueJsx(), LibTypes()],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
    },
    emptyOutDir: false,
    rollupOptions: {
      external: Object.keys(pkg.dependencies).concat(Object.keys(pkg.peerDependencies)),
    },
  },
});
