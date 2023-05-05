import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { loadConfig } from '../config';
import { log } from '../log';
import { byPWD } from '../utils';

export const tsx = (command: string) => {
  return spawn(`npx tsx ${command}`, {
    stdio: 'inherit',
    shell: true,
  });
};

export const getCutomeScripts = () => {
  const dir = loadConfig().preHookScriptsDir;
  const scripts = {
    beforeCompile: '',
    beforePreview: '',
    beforeUpload: '',
  };
  if (!dir) {
    return scripts;
  }
  const scriptsDir = byPWD(dir);
  console.log('---', { dir, scriptsDir });
  if (!fs.existsSync(scriptsDir)) {
    log.bgYellow('自定义预处理脚本文件夹不存在, 跳过');
    return scripts;
  }
  const mapping = fs
    .readdirSync(scriptsDir)
    .filter((item) => {
      return /beforeCompile|beforePreview|beforeUpload/.test(item);
    })
    .reduce((map, item) => {
      console.log('mapping item', item);
      if (/beforeCompile/.test(item)) {
        map.beforeCompile = path.join(scriptsDir, item);
      } else if (/beforePreview/.test(item)) {
        map.beforePreview = path.join(scriptsDir, item);
      } else if (/beforeUpload/.test(item)) {
        map.beforeUpload = path.join(scriptsDir, item);
      }
      return map;
    }, scripts);

  return mapping;
};
