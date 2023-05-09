import { loadConfig } from '../../config';
import { log } from '../../log';
import { byPWD } from '../../utils';
import { getCutomeScripts, tsx } from '../helper';
import { generatorEnv } from './generatorSrcEnv';
import { resolveTsConfigPathsToAlias } from './resolveTsConfigPaths';

const outputs = [byPWD('./src/env.ts')];

// jsut run it
const running = () => {
  loadConfig();
  generatorEnv(outputs);
  resolveTsConfigPathsToAlias();
  const custome = getCutomeScripts().beforeCompile;
  if (custome) {
    log.bgYellow('运行用户自定义脚本: beforeCompile');
    tsx(`${custome}`);
  }
};

running();
