import { run } from './ci';

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
  .command(
    'build <buildtype>',
    '运行小程序构建 ci, 目前支持 packnpm | preview | upload',
    (yargs) => {
      yargs.positional('buildtype', {
        choices: ['packnpm', 'preview', 'upload'],
      });
    },
    async (argv) => {
      const buildtype = argv.buildtype;
      switch (buildtype) {
        case 'packnpm':
          await run('packnpm');
          break;
        case 'preview':
          await run('preview');
          break;
        case 'upload':
          await run('upload');
          break;

        default:
          console.log(`不支持的构建类型 <${buildtype}>`);
          break;
      }
    },
  )
  .parse();
