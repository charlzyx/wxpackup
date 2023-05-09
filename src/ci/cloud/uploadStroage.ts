import * as ci from 'miniprogram-ci';
import { loadConfig } from '../../config';
import { log } from '../../log';
import { getProject } from '../project';

const config = loadConfig();

export const uploadStorage = async (
  // 类型
  type?: '静态文件' | '云存储',
) => {
  const hint = type === '云存储'
    ? '<Cloud.uploadStorage|上传开云开发存储>'
    : '<Cloud.uploadStaticStorage|上传云开发静态网站>';
  try {
    const project = getProject();
    const cloudConfig = config.cloud as Required<typeof config.cloud>;
    let rsp:
      | Awaited<ReturnType<typeof ci.cloud.uploadStaticStorage>>
      | Awaited<ReturnType<typeof ci.cloud.uploadStorage>>;

    if (type === '静态文件') {
      rsp = await ci.cloud.uploadStaticStorage({
        project,
        env: cloudConfig.env,
        path: cloudConfig.path,
        remotePath: cloudConfig.remotePath,
      });
    } else {
      rsp = await ci.cloud.uploadStorage({
        project,
        env: cloudConfig.env,
        path: cloudConfig.path,
        remotePath: cloudConfig.remotePath,
      });
    }

    log.green(`${hint}成功 ${new Date().toLocaleString()}`, rsp);
  } catch (error: any) {
    log.bgRed(`${hint}失败 ${new Date().toLocaleString()} \n${error.message}`);
    console.log(error);
  }
};
