import fs from 'fs';
import path from 'path';
import { CONFIGS } from './configFiles';
import { loadDotEnv } from './loadDotEnv';
import { log } from './log';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

export type WxPackupConfig = {
  /** 执行环境, 对应环境变量文件 */
  env?: string;
  /**
   * 小程序的 appId, 默认才 project.config.json 读取, 也可以通过此配置项指定
   * 注意: 此配置项优先级最高, 将会覆盖 project.config.json 中的配置
   */
  appId?: string;
  /**
   * @default process.cwd()
   * @description 项目的路径，即 project.config.json 所在的目录
   */
  projectPath?: string;
  /**
   * @default .keystore
   * @description 私钥的路径所在文件夹
   * 根据传入 appId 或者 project.config.json中设置的appid
   * 来获取对应的 .keystore/private.${appid}.key key
   */
  privateKeyDir?: string;
  /**
   * @readonly
   * 暂时只对小程序做支持
   **/
  type?: 'miniProgram';
  /**
   * @default ['node_modules/**\/*']
   * @description 指定需要排除的规则
   */
  ignores?: string[];
  /**
   * @default ./scripts/
   *
   * 预处理脚本文件夹所在路径, 支持ts, 文件夹不存在则跳过, 对应文件命名规则如下
   * 编译前预处理脚本: beforeCompile.ts or beforeCompile/index.ts
   * 预览前预处理脚本: beforePreview.ts or beforePreview/index.ts
   * 上传前预处理脚本: beforeUpload.ts or beforeUpload/index.ts
   *
   */
  preHookScriptsDir?: string;
  /** 发布版本 */
  pubVersion?: string;
  /** 发布描述 */
  pubDesc?: string;
  /**
   * 微信开发工具安装路径,如果默认值就不用管
   * process.platform === 'darwin'
    ? '/Applications/wechatwebdevtools.app'
    : 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具';
   */
  devToolsInstallPath?: string;
  /**
   * npm 构建
   */
  packNpm?: {
    manually: boolean;
    ignores: string[];
    packageJsonPath?: string;
    miniprogramNpmDistDir?: string;
  };
};

const defaultConfig: Omit<
  Required<WxPackupConfig>,
  'appId' | 'devToolsInstallPath' | 'packNpm'
> = {
  env: '__default__',
  projectPath: process.cwd(),
  privateKeyDir: '.keystore',
  ignores: ['node_modules/**/*'],
  preHookScriptsDir: './scripts',
  type: 'miniProgram',
  pubVersion: CONFIGS.packageJson.read().version,
  pubDesc: '修复了一些已知问题',
};

export const writeDefaultConfigFile = (to: string) => {
  fs.writeFileSync(
    to,
    `
/** @type import('wxpackup').WxPackupConfig */
module.exports = {
  projectPath: '.',
  privateKeyDir: '.keystore',
  ignores: ['node_modules/**/*'],
  preHookScriptsDir: './scripts',
}
  `,
    { encoding: 'utf-8' },
  );
};

export const argsAndEnvConfig = () => {
  const argOrigin = yargs(hideBin(process.argv)).options({
    env: {
      type: 'string',
    },
    projectPath: {
      type: 'string',
    },
    proviteKeyDir: {
      type: 'string',
    },
    pubVersion: {
      type: 'string',
    },
    pubDesc: {
      type: 'string',
    },
  }).argv;

  const args = Object.keys(argOrigin).reduce((map, key) => {
    if (/(_|\$0)/.test(key)) return map;

    const mk = key
      .replace(/^--/, '')
      .replace(/-([a-z])/g, (_, $1) => $1.toUpperCase());
    map[mk] = process.env[mk] || (argOrigin as any)[key];
    return map;
  }, {} as Record<string, string>);

  const dotenvs = loadDotEnv(process.env.env || args.env || '__default__');

  const envs = Object.keys(dotenvs).reduce((map, key) => {
    if (/^WXPACKUP_/.test(key)) {
      const mk = key
        .replace(/^WXPACKUP_/, '')
        .toLowerCase()
        .replace(/_([a-z])/g, (_, $1) => $1.toUpperCase());
      map[mk] = dotenvs[key];
    }

    return map;
  }, {} as Record<string, string>);

  return {
    ...args,
    ...envs,
  };
};

export const makeConfig = (envs: WxPackupConfig): Required<WxPackupConfig> => {
  const root = path.resolve(envs.projectPath || defaultConfig.projectPath);
  const rcFile = path.join(root, 'wxpackup.config.js');
  const rc = fs.existsSync(rcFile) ? require(rcFile) : {};
  const config = {
    ...defaultConfig,
    ...rc,
    ...envs,
  };
  return config;
};

const memo = {
  loaded: null as unknown as Required<WxPackupConfig>,
};

const postLoadConfig = (conf: Required<WxPackupConfig>) => {
  const projectConfig = CONFIGS.projectConfig.read();
  if (projectConfig.appid !== conf.appId) {
    CONFIGS.projectConfig.rewrite(
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

export const loadConfig = () => {
  if (memo.loaded) {
    return memo.loaded;
  }
  const env = argsAndEnvConfig();
  const config = makeConfig(env);
  memo.loaded = config;

  process.chdir(
    path.isAbsolute(config.projectPath)
      ? config.projectPath
      : path.join(process.cwd(), config.projectPath),
  );

  log.green(JSON.stringify(config, null, 2));
  postLoadConfig(config);
  return config;
};
