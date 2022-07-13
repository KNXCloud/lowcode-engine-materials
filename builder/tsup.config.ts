import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src/cli.ts', './src/index.ts'],
  outDir: 'lib',
  format: ['cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: true,
});
