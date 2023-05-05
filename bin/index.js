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
    'call beforeCompile scripts',
    (yargs) => {},
    (argv) => {
      const rest = process.argv.slice(3).join(' ');
      return tsx(`./builtin/beforeCompile ${rest}`);
    },
  )
  .command(
    'beforePreview',
    'call beforePreview scripts',
    (yargs) => {},
    (argv) => {
      const rest = process.argv.slice(3).join(' ');
      return tsx(`./builtin/beforePreview ${rest}`);
    },
  )
  .command(
    'beforeUpload',
    'call beforeUpload scripts',
    (yargs) => {},
    (argv) => {
      const rest = process.argv.slice(3).join(' ');
      return tsx(`./builtin/beforeUpload ${rest}`);
    },
  )
  .command(
    'ci <buildtype>',
    'miniprograme ci',
    (yargs) => {
      yargs.positional('buildtype', {
        choices: ['preview', 'upload', 'packnpm'],
        type: 'string',
        default: 'preview',
      });
    },
    (argv) => {
      const rest = process.argv.slice(4).join(' ');
      return tsx(`./callci.ts build ${argv.buildtype} ${rest}`);
    },
  )
  .command(
    'cli [action]',
    '命令行工具包装',
    (yargs) => {
      yargs.positional('action', {
        type: 'string',
      });
    },
    (argv) => {
      const [_, rest] = process.argv.slice(2).join(' ').split('cli');
      tsx(`./callcli.ts cli ${rest}`);
    },
  )
  .option('env', {
    type: 'string',
    description: 'environment of compiler',
  })
  .parse();
