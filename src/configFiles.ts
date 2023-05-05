import { loadConfig } from './config';
import { byPWD, ifNotFoundThrowError } from './utils';
import fs from 'fs';
import path from 'path';

export const CONFIGS = {
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

Object.defineProperty(CONFIGS.projectConfig, 'filePath', {
  get() {
    const config = loadConfig();
    return path.join(config.projectPath, './project.config.json');
  },
});
Object.defineProperty(CONFIGS.appJson, 'filePath', {
  get() {
    const config = loadConfig();
    return byPWD(
      require(path.join(config.projectPath, './project.config.json'))
        .miniprogramRoot,
      './app.json',
    );
  },
});
