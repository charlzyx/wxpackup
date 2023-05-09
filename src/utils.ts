import fs from 'fs';
import os from 'os';
import path from 'path';
import { log } from './log';

export const byPWD = (...parts: string[]) => {
  return path.join(process.cwd(), ...parts);
};

export const ifNotFoundThrowError = (filePath: string, message?: string) => {
  if (!fs.existsSync(filePath)) {
    const msg = `文件不存在! ${message || ''} 查找路径: ${filePath}`;
    log.bgRed.black(msg);
    throw new Error(msg);
  }
};

export const kbSize = (x: number) => {
  return x ? `${(x / 1024).toFixed(2)}` : '';
};

export function getUserHomeDir(): string {
  function homedir(): string {
    const env = process.env;
    const home = env.HOME;
    const user = env.LOGNAME || env.USER || env.LNAME || env.USERNAME;

    if (process.platform === 'win32') {
      return env.USERPROFILE || `${env.HOMEDRIVE}${env.HOMEPATH}` || home || '';
    }

    if (process.platform === 'darwin') {
      return home || (user ? `/Users/${user}` : '');
    }

    if (process.platform === 'linux') {
      return (
        // @ts-ignore
        home || (process.getuid() === 0 ? '/root' : user ? `/home/${user}` : '')
      );
    }

    return home || '';
  }
  return typeof (os.homedir as (() => string) | undefined) === 'function'
    ? os.homedir()
    : homedir();
}

export const caseSwitch = (input: string = '') => {
  const isSnake = /_/.test(input);
  const isKebab = /-/.test(input);
  const isPascal = /^[A-Z]/.test(input);
  const isCamel = !(isSnake || isKebab || isPascal);

  return {
    snake() {
      if (isKebab) return input.toLowerCase().replace(/-/g, '_');
      if (isCamel) return input.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (isPascal) return caseSwitch(caseSwitch(input).camel()).snake();
      return input.toLowerCase();
    },
    kebab() {
      if (isSnake) return input.toLowerCase().replace(/_/g, '-');
      if (isCamel) return input.replace(/([A-Z])/g, '-$1').toLowerCase();
      if (isPascal) return caseSwitch(caseSwitch(input).camel()).kebab();
      return input;
    },
    camel() {
      if (isSnake) {
        return input
          .toLowerCase()
          .replace(/(_[a-z])/g, (x) => x.toUpperCase()[1]);
      }
      if (isKebab) {
        return input
          .toLowerCase()
          .replace(/(-[a-z])/g, (x) => x.toUpperCase()[1]);
      }
      if (isPascal) {
        return /[a-z]/.test(input)
          ? input.replace(/^[A-Z]/, (x) => x.toLowerCase())
          : input.toLowerCase();
      }
      return input;
    },
    Pascal() {
      const camel = caseSwitch(input).camel();
      return camel.replace(/^[a-z]/, (x) => x.toUpperCase());
    },
  };
};

/**
 * /**
 * project.config.json
 * @link https://developers.weixin.qq.com/miniprogram/dev/devtools/projectconfig.html#setting
 * ci settings
 * @link https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html#%E7%BC%96%E8%AF%91%E8%AE%BE%E7%BD%AE
 *
 * @param options  project.config.json settings
 * @returns ci settings
 */
export function getCompileOptions(
  options: /** @link  https://developers.weixin.qq.com/miniprogram/dev/devtools/projectconfig.html#setting */
    {
      es6: boolean;
      enhance: boolean;
      minified: boolean;
      postcss: boolean;
      minifyWXSS: boolean;
      minifyWXML: boolean;
      uglifyFileName: boolean;
      uploadWithSourceMap: boolean;
    },
): /** @link https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html#%E7%BC%96%E8%AF%91%E8%AE%BE%E7%BD%AE */
{
  es6: boolean;
  es7: boolean;
  minify: boolean;
  autoPrefixWXSS: boolean;
  minifyWXML: boolean;
  minifyWXSS: boolean;
  minifyJS: boolean;
  codeProtect: boolean;
  uploadWithSourceMap: boolean;
} {
  return {
    es6: options.es6,
    es7: options.enhance,
    minify: options.minified,
    autoPrefixWXSS: options.postcss,
    minifyWXML: options.minified || options.minifyWXSS,
    minifyWXSS: options.minified || options.minifyWXML,
    minifyJS: options.minified,
    codeProtect: options.uglifyFileName,
    uploadWithSourceMap: options.uploadWithSourceMap,
  };
}
