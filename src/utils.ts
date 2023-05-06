import os from 'os';
import path from 'path';
import fs from 'fs';
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
  if (input === 'DEBUG') {
    console.log({ isCamel, isKebab, isPascal, isSnake });
  }

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
      if (isSnake)
        return input
          .toLowerCase()
          .replace(/(_[a-z])/g, (x) => x.toUpperCase()[1]);
      if (isKebab)
        return input
          .toLowerCase()
          .replace(/(-[a-z])/g, (x) => x.toUpperCase()[1]);
      if (isPascal)
        return /[a-z]/.test(input)
          ? input.replace(/^[A-Z]/, (x) => x.toLowerCase())
          : input.toLowerCase();
      return input;
    },
    Pascal() {
      const camel = caseSwitch(input).camel();
      return camel.replace(/^[a-z]/, (x) => x.toUpperCase());
    },
  };
};
