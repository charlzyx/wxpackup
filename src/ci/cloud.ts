import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import { log } from '../log';
import { uploadContainer } from './cloud/uploadContainer';
import { uploadFunction } from './cloud/uploadFunction';
import { uploadStorage } from './cloud/uploadStroage';

yargs(hideBin(process.argv))
  .command(
    'function',
    '上传云函数',
    (yargs) => {},
    async () => {
      log.cyan('上传云函数');
      return await uploadFunction();
    },
  )
  .command(
    'storage [storage-type]',
    '上传云存储',
    (yargs) => {
      yargs.positional('storage-type', {
        choices: ['static', 'cloud'],
        default: 'cloud',
      });
    },
    async (argv) => {
      const st = argv['storage-type'] as string;
      const hint = st === 'static' ? '静态文件' : '云存储';
      log.cyan(`上传云存储${hint}`);
      return await uploadStorage(hint);
    },
  )
  .command(
    'container',
    '新建云开发云托管版本',
    (yargs) => {},
    async () => {
      log.cyan('新建云开发云托管版本');
      return await uploadContainer();
    },
  )
  .parse();
