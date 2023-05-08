import * as ci from 'miniprogram-ci';
import { log } from '../../log';
import { getProject } from '../project';
import { loadConfig } from '../../config';

const config = loadConfig();

export const uploadContainer = async () => {
  const hint = '<Cloud.uploadContainer|新建云开发云托管版本 >';
  try {
    const project = getProject();
    const cloudConfig = config.cloud as Required<typeof config.cloud>;
    const rsp = await ci.cloud.uploadStorage({
      project,
      env: cloudConfig.env,
      path: cloudConfig.path,
      remotePath: cloudConfig.remotePath,
    });

    log.green(`${hint}成功 ${new Date().toLocaleString()}`, rsp);
  } catch (error: any) {
    log.bgRed(`${hint}失败 ${new Date().toLocaleString()} \n${error.message}`);
    console.log(error);
  }
};
