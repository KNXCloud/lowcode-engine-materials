export type CommandAction = 'start' | 'build' | null;

export type TargetFormat = 'esm' | 'cjs' | 'umd';

export interface Options {
  metaPath: string;
  library: string;
  format: TargetFormat[];
  outDir: string;
  externals: Record<string, string>;
}

export interface PackageMeta {
  title?: string;
  package: string;
  version?: string;
  library: string;
  urls: string[];
}
