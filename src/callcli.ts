import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { cli } from './cli';

yargs(hideBin(process.argv))
  .command(
    'cli <action>',
    'https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html#%E8%87%AA%E5%8A%A8%E9%A2%84%E8%A7%88',
    (yargs) => {
      yargs.positional('action', {
        type: 'string',
      });
    },
    (argv) => {
      const action = argv.action as Parameters<typeof cli.exec>[0];
      const rest = process.argv.slice(4).join(' ');
      cli.exec(action, rest);
    },
  )
  .parse();
