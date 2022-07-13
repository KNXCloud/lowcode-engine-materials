import { program, Command } from 'commander';
import pkg from '../package.json';
import { Builder } from './builder';

program.version(`${pkg.main} v${pkg.version}`);

const builder = new Builder(program);

applyCommonOption(program.command('start [context]'))
  .option('-p, --port <port>', 'default: 3333, 指定监听的端口')
  .option('-h, --host <host>', 'default: 127.0.0.1, 指定监听的IP')
  .action(async (ctx = '.', options) => {
    await builder.init(ctx, options);
    await builder.run('start');
  });

applyCommonOption(program.command('build [context]'))
  .option('-o, --outDir <dir>', 'default: <cwd>, 指定输出目录')
  .action(async (ctx = '.', options) => {
    await builder.init(ctx, options);
    await builder.run('build');
  });

function applyCommonOption(command: Command): Command {
  return command
    .option('-c, --config <path>', '指定配置文件, default: <cwd>/build.config.{js,json}')
    .option('-m, --metaPath <metaPath>', '指定 meta 存放目录, default: <cwd>/lowcode')
    .option('-l, --library <library>', 'umd 格式的 global Name')
    .option('-e, --externals <externals...>', '指定外部依赖');
}

program.parse(process.argv);
