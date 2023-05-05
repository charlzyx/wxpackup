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
