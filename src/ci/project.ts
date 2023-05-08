import * as ci from 'miniprogram-ci';
import fs from 'fs';
import path from 'path';
import { loadConfig } from '../config';
import { byPWD, ifNotFoundThrowError } from '../utils';
import { CONFIG_FILES } from '../configFiles';

const config = loadConfig();

export const getProject = () => {
  let privateKeyPath = byPWD(config.privateKeyPath);
  const appId = CONFIG_FILES.projectConfig.read().appid;

  const isDir = fs.statSync(privateKeyPath).isDirectory();
  if (isDir) {
    const hint = 'private.${appid}.key';
    privateKeyPath = path.join(privateKeyPath, hint).replace('${appid}', appId);
  }

  ifNotFoundThrowError(
    privateKeyPath,
    `秘钥文件未找到, 请确认文件是否存在, 并检查一下配置项
 - .env/.env.xxx 中 APP_ID 字段
 - project.config.json 中 appid 字段`,
  );

  const conf = {
    appid: appId,
    projectPath: config.projectPath,
    type: config.type,
    ignores: config.ignores,
    privateKeyPath: privateKeyPath,
  };

  return new ci.Project(conf);
};
