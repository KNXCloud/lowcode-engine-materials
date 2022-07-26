import path, { join } from 'node:path';
import { existsSync, stat, writeFile, mkdir } from 'fs-extra';
import glob from 'fast-glob';
import { isNil, isString, isFunction, isObject, isArray } from 'lodash';
import type { LowCodeConfig, Options, TargetFormat } from './interface';
import type { RollupOptions } from 'rollup';
import deepmerge from 'deepmerge';

export async function resolveOptions(
  ctx: string,
  defaultOptions: Options,
  { config, ...options }: Record<string, unknown>
) {
  const context = path.resolve(process.cwd(), ctx);
  const resolve = (...dirs: string[]) => path.resolve(context, ...dirs);

  let configPath: string;

  if (config) {
    configPath = resolve(isString(config) ? config : 'build.config.js');
  } else {
    const configPaths = await glob(
      ['build.config.{js,cjs,json}', 'build.{js,cjs,json}'],
      {
        cwd: slash(context),
        onlyFiles: true,
        absolute: true,
        ignore: ['node_modules'],
      }
    );
    configPath = configPaths[0];
  }

  if (configPath && existsSync(configPath)) {
    const fileStat = await stat(configPath);
    if (!fileStat.isFile()) {
      throw new Error('配置文件必须是一个文件, path: ' + configPath);
    }
    const configOptions = require(configPath);
    options = deepmerge(configOptions, options);
  }

  const resolvedOptions = Object.assign({}, defaultOptions);

  const pkgPath = path.resolve('package.json');
  if (!existsSync(pkgPath)) {
    throw new Error('package.json not found at ' + pkgPath);
  }
  const pkg = require(pkgPath);
  const originNpmInfo = resolvedOptions.lowcode.npmInfo;
  resolvedOptions.lowcode.npmInfo = deepmerge(originNpmInfo, {
    package: pkg.name,
    version: pkg.version,
  });

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

  normalizeProp(
    'lowcode',
    (val): val is Record<string, unknown> => isObject(val),
    (lowcode, origin) => {
      const merged = { ...origin };
      const { metaDir, baseUrl, groups, npmInfo, categories, builtinAssets } = lowcode;
      if (isString(metaDir)) {
        merged.metaDir = resolve(metaDir);
      }
      if (isString(baseUrl)) {
        merged.baseUrl = baseUrl;
      } else if (isObject(baseUrl)) {
        merged.baseUrl = baseUrl as Record<string, string>;
      }
      if (isArray(groups)) {
        merged.groups = groups;
      }
      if (isArray(categories)) {
        merged.categories = categories;
      }
      if (isObject(npmInfo)) {
        merged.npmInfo = Object.assign({}, merged.npmInfo, npmInfo);
      }
      if (isObject(builtinAssets)) {
        merged.builtinAssets = deepmerge(merged.builtinAssets, builtinAssets);
      }
      return merged;
    }
  );

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

export function slash(str: string) {
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
  npmInfo: Record<string, unknown>,
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
const npmInfo = ${JSON.stringify(npmInfo)};
const components = [${Object.keys(imports).join(',')}];
components.forEach((item) => {
  if (!item.npm) {
    item.npm = {
      ...npmInfo,
      componentName: item.componentName,
    }
  } else {
    item.npm = {
      ...npmInfo,
      ...item.npm,
    }
  }
})
${
  !globalName
    ? 'export { components }'
    : `window['${globalName}'] = Object.assign({ __esModule: true }, { components })`
}`;

  const metaEntryPath = join(dir, 'meta-entry.js');

  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  await writeFile(metaEntryPath, code);

  return metaEntryPath;
}

export async function generateViewEntry(dir: string, file: string, globalName?: string) {
  const compEntryPath = join(dir, 'view-entry.js');

  const code = `import * as view from '${slash(file)}'
window['${globalName}'] = Object.assign({ __esModule: true }, view)`;

  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  await writeFile(compEntryPath, code);
  return compEntryPath;
}

export async function generateAssetCode(config: LowCodeConfig) {
  const assets: Record<string, unknown> = {};
  Object.assign(assets, config.builtinAssets);

  let components = assets.components as unknown[];
  if (!isArray(components)) {
    components = assets.components = [];
  }
  components.push({
    exportName: 'KnxMduiMeta',
    npm: {
      package: '@knx/mdui',
      version: '1.0.0',
    },
    url: 'http://localhost:3333/meta.js',
  });
}
