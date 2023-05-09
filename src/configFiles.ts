import fs from 'fs';
import path from 'path';
import { loadConfig } from './config';
import { byPWD, ifNotFoundThrowError } from './utils';

export const CONFIG_FILES = {
  packageJson: {
    filePath: byPWD('./package.json'),
    read() {
      ifNotFoundThrowError(this.filePath);
      delete require.cache[this.filePath];
      return require(this.filePath);
    },
    rewrite(content: string) {
      fs.writeFileSync(this.filePath, content, 'utf-8');
    },
  },
  projectConfig: {
    filePath: byPWD('project.config.json'),
    read() {
      ifNotFoundThrowError(this.filePath);
      delete require.cache[this.filePath];
      return require(this.filePath);
    },
    rewrite(content: string) {
      fs.writeFileSync(this.filePath, content, 'utf-8');
    },
  },
  tsConfig: {
    filePath: byPWD('./tsconfig.json'),
    read() {
      ifNotFoundThrowError(this.filePath);
      delete require.cache[this.filePath];
      return require(this.filePath);
    },
    rewrite(content: string) {
      fs.writeFileSync(this.filePath, content, 'utf-8');
    },
  },
  appJson: {
    filePath: 'dynamic_by_define',

    read() {
      ifNotFoundThrowError(this.filePath);
      delete require.cache[this.filePath];
      return require(this.filePath);
    },
    rewrite(content: string) {
      fs.writeFileSync(this.filePath, content, 'utf-8');
    },
  },
};

Object.defineProperty(CONFIG_FILES.appJson, 'filePath', {
  get() {
    return byPWD(
      require(CONFIG_FILES.projectConfig.filePath).miniprogramRoot,
      './app.json',
    );
  },
});
