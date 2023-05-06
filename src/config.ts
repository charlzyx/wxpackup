import fs from 'fs';
import path from 'path';
import { CONFIG_FILES } from './configFiles';
import { loadDotEnv } from './loadDotEnv';
import { log } from './log';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { byPWD, caseSwitch } from './utils';

/**
 * 配置优先级
 * 1. PROCESS: process.env
 * 2. PROCESS: process.argv
 * 3. PROCESS: .env/.env.*
 * 4. RC: wxpackup.config.js
 */
type WxPackupConfigByProcess = {
  debug?: boolean;
  env?: string;
  appId?: string;
  privateKeyPath?: string;
  wxDevToolsPath?: string;
};

type WxPackupConfigByRc = {
  privateKeyPath?: string;
  wxDevToolsPath?: string;
  ignores?: string[];
  compileOptions?: {
    es6?: boolean;
    es7?: boolean;
    minify?: boolean;
    autoPrefixWXSS?: boolean;
    minifyWXML?: boolean;
    minifyWXSS?: boolean;
    minifyJS?: boolean;
    codeProtect?: boolean;
    uploadWithSourceMap?: boolean;
  };
  packNpm?: {
    manually: boolean;
    ignores: string[];
    packageJsonPath?: string;
    miniprogramNpmDistDir?: string;
  };
};

type WxPackupConfigReadOnly = {
  projectPath: string;
  type: 'miniProgram';
};

const envConfKeyList = ['debug', 'appId', 'privateKeyPath', 'wxDevToolsPath'];
const allowEnvConfigKeyList = [
  ...envConfKeyList,
  ...envConfKeyList.map((k) => caseSwitch(k).snake()),
  ...envConfKeyList.map((k) => caseSwitch(k).snake().toUpperCase()),
];

const isAllowedConfKeyInDotEnv = (key: string) => {
  return allowEnvConfigKeyList.includes(key);
};

export type WxPackupAllConfig = WxPackupConfigByProcess &
  WxPackupConfigByRc &
  WxPackupConfigReadOnly;

export type WxPackupConfig = WxPackupConfigByRc;

const defaultConfig: WxPackupConfigByRc & WxPackupConfigReadOnly = {
  type: 'miniProgram',
  projectPath: process.cwd(),
  privateKeyPath: '.keystore',
  compileOptions: {
    minify: true,
    autoPrefixWXSS: true,
    es6: true,
    es7: true,
  },
  ignores: ['node_modules/**/*'],
};

export const writeDefaultConfigFile = (to: string) => {
  fs.writeFileSync(
    to,
    `
/** @type import('wxpackup').WxPackupConfig */
module.exports = {
  privateKeyPath: '.keystore',
  ignores: ['node_modules/**/*'],
}
  `,
    { encoding: 'utf-8' },
  );
};

/** process.env 环境变量 */
const processEnvConfig = () => {
  const envs = allowEnvConfigKeyList.reduce((map, key) => {
    const mk = caseSwitch(key).camel();
    // 只有值存在的时候才赋值
    if (process.env[key]) {
      map[mk] = process.env[key];
    }

    return map;
  }, {} as Record<string, string>);

  return envs;
};

/** 命令行参数 */
const argvConfig = (): WxPackupConfigByProcess => {
  const argv = yargs(hideBin(process.argv)).options({
    debug: {
      type: 'boolean',
    },
    env: {
      type: 'string',
    },
    'app-id': {
      type: 'string',
    },
    'project-path': {
      type: 'string',
    },
    'provite-key-path': {
      type: 'string',
    },
  }).argv;

  const args = Object.keys(argv).reduce((map, key) => {
    /** skip buildin  */
    if (/(_|\$0)/.test(key)) return map;
    const mK = caseSwitch(key).camel();
    map[mK] = argv[key];
    return map;
  }, {} as Record<string, string>);

  return args;
};

/** dotEnv 环境变量 */
const dotEnvConfig = (rankEnv: string) => {
  const dotenvs = loadDotEnv(rankEnv || '__default__');

  const envs = Object.keys(dotenvs).reduce((map, key) => {
    // 注入 process.env, 但不能覆盖已有变量
    process.env[key] = process.env[key] || dotenvs[key];

    if (isAllowedConfKeyInDotEnv(key)) {
      const mk = caseSwitch(key).camel();
      // 只有值存在的时候才赋值
      if (dotenvs[key]) {
        map[mk] = dotenvs[key];
      }
    }

    return map;
  }, {} as Record<string, string>);

  return envs;
};

/**
 * 配置文件
 */
const rcConfig = () => {
  const rcFile = byPWD('wxpackup.config.js');
  const rc = fs.existsSync(rcFile) ? require(rcFile) : {};
  return rc;
};

const memo = {
  loaded: null as unknown as Required<WxPackupAllConfig>,
};

const postLoadConfig = (conf: Required<WxPackupAllConfig>) => {
  const projectConfig = CONFIG_FILES.projectConfig.read();
  if (projectConfig.appid !== conf.appId) {
    CONFIG_FILES.projectConfig.rewrite(
      JSON.stringify(
        {
          ...projectConfig,
          appid: conf.appId,
        },
        null,
        2,
      ),
    );
  }
};

const logConfigRank = (
  result: Record<string, any>,
  rank: {
    data: Record<string, any>;
    name: string;
    rank: number;
  }[],
) => {
  // 在 wxpackup cli xxx 命令调用的时候, 不打印配置
  const notShowAtCli = /cli/.test(process.argv[2]);
  if (notShowAtCli) return;
  rank.sort((a, b) => a.rank - b.rank);

  log.blue('------------ 最终配置: [生效配置]√ ------------');

  Object.keys(result).forEach((key) => {
    const keyRank = rank.reduce((list, conf) => {
      if (JSON.stringify(conf.data[key]) === JSON.stringify(result[key])) {
        list.push(conf.name);
      }
      return list;
    }, [] as string[]);
    keyRank.reverse();
    keyRank[0] = `[${keyRank[0]}]√`;
    const str = keyRank.join(' > ');

    log.blue(`${key} = ${JSON.stringify(result[key], null, 2)} # ${str}`);
  });
  log.blue('--------------------------------------------');
};

export const loadConfig = () => {
  if (memo.loaded) {
    return memo.loaded;
  }
  const processConf = processEnvConfig();
  const argvConf = argvConfig();
  const rankEnv: string = processConf.env || argvConf.env;
  const dotConf = dotEnvConfig(rankEnv);
  const rcConf = rcConfig();

  const config: Required<WxPackupAllConfig> = {
    ...defaultConfig,
    ...rcConf,
    ...dotConf,
    ...argvConf,
    ...processConf,
  };

  logConfigRank(config, [
    { data: defaultConfig, rank: -99, name: '默认配置' },
    { data: rcConf, rank: -4, name: '配置文件' },
    {
      data: dotConf,
      rank: -3,
      name: `.env/.env${rankEnv ? `,.env.${rankEnv.toLowerCase()}` : ''}`,
    },
    { data: argvConf, rank: -2, name: '命令行参数' },
    { data: processConf, rank: -1, name: '环境变量' },
  ]);

  memo.loaded = config;

  process.chdir(
    path.isAbsolute(config.projectPath)
      ? config.projectPath
      : path.join(process.cwd(), config.projectPath),
  );

  // log.green(JSON.stringify(config, null, 2));
  postLoadConfig(config);
  return config;
};
