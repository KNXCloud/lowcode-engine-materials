import path, { join } from 'node:path';
import { existsSync, stat, writeFile } from 'fs-extra';
import { isNil, isString, isFunction, isObject, isArray } from 'lodash';
import type { Options, TargetFormat } from './interface';
import type { RollupOptions } from 'rollup';
import deepmerge from 'deepmerge';

export async function resolveOptions(
  ctx: string,
  defaultOptions: Options,
  { config, ...options }: Record<string, unknown>
) {
  const context = path.resolve(process.cwd(), ctx);

  const configPath = path.resolve(context, isString(config) ? config : 'build.config.js');
  if (existsSync(configPath)) {
    const fileStat = await stat(configPath);
    if (!fileStat.isFile()) {
      throw new Error('配置文件必须是一个文件, path: ' + configPath);
    }
    const configOptions = require(configPath);
    options = deepmerge(configOptions, options);
  }

  const resolvedOptions = Object.assign({}, defaultOptions);

  const resolve = (...dirs: string[]) => path.resolve(context, ...dirs);

  function normalizeProp<K extends keyof Options>(propName: K): void;
  function normalizeProp<K extends keyof Options>(
    propName: K,
    checkProp: () => boolean
  ): void;
  function normalizeProp<K extends keyof Options, T>(
    propName: K,
    checkProp: (val: unknown) => val is T,
    format: (sourceValue: T, originValue: Options[K]) => Options[K]
  ): void;
  function normalizeProp<K extends keyof Options>(propName: K, sourceProp: string): void;
  function normalizeProp<K extends keyof Options>(
    propName: K,
    sourceProp: string,
    checkProp: () => boolean
  ): void;
  function normalizeProp<K extends keyof Options, T>(
    propName: K,
    sourceProp: string,
    checkProp: (val: unknown) => val is T,
    format: (sourceValue: T, originValue: Options[K]) => Options[K]
  ): void;
  function normalizeProp<K extends keyof Options>(propName: K, ...args: unknown[]): void {
    let sourceProp: string = propName;
    let checkProp = (val: unknown) => !isNil(val);
    let format = (val: unknown): Options[K] => val as Options[K];

    const [arg0, arg1, arg2] = args;
    if (isString(arg0)) {
      sourceProp = arg0;
      if (isFunction(arg1)) {
        checkProp = arg1;
      }
      if (isFunction(arg2)) {
        format = arg2;
      }
    } else if (isFunction(arg0)) {
      checkProp = arg0;
      if (isFunction(arg1)) {
        format = arg1;
      }
    }

    const optionValue = options[sourceProp];
    if (isNil(optionValue)) return;
    if (!checkProp(optionValue)) {
      throw new TypeError(
        `${propName} prop type is invalid, expect ${typeof resolvedOptions[
          propName
        ]}, got ${typeof optionValue}`
      );
    }

    resolvedOptions[propName] = format(optionValue);
  }

  normalizeProp('format', isString, (format) => {
    return format.split(',') as TargetFormat[];
  });

  normalizeProp('library');

  if (resolvedOptions.format.includes('umd') && !resolvedOptions.library) {
    throw new Error('library option is required');
  }

  normalizeProp('metaPath', isString, (metaPath) => {
    return resolve(metaPath);
  });

  normalizeProp(
    'externals',
    (val): val is object | unknown[] => isObject(val) || isArray(val),
    (externals, origin = {}) => {
      if (isArray(externals)) {
        externals.filter(isString).forEach((ext) => {
          const [key, val] = ext.split('=');
          if (key && val) {
            origin[key.replace(/^:/, '')] = val;
          }
        });
        return origin;
      } else {
        return Object.assign(origin, externals);
      }
    }
  );

  normalizeProp('outDir', isString, (outDir) => {
    return resolve(outDir);
  });

  return { context, options: resolvedOptions };
}

function slash(str: string) {
  return str && str.replace(/\\/g, '/');
}

export function mergeConfig(
  base: RollupOptions,
  ...args: RollupOptions[]
): RollupOptions {
  return args.reduce((prev, next) => deepmerge(prev, next), base);
}

export async function generateMetaEntry(
  dir: string,
  files: string[],
  globalName?: string
): Promise<string> {
  const imports = files.reduce((res, file, idx) => {
    res[`meta${idx}`] = file;
    return res;
  }, {} as Record<string, string>);

  const importCode = Object.keys(imports)
    .map((name) => `import ${name} from "${slash(imports[name])}"`)
    .join('\n');

  const code = `${importCode}
const components = [${Object.keys(imports).join(',')}];
${
  !globalName
    ? 'export { components }'
    : `window['${globalName}'] = Object.assign({ __esModule: true }, { components })`
}`;

  const metaEntryPath = join(dir, 'meta-entry.js');

  await writeFile(metaEntryPath, code);

  return metaEntryPath;
}

export async function generateViewEntry(dir: string, file: string, globalName?: string) {
  const compEntryPath = join(dir, 'view-entry.js');

  const code = `import * as view from '${slash(file)}'
window['${globalName}'] = Object.assign({ __esModule: true }, view)`;

  await writeFile(compEntryPath, code);
  return compEntryPath;
}
