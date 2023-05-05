import { log } from '../../log';
log.green('builtin beforePreview, do nothing');
import { getCutomeScripts, tsx } from '../helper';

const custome = getCutomeScripts().beforePreview;

if (custome) {
  log.bgYellow('运行用户自定义脚本: beforePreview');
  tsx(`${custome}`);
}
