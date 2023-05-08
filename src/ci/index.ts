import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { CONFIG_FILES } from '../configFiles';
import { pkgNpm } from './packnpm';
import { previewOrUpload } from './previewOrUpload';
import { saveSourceMapTo } from './sourcemap';
import { log } from '../log';

const getPublishInfo = () => {
  return {
    version: CONFIG_FILES.packageJson.read().version,
    desc: '修复了一些已知问题',
  };
};

yargs(hideBin(process.argv))
  .command(
    'preview',
    '<Preivew|预览>',
    (yargs) => {},
    async (argv) => {
      log.cyan('<Preivew|预览>');
      return await previewOrUpload('preview', getPublishInfo());
    },
  )
  .command(
    'upload',
    '<Upload|上传>',
    (yargs) => {},
    async (argv) => {
      log.cyan('<Upload|上传>');
      return await previewOrUpload('upload', getPublishInfo());
    },
  )
  .command(
    'packnpm',
    '<packNpm|构建npm>',
    (yargs) => {},
    async (argv) => {
      log.cyan('<packNpm|构建npm>');
      return await pkgNpm();
    },
  )
  .command(
    'sourcemap [save-file-to]',
    '<sourcemap|下载最近一次 sourcemap>',
    (yargs) => {},
    async (argv) => {
      log.cyan('<sourcemap|下载最近一次 sourcemap>');
      const saveTo: string = argv['save-file-to'] as unknown as string;
      return await saveSourceMapTo(saveTo);
    },
  )
  .parse();
