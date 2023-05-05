import { log } from '../../log';
log.green('builtin beforeUpload, do nothing');
import { getCutomeScripts, tsx } from '../helper';

const custome = getCutomeScripts().beforeUpload;

if (custome) {
  log.bgYellow('运行用户自定义脚本: beforeUpload');
  tsx(`${custome}`);
}
