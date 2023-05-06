#!/usr/bin/env node

const spawn = require('child_process').spawn;
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const path = require('path');

const tsx = (command) => {
  const [filePath, ...others] = command.split(' ');
  const pkgFile = path.resolve(__dirname, '../src/', filePath);
  const fixCommand = [pkgFile, ...others].join(' ');
  return spawn(`npx tsx ${fixCommand}`, {
    stdio: 'inherit',
    shell: true,
  });
};

yargs(hideBin(process.argv))
  .command(
    'beforeCompile',
    '编译前预处理脚本',
    (yargs) => {},
    (argv) => {
      const rest = process.argv.slice(3).join(' ');
      return tsx(`./builtin/beforeCompile ${rest}`);
    },
  )
  .command(
    'beforePreview',
    '预览前预处理脚本',
    (yargs) => {},
    (argv) => {
      const rest = process.argv.slice(3).join(' ');
      return tsx(`./builtin/beforePreview ${rest}`);
    },
  )
  .command(
    'beforeUpload',
    '上传前预处理脚本',
    (yargs) => {},
    (argv) => {
      const rest = process.argv.slice(3).join(' ');
      return tsx(`./builtin/beforeUpload ${rest}`);
    },
  )
  .command(
    'ci <buildtype>',
    '小程序项目代码的编译命令行',
    (yargs) => {
      yargs.positional('buildtype', {
        choices: ['preview', 'upload', 'packnpm'],
        type: 'string',
        default: 'preview',
        describe:
          '目前仅支持 preview 预览, upload 上传, packnpm 构建npm 三种类型\n 更多文档: https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html',
      });
    },
    (argv) => {
      const rest = process.argv.slice(4).join(' ');
      return tsx(`./callci.ts build ${argv.buildtype} ${rest}`);
    },
  )
  .command(
    'cli [action]',
    '开发者工具命令行',
    (yargs) => {
      yargs.positional('action', {
        type: 'string',
        describe:
          'wxpackup cli open #使用微信开发者工具打开当前项目;\n 更多命令查看 https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html',
      });
    },
    (argv) => {
      const [_, rest] = process.argv.slice(2).join(' ').split('cli');
      tsx(`./callcli.ts cli ${rest}`);
    },
  )
  .option('env', {
    type: 'string',
    description: '项目编译环境',
  })
  .parse();
