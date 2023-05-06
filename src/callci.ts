import { run } from './ci';

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { CONFIG_FILES } from './configFiles';

const getPublishInfo = () => {
  return {
    version: CONFIG_FILES.packageJson.read().version,
    desc: '修复了一些已知问题',
  };
};

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
      const info = getPublishInfo();
      switch (buildtype) {
        case 'packnpm':
          await run('packnpm', info);
          break;
        case 'preview':
          await run('preview', info);
          break;
        case 'upload':
          await run('upload', info);
          break;

        default:
          console.log(`不支持的构建类型 <${buildtype}>`);
          break;
      }
    },
  )
  .parse();
