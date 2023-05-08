import { loadConfig } from './config';
import shell from 'shelljs';
import fs from 'fs';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import os from 'os';
import path from 'path';
import { log } from './log';
import { ifNotFoundThrowError, getUserHomeDir } from './utils';

const config = loadConfig();

const check = () => {
  const isWindows = os.platform() === 'win32';
  const wxDevToolsPath =
    config.wxDevToolsPath ||
    (!isWindows
      ? '/Applications/wechatwebdevtools.app'
      : 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具');

  if (!fs.existsSync(wxDevToolsPath)) {
    log.red(
      `在路径 ${wxDevToolsPath} 中未找到开发者工具, 请检查路径是否正确;
未安装微信开发者工具, cli 相关功能将不可用`,
    );
  }

  const files = {
    bin: path.join(
      wxDevToolsPath,
      isWindows ? '/cli.bat' : '/Contents/MacOS/cli',
    ),
    // ideStatusFile: path.join(
    //   getUserHomeDir(),
    //   isWindows
    //     ? '/AppData/Local/微信开发者工具/User Data/Default/.ide-status'
    //     : '/Library/Application Support/微信开发者工具/Default/.ide-status',
    // ),
  };

  const helper =
    '工具的服务端口已关闭。要使用命令行调用工具，请打开工具 -> 设置 -> 安全设置，将服务端口开启。详细信息: https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html ';

  ifNotFoundThrowError(files.bin, helper);
  // ifNotFoundThrowError(files.ideStatusFile, helper);

  // const ideStatus = fs.readFileSync(files.ideStatusFile, 'utf-8');
  // if (ideStatus === 'Off') {
  //   log.bgRed(helper);
  //   throw new Error(helper);
  // }

  return files;
};

/**
 * @link https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html
 * 分类	作用	命令
帮助	查看帮助	cli -h
登录	登录工具	cli login
是否登录工具	cli islogin
小程序代码	预览	cli preview
上传代码	cli upload
自动预览	cli auto-preview
开启自动化	cli auto
开启自动化	cli auto-replay
构建 npm	cli build-npm
清除缓存	cli cache
工具窗口	启动工具	cli open
打开其他项目	cli open-other
关闭项目窗口	cli close
关闭工具	cli quit
重建文件监听	cli reset-fileutils
云开发	云开发操作	cli cloud -h
云环境相关操作	cli cloud env -h
云函数相关操作	cli cloud functions -h
查看云环境列表	cli cloud env list
查看云函数列表	cli cloud functions list
查看云函数信息	cli cloud functions info
上传云函数	cli cloud functions deploy
增量上传云函数	cli cloud functions inc-deploy
下载云函数	cli cloud functions download
 */
type Command =
  /** 登录	登录工具	**/
  | 'login'
  /** 是否登录工具	**/
  | 'islogin'
  /** 小程序代码	预览	**/
  | 'preview'
  /** 上传代码	**/
  | 'upload'
  /** 自动预览	**/
  | 'auto-preview'
  /** 开启自动化	**/
  | 'auto'
  /** 开启自动化	**/
  | 'auto-replay'
  /** 构建 npm	**/
  | 'build-npm'
  /** 清除缓存	**/
  | 'cache'
  /** 工具窗口	启动工具	**/
  | 'open'
  /** 打开其他项目	**/
  | 'open-other'
  /** 关闭项目窗口	**/
  | 'close'
  /** 关闭工具	**/
  | 'quit'
  /** 重建文件监听	**/
  | 'reset-fileutils';
type CloudCommand =
  /** 云开发	云开发操作	**/
  /** 云环境相关操作	**/
  | 'env'
  /** 云函数相关操作	**/
  | 'functions'
  /** 查看云环境列表	**/
  | 'env list'
  /** 查看云函数列表	**/
  | 'functions list'
  /** 查看云函数信息	**/
  | 'functions info'
  /** 上传云函数	**/
  | 'functions deploy'
  /** 增量上传云函数	**/
  | 'functions inc-deploy'
  /** 下载云函数	**/
  | 'functions download';

const buildOptions = (kvs: string | Record<string, string>) => {
  return typeof kvs === 'string'
    ? kvs
    : Object.keys(kvs)
        .map((key) => `--${key} ${kvs[key] || ''}`)
        .join(' ');
};

export const cli = {
  exec(command: Command, options: string | Record<string, string> = {}) {
    const has =
      (typeof options === 'string' && /--project/.test(options)) ||
      (typeof options === 'object' && options.project);

    const def = has ? '' : `--project ${config.projectPath}`;
    const cli = `${check().bin} ${command} ${buildOptions(
      options,
    )} ${def} --lang zh`;

    log.magenta('执行命令: ', cli);

    return shell.exec(cli);
  },
};

yargs(hideBin(process.argv))
  .command(
    'cli [action]',
    'https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html#%E8%87%AA%E5%8A%A8%E9%A2%84%E8%A7%88',
    (yargs) => {
      yargs.positional('action', {
        type: 'string',
      });
    },
    (argv) => {
      const action = argv.action as Parameters<typeof cli.exec>[0];
      const pass = process.argv.slice(2).join(' ').split('cli')[1];
      cli.exec(action, pass);
    },
  )
  .parse();
