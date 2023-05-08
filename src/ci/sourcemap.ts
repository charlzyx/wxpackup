import * as ci from 'miniprogram-ci';
import { log } from '../log';
import { getProject } from './project';

export const saveSourceMapTo = async (saveTo = './sourcemap.zip') => {
  const hint = '<SourceMap|拉取最近上传版本的SourceMap>';
  try {
    const project = getProject();
    const rsp = await ci.getDevSourceMap({
      project,
      robot: 1,
      sourceMapSavePath: saveTo,
    });
    log.green(`${hint}成功 ${new Date().toLocaleString()}`, rsp);
  } catch (error: any) {
    log.bgRed(`${hint}失败 ${new Date().toLocaleString()} \n${error.message}`);
    console.log(error);
  }
};
