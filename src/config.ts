import fs from 'fs';
import path from 'path';
import { CONFIGS } from './configFiles';
import { loadDotEnv } from './loadDotEnv';
import { log } from './log';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

/**
 * 配置优先级
 * 1. PROCESS: process.env
 * 2. PROCESS: process.argv
 * 3. PROCESS: .env/WXPACKUP_*
 * 4. RC: wxpackup.config.js
 */
type WxPackupConfigByProcess = {
  debug?: boolean;
  env?: string;
  appId?: string;
  projectPath?: string;
  privateKeyDir?: string;
  preHookScriptsDir?: string;
};

type WxPackupConfigByRc = {
  debug?: boolean;
  projectPath?: string;
  privateKeyDir?: string;
  preHookScriptsDir?: string;
  type?: 'miniProgram';
  ignores?: string[];
  devToolsInstallPath?: string;
  packNpm?: {
    manually: boolean;
    ignores: string[];
    packageJsonPath?: string;
    miniprogramNpmDistDir?: string;
  };
};

export type WxPackupConfig = WxPackupConfigByProcess & WxPackupConfigByRc;

const defaultConfig = {
  debug: false,
  env: '__default__',
  projectPath: process.cwd(),
  privateKeyDir: '.keystore',
  preHookScriptsDir: './scripts',
  ignores: ['node_modules/**/*'],
  type: 'miniProgram',
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
  preHookScriptsDir: 'scripts',
}
  `,
    { encoding: 'utf-8' },
  );
};

const caseSwitch = (input: 'snake-case') => {};

const argvConfig = (): WxPackupConfigByProcess => {
  const argOrigin = yargs(hideBin(process.argv)).options({
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
    'provite-key-dir': {
      type: 'string',
    },
    'pre-hook-scripts-dir': {
      type: 'string',
    },
  }).argv;

  /** camel-case to camelCase */
  const args = Object.keys(argOrigin).reduce((map, key) => {
    if (/(_|\$0)/.test(key)) return map;
    const mk = key.replace(/-([a-z])/g, (_, $1) => $1.toUpperCase());
    map[mk] = process.env[mk] || (argOrigin as any)[key];
    return map;
  }, {} as Record<string, string>);

  return args;
};

export const argsAndEnvConfig = () => {
  const dotenvs = loadDotEnv(process.env.env || '__default__');

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
