export type CommandAction = 'start' | 'build' | null;

export type TargetFormat = 'esm' | 'cjs' | 'umd';

export interface Options {
  library: string;
  format: TargetFormat[];
  outDir: string;
  externals: Record<string, string>;
  lowcode: LowCodeConfig;
}

export interface LowCodeConfig {
  metaDir: string;
  baseUrl: string | Record<string, string>;
  groups: string[];
  npmInfo: Record<string, unknown>;
  categories: string[];
  builtinAssets: BuiltinAssets;
}

export interface BuiltinAssets {
  packages: unknown[];
  components: unknown[];
}
