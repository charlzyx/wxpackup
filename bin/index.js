#!/usr/bin/env node

const spawn = require('child_process').spawn;
const yargs = require('yargs/yargs');
const fs = require('fs');
const { hideBin } = require('yargs/helpers');
const path = require('path');
const mock = require('./mock');

const FORMAT = {
  content_unformatted: 'text',
  wrap_attributes: 'force-expand-multiline',
  indent_size: 2,
  wrap_attributes_indent_size: 2,
  void_elements: 'image,input,video',
  indent_scripts: 'keep',
};
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
    'mock [root] [port]',
    '启动 mock 服务',
    (yargs) => {},
    (argv) => {
      mock(argv.root, argv.port);
    },
  )
  .command(
    'formatwxml <file>',
    '格式化代码, 仅支持 WXML',
    (yargs) => {
      return yargs.positional('file', {
        type: 'string',
        describe: '需要格式化的文件',
      });
    },
    (argv) => {
      const file = argv.file;
      const isFileExists = fs.existsSync(file);
      const isWXMLFile = /\.wxml$/.test(file);
      if (!isFileExists || !isWXMLFile) return;

      const code = fs.readFileSync(file, 'utf-8');
      const jsb_html = require('js-beautify').html;

      try {
        content = jsb_html(code, FORMAT);
        fs.writeFileSync(file, content, 'utf-8');
      } catch (error) {
        console.error(`FORMAT FILE ERROR${error}`);
      }
    },
  )
  .command(
    'beforeCompile',
    '编译前预处理脚本',
    (yargs) => {},
    (argv) => {
      const pass = process.argv.slice(3).join(' ');
      return tsx(`./builtin/beforeCompile ${pass}`);
    },
  )
  .command(
    'beforePreview',
    '预览前预处理脚本',
    (yargs) => {},
    (argv) => {
      const pass = process.argv.slice(3).join(' ');
      return tsx(`./builtin/beforePreview ${pass}`);
    },
  )
  .command(
    'beforeUpload',
    '上传前预处理脚本',
    (yargs) => {},
    (argv) => {
      const pass = process.argv.slice(3).join(' ');
      return tsx(`./builtin/beforeUpload ${pass}`);
    },
  )
  .command(
    'cloud [command]',
    `云开发命令行
wxpackup cloud function       上传云函数
wxpackup cloud storage static 上传云开发静态资源
wxpackup cloud storage cloud  上传云存储
wxpackup cloud container      上传云托管
`,
    (yargs) => {
      yargs.positional('command', {
        choices: ['function', 'storage <static|cloud>', 'container'],
      });
    },
    (argv) => {
      const [_, pass] = process.argv.slice(2).join(' ').split('cloud');
      return tsx(`./ci/cloud.ts ${pass}`);
    },
  )
  .command(
    'ci [command]',
    `小程序项目代码的编译命令行
wxpackup ci preview   预览
wxpackup ci upload    上传
wxpackup ci packnpm   构建npm
wxpackup ci sourcemap 下载最近一次 sourcemap
查看更多: https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html`,
    (yargs) => {
      yargs.positional('command', {
        choices: ['preview', 'upload', 'packnpm', 'sourcemap'],
      });
    },
    (argv) => {
      const [_, pass] = process.argv.slice(2).join(' ').split('ci');

      return tsx(`./ci/index.ts ${pass}`);
    },
  )
  .command(
    'cli [command]',
    `开发者工具命令行
wxpackup cli open             启动工具 / 项目
wxpackup cli login            重新登录工具
wxpackup cli islogin          #islogin-desc
wxpackup cli preview          预览
wxpackup cli auto-preview     自动预览
wxpackup cli upload           上传小程序
wxpackup cli build-npm        构建 NPM
wxpackup cli auto             开启自动化
wxpackup cli auto-replay      开启自动化
wxpackup cli reset-fileutils  #reset-fileutils-desc
wxpackup cli close            关闭项目
wxpackup cli quit             关闭 IDE
wxpackup cli cache            清理缓存
wxpackup cli engine           开发者工具游戏方案
更多命令查看 https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html`,
    (yargs) => {},
    (argv) => {
      const [_, pass] = process.argv.slice(2).join(' ').split('cli');

      tsx(`./cli.ts cli ${pass ?? '-h'}`);
    },
  )
  .option('mode', {
    type: 'string',
    description: '项目编译模式, 对应 .env.[mode] 文件',
  })
  .parse();
