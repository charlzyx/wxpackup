import * as ci from 'miniprogram-ci';
import { log } from '../../log';
import { getProject } from '../project';
import { loadConfig } from '../../config';

const config = loadConfig();

export const uploadFunction = async () => {
  const hint = '<Cloud.uploadFunction|上传开发云函数>';
  try {
    const project = getProject();
    const cloudConfig = config.cloud as Required<typeof config.cloud>;

    const rsp = await ci.cloud.uploadFunction({
      project,
      env: cloudConfig.env,
      path: cloudConfig.path,
      name: cloudConfig.name,
      remoteNpmInstall: cloudConfig.remoteNpmInstall,
    });
    log.green(`${hint}成功 ${new Date().toLocaleString()}`, rsp);
  } catch (error: any) {
    log.bgRed(`${hint}失败 ${new Date().toLocaleString()} \n${error.message}`);
    console.log(error);
  }
};
