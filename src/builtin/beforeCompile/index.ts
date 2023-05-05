import { byPWD } from '../../utils';
import { generatorEnv } from './generatorSrcEnv';
import { resolveTsConfigPathsToAlias } from './resolveTsConfigPaths';
import { getCutomeScripts, tsx } from '../helper';
import { log } from '../../log';

const outputs = [byPWD('./src/env.ts')];

// jsut run it
const running = () => {
  generatorEnv(outputs);
  resolveTsConfigPathsToAlias();
  const custome = getCutomeScripts().beforeCompile;
  if (custome) {
    log.bgYellow('运行用户自定义脚本: beforeCompile');
    tsx(`${custome}`);
  }
};

running();
