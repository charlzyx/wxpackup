import fs from 'fs';
import { loadConfig } from './config';
import { log } from './log';
import { byPWD } from './utils';

/**
  * 解析 dot env 文件
   parseDotENV(`
     NODE_ENV=production
     PREVIEW="somevalue"
     TEST='othervalue'
     HOME=$HOME
     HOME2=$HOME
     HOME3=\${HOME}
  `),
  * @param content string
  * @returns Record<string, string>
  */
const dotENVToKvs = (content: string) => {
  const kvs = content.split('\n').reduce((map, item) => {
    // 忽略注释与空行
    if (/^\s*#/.test(item) || item.trim() === '') {
      return map;
    }
    // 根据等号解析
    let [k, v] = item.split('=');
    // 处理后缀注释
    if (/#/.test(v)) {
      v = v.split('#')[0];
    }
    // 处理空格
    k = k.trim();

    // 格式化变量
    v = v.trim().replace(/(^"|"$)/g, '').replace(/(^'|'$)/g, '');

    // 处理环境变量
    if (/^\$/.test(v)) {
      const envKey = v.replace(/^\$/, '').replace(/(^{|}$)/g, '');
      v = process.env[envKey] || map[envKey];
    }
    map[k] = v;
    return map;
  }, {} as Record<string, string>);
  return kvs;
};

export const loadDotEnv = (env?: string) => {
  if (!fs.existsSync(byPWD('./.env'))) {
    log.bgYellow('未找到 .env 文件夹', byPWD('./.env'));
    return {};
  }
  const loadEnvFiles = fs.readdirSync(byPWD('./.env')).filter((item) => {
    const [_, __, envSuffix] = item.split('.');
    if (env !== undefined) {
      const envStr = Array.isArray(env) ? env.filter(Boolean)[0] : env;
      return !envSuffix || envSuffix.toUpperCase() === envStr?.toUpperCase();
    } else {
      const config = loadConfig();
      return (
        !envSuffix || envSuffix.toUpperCase() === config.mode?.toUpperCase()
      );
    }
  });

  loadEnvFiles.sort((a, b) => a.length - b.length);

  const envs = loadEnvFiles.reduce((map, item) => {
    const content = fs.readFileSync(byPWD('./.env', item), 'utf-8').toString();

    const kvs = dotENVToKvs(content);
    return {
      ...map,
      ...kvs,
    };
  }, {} as Record<string, string>);

  return envs;
};
