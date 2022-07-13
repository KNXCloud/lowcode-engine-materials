import type { OutputOptions, RollupOptions } from 'rollup';
import type { Command } from 'commander';
import type { CommandAction, Options, TargetFormat } from './interface';

import path from 'node:path';
import { Project } from 'ts-morph';
import { existsSync } from 'node:fs';
import deepMerge from 'deepmerge';
import glob from 'fast-glob';
import { rollup, watch, defineConfig } from 'rollup';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import esbuild from 'rollup-plugin-esbuild';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import vueDefineOptions from 'unplugin-vue-define-options/rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { parse, compileScript } from '@vue/compiler-sfc';

import {
  generateMetaEntry,
  generateViewEntry,
  mergeConfig,
  resolveOptions,
} from './utils';
import { isArray, isNil } from 'lodash';
import { readFile, writeFile } from 'fs-extra';

export class Builder {
  public context = process.cwd();
  public command: CommandAction = null;
  public options: Options = {
    metaPath: path.resolve('lowcode'),
    library: '',
    outDir: this.context,
    format: ['cjs', 'esm', 'umd'],
    externals: {
      vue: 'Vue',
    },
  };

  constructor(public program: Command) {}

  resolve(...dirs: string[]) {
    return path.resolve(this.context, ...dirs);
  }

  getTempDir() {
    return this.resolve('node_modules/.lowcode-builder');
  }

  getDevDistDir() {
    return this.resolve('node_modules/.lowcode-builder-dev');
  }

  async init(context: string, options: Record<string, string>) {
    const res = await resolveOptions(context, this.options, options);
    this.context = res.context;
    Object.assign(this.options, res.options);
  }

  async run(command: CommandAction) {
    this.command = command;
    return command ? this[command]() : void 0;
  }

  private async build() {
    const tasks: (RollupOptions | RollupOptions[])[] = [];

    const project = await this.checkTsSyntax();

    const { format } = this.options;

    if (format.includes('cjs') || format.includes('esm')) {
      tasks.push(await this.getRollupConfig(format));
    }

    if (format.includes('umd')) {
      tasks.push(this.getUmdRollupConfig());
      tasks.push(await this.getMetaRollupConfig());
    }

    if (tasks.length) {
      await Promise.all(
        tasks.flat().map(async ({ output, ...config }) => {
          const bundle = await rollup(config);
          if (!isNil(output)) {
            if (isArray(output)) {
              await Promise.all(output.map((o) => bundle.write(o)));
            } else {
              await bundle.write(output);
            }
          }
        })
      );
    }

    if (format.includes('cjs')) {
      await this.emitDtsFiles(project, this.resolve('lib'));
    }
    if (format.includes('esm')) {
      await this.emitDtsFiles(project, this.resolve('es'));
    }
  }

  private async start() {
    const { library, metaPath, externals } = this.options;

    const tempDir = this.getTempDir();

    const metaFiles = await glob('**/meta.{js,jsx,ts,tsx}', {
      cwd: metaPath,
      absolute: true,
      onlyFiles: true,
      ignore: ['node_modules'],
    });

    const distDir = this.getDevDistDir();

    const iife = require('rollup-plugin-iife');
    const dev = require('rollup-plugin-dev');

    const config = mergeConfig(
      getBaseRollupConfig(false),
      defineConfig({
        input: {
          index: await generateViewEntry(tempDir, this.resolve('src/index.ts'), library),
          meta: await generateMetaEntry(tempDir, metaFiles, `${library}Meta`),
        },
        plugins: [dev(distDir), iife({ sourcemap: true })],
        external: Object.keys(externals).map((e) => new RegExp(`^${e}`)),
        treeshake: true,
        output: {
          dir: distDir,
          globals: externals,
          format: 'esm',
        },
      })
    );

    const watcher = watch(config);

    watcher.on('close', () => {
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await watcher.close();
      process.exit(0);
    });
  }

  private async emitDtsFiles(project: Project, outDir: string) {
    const files = project.emitToMemory({
      emitOnlyDtsFiles: true,
    });

    const srcDir = this.resolve('src');

    await Promise.all(
      files.getFiles().map(async ({ filePath, text }) => {
        if (filePath.startsWith(srcDir)) {
          const relPath = path.relative(srcDir, filePath);
          const distPath = path.join(outDir, relPath);
          await writeFile(distPath, text);
        }
      })
    );
  }

  private async checkTsSyntax(): Promise<Project> {
    const srcDir = this.resolve('src');

    const project = new Project({
      compilerOptions: {
        baseUrl: srcDir,
        declaration: true,
        preserveSymlinks: true,
        skipLibCheck: true,
        noImplicitAny: false,
      },
      tsConfigFilePath: this.resolve('tsconfig.json'),
      skipAddingFilesFromTsConfig: true,
    });

    const filePaths = await glob(['**/*.{ts,tsx,vue}', '!**/demos'], {
      cwd: srcDir,
      absolute: true,
      onlyFiles: true,
      ignore: ['node_modules'],
    });

    await Promise.all(
      filePaths.map(async (file) => {
        if (file.endsWith('.vue')) {
          const sfc = parse(await readFile(file, 'utf-8'));
          const { script, scriptSetup } = sfc.descriptor;
          if (script || scriptSetup) {
            let isTS = false;
            let isTSX = false;
            if (script) {
              if (script.lang === 'ts') isTS = true;
              if (script.lang === 'tsx') isTSX = true;
            } else if (scriptSetup) {
              if (scriptSetup.lang === 'ts') isTS = true;
              if (scriptSetup.lang === 'tsx') isTSX = true;
            }
            const compiled = compileScript(sfc.descriptor, {
              id: 'xxx',
              inlineTemplate: true,
            });
            project.createSourceFile(
              file + (isTS ? '.ts' : isTSX ? '.tsx' : '.js'),
              compiled.content
            );
          }
        } else {
          project.addSourceFileAtPath(file);
        }
      })
    );

    const diagnostics = project.getPreEmitDiagnostics();
    if (diagnostics.length > 0) {
      console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));
      throw new Error('check ts syntax failed');
    }

    return project;
  }

  private async getMetaRollupConfig() {
    const { metaPath, library, outDir } = this.options;

    const metaFiles = await glob('**/meta.{js,jsx,ts,tsx}', {
      cwd: metaPath,
      absolute: true,
      onlyFiles: true,
      ignore: ['node_modules'],
    });

    const baseUmdOptions = defineConfig({
      input: await generateMetaEntry(this.getTempDir(), metaFiles),
      plugins: [terser()],
      output: {
        file: path.join(outDir, `dist/meta.js`),
        name: `${library}Meta`,
        format: 'umd',
      },
    });
    return mergeConfig(getBaseRollupConfig(true), baseUmdOptions);
  }

  private getUmdRollupConfig() {
    const { outDir, library, externals: externals } = this.options;
    const baseUmdOptions = defineConfig({
      input: this.resolve('src/index.ts'),
      external: Object.keys(externals).map((e) => new RegExp(`^${e}`)),
      output: {
        name: library,
        format: 'umd',
        globals: externals,
      },
    });
    return [
      mergeConfig(
        getBaseRollupConfig(false),
        baseUmdOptions,
        defineConfig({
          output: {
            file: path.join(outDir, `dist/index.js`),
          },
        })
      ),
      mergeConfig(
        getBaseRollupConfig(true),
        baseUmdOptions,
        defineConfig({
          plugins: [terser()],
          output: {
            file: path.join(outDir, `dist/index.prod.js`),
          },
        })
      ),
    ];
  }

  private async getRollupConfig(format: TargetFormat[]) {
    const pkgPath = this.resolve('package.json');
    if (!existsSync(pkgPath)) {
      throw new Error('package.json not fount at ' + pkgPath);
    }

    const pkg = require(pkgPath);
    const { dependencies = {}, peerDependencies = {} } = pkg;

    const externals = Object.keys(dependencies)
      .concat(Object.keys(peerDependencies))
      .map((key) => new RegExp(`^${key}`));

    const inputFiles = await glob('./src/**/*.{ts,tsx,js,jsx.vue}', {
      cwd: this.context,
      onlyFiles: true,
      absolute: true,
    });

    const config = deepMerge(
      getBaseRollupConfig(true),
      defineConfig({
        input: inputFiles,
        external: externals,
      })
    );
    const output: OutputOptions[] = (config.output = []);
    if (format.includes('cjs')) {
      const distDir = this.resolve('lib');
      output.push({
        dir: distDir,
        format: 'cjs',
        exports: 'named',
        entryFileNames: '[name].js',
        preserveModules: true,
        preserveModulesRoot: distDir,
      });
    }
    if (format.includes('esm')) {
      const distDir = this.resolve('es');
      output.push({
        dir: distDir,
        format: 'esm',
        entryFileNames: '[name].mjs',
        preserveModules: true,
        preserveModulesRoot: distDir,
      });
    }
    return config;
  }
}

export function getBaseRollupConfig(isProd: boolean) {
  const extensions = ['.mjs', '.js', '.json', '.ts'];
  return defineConfig({
    plugins: [
      vueDefineOptions(),
      vue({ isProduction: isProd }),
      vueJsx(),
      nodeResolve({ extensions }),
      commonjs(),
      esbuild({
        sourceMap: true,
        target: 'es2018',
        loaders: {
          '.vue': 'ts',
        },
      }),
      babel({
        extensions,
        babelHelpers: 'bundled',
      }),
      replace({
        values: {
          __VUE_OPTIONS_API__: JSON.stringify(true),
          __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
          'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
        },
        preventAssignment: true,
      }),
    ],
  });
}
