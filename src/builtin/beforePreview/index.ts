import { log } from '../../log';
import { loadConfig } from '../../config';
log.green('builtin beforePreview, do nothing');
import { getCutomeScripts, tsx } from '../helper';

const running = () => {
  loadConfig();
  const custome = getCutomeScripts().beforePreview;
  if (custome) {
    log.bgYellow('运行用户自定义脚本: beforePreview');
    tsx(`${custome}`);
  }
};

running();
