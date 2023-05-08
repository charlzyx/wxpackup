# wxpackup 微信小程序打包工具

[![npm](https://img.shields.io/npm/v/wxpackup
)](https://www.npmjs.com/package/wxpackup)
[![star this repo](https://img.shields.io/github/stars/charlzyx/wxpackup?style=social)](https://github.com/charlzyx/wxpackup)

## 介绍
wxpackup 是一个原生小程序项目的打包工具, 旨在提升原生小程序开发体验.
主要目标是为原生小程序项目完善比较现代化的多环境构建项目配置,
同时封装了小程序官方的 ci/cli 命令, 来方便开发者使用.

## 安装

```bash
npm install wxpackup --dev
yarn install wxpackup --dev
```


## 项目结构

```
.
├── wxpackup.config.js                  # wxpackup 配置文件
├── package.json                        # 项目依赖, 脚本配置
├── project.config.json                 # 小程序项目配置文件
├── project.private.config.json         # 小程序项目私有配置文件。此文件中的内容将覆盖
├── tsconfig.json                       # TypeScript 配置文件
├── .env                                # [可选?] 不同 [模式] 对应的 dotenv 文件
│   ├── .env                            # tips: 所有情况下都会加载
│   └── .env.local                      # tips: 指定 `--env=local` 的情况下会加载, 并覆盖 `.env` 中的属性
│   └── .env.[mode]                      # tips: 指定 模式
情况下会加载, 并覆盖 `.env` 中的属性
├── .keystore                           # [可选?] 用户上传秘钥文件夹
│   └── private.${appid}.key
├── scripts                             # [可选?] 用户自定义脚本文件夹, 目前来说, 提供了一下三个钩子
│   ├── beforeCompile.ts                # [可选?] 编译前预处理
│   ├── beforePreview.ts                # [可选?] 预览前预处理
│   └── beforeUpload.ts                 # [可选?] 上传前预处理
├── src                                 # 小程序源码文件夹
│   ├── app.json                        # 小程序全局配置
│   ├── app.less                        # 小程序全局样式
│   ├── app.ts                          # 小程序入口文件
│   ├── components                      # [约定] 公共组件文件夹
│   ├── env.ts                          # [生成] wxpackup 自动生成, 不要手动写
│   ├── lib                             # [约定] 三方库, 不经过babel编译的
│   ├── packages                        # [约定] 分包文件夹
│   ├── pages                           # 小程序页面文件夹
│   └── utils                           # [约定] 公共工具函数
├── typings                             # 小程序类型文件, 不太用关注
├── .rome.json                          # [IDE插件] js/ts 格式化配置
├── .stylelintrc.js                     # [IDE插件] less/css 格式化配置
└── .vscode                             # [IDE插件] vscode 项目的编辑器配置, 用来指定一些格式化和插件配置

```


## 环境变量 .env/.env*

1. 其中 `APP_` 开头 (`APP_ID`除外) 的环境变量, 会在 `beforeCompile` 钩子中, 解析并写入 `src/env.ts` 文件

2. `DEBUG`, `APP_ID`, `PRIVATE_KEY_PATH`, `WX_DEV_TOOLS_PATH` 则将作为 `wxpackup` 的配置项来使用


> 另外，wxpackup 执行时已经存在的环境变量有最高的优先级，不会被 .env[mode] 模式文件覆盖. 例如当运行 DBEUG=true npx wxpackup build 的时候, .env 文件中的 `DEBUG` 配置将会失效

> 此外, env 和 process.env 中的环境变量, 在作为 wxpackup 配置使用的时候, 大小写不敏感, 也就是 `debug` 和 `DEBUG` 是一样的

.env/.env
```bash
# 默认环境变量, 所有变量都会被注入 process.env
NODE_ENV=production
## 会被识别为 wepackup 的配置
DEBUG=false
APP_ID=wx1231231920900
## 会生成到 `src/env.ts` 文件中
APP_API_PREFIX=https://api.example.com
```

.env/.env.local
```bash
# --env=local 的时候会注入, 所有变量都会被注入 process.env
NODE_ENV=devlopment
## 会注入到 process.env, 并被识别为 wepackup 的配置
DEBUG=true
APP_ID=wx1231231989989
## 会生成到 `src/env.ts` 文件中
APP_API_PREFIX=https://test.example.com
```

## 配置项 `wxpackup#config`

目前配置文件只支持非常少的配置项, 通过项目结构中的文件夹和文件名称的约定来减少配置

其中配置项的来源有以下几个路径, 按照优先级排序
1. 环境变量 `process.env` , 拼写格式为 `SNAKE_CASE`
2. 命令行参数 `wxpackup --some-opt=something`,  拼写格式为 `kabeb-case`
3. `.env.*` 中的环境变量 如: `DEBUG=true`, 拼写格式为 `SNAKE_CASE`
4. 配置文件 `wxpackup.config.js`, 拼写格式为 `camelCase`, 可以读取环境变量
5. 内置的默认配置

全量配置项如下, 最终 merge 完成的配置具体来源可以查看控制台输出

```ts
/** 环境变量与 dotenv **/
type WxPackupConfigByProcess = {
  debug?: boolean;
  env?: string;
  appId?: string;
  privateKeyPath?: string;
  wxDevToolsPath?: string;
};

/** 配置文件 **/
type WxPackupConfigByRc = {
  privateKeyPath?: string;
  wxDevToolsPath?: string;
  ignores?: string[];
  packNpm?: {
    manually: boolean;
    ignores: string[];
    packageJsonPath?: string;
    miniprogramNpmDistDir?: string;
  };
};

/** 暂未开放 **/
type WxPackupConfigReadOnly = {
  projectPath: string;
  type: 'miniProgram';
};
```

wxpackup.config.js
```
/** 可以访问 process.env **/
/** @type import('wxpackup').WxPackupConfig */
module.exports = {
  ignores: ['node_modules/**/*'],
  privateKeyPath: '.keystore',
};
```

## 命令行 cli

```
wxpackup [命令]

命令：
  wxpackup mock [root] [port] 启动 mock 服务
  wxpackup formatwxml <file>  格式化代码, 仅支持 WXML
  wxpackup beforeCompile      编译前预处理脚本
  wxpackup beforePreview      预览前预处理脚本
  wxpackup beforeUpload       上传前预处理脚本
  wxpackup cloud [command]    云开发命令行
                              wxpackup cloud function       上传云函数
                              wxpackup cloud storage static 上传云开发静态资源
                              wxpackup cloud storage cloud  上传云存储
                              wxpackup cloud container      上传云托管

  wxpackup ci [command]       小程序项目代码的编译命令行
                              wxpackup ci preview   预览
                              wxpackup ci upload    上传
                              wxpackup ci packnpm   构建npm
                              wxpackup ci sourcemap 下载最近一次 sourcemap
                              查看更多: https://developers.weixin.qq.com/minipro
                              gram/dev/devtools/ci.html
  wxpackup cli [command]      开发者工具命令行
                              wxpackup cli open             启动工具 / 项目
                              wxpackup cli login            重新登录工具
                              wxpackup cli islogin          #islogin-desc
                              wxpackup cli preview          预览
                              wxpackup cli auto-preview     自动预览
                              wxpackup cli upload           上传小程序
                              wxpackup cli build-npm        构建 NPM
                              wxpackup cli auto             开启自动化
                              wxpackup cli auto-replay      开启自动化
                              wxpackup cli reset-fileutils
                              #reset-fileutils-desc
                              wxpackup cli close            关闭项目
                              wxpackup cli quit             关闭 IDE
                              wxpackup cli cache            清理缓存
                              wxpackup cli engine           开发者工具游戏方案
                              更多命令查看 https://developers.weixin.qq.com/mini
                              program/dev/devtools/cli.html

选项：
  --help     显示帮助信息                                                 [布尔]
  --version  显示版本号                                                   [布尔]
  --mode     项目编译模式, 对应 .env.[mode] 文件                        [字符串]
```


## npm 脚本示例 scripts

```json
{
    "#指定模式的build": "npm run build:preview  --mode=local",
    "#这样也可以": "mode=local npm run build:preview",
    "build:preview": "npx wxpackup ci preview",
    "build:packnpm": "npx wxpackup ci packnpm",
    "build:upload": "npx wxpackup ci upload",
    "cli:open": "npx wxpackup cli open",
    "cli:help": "npx wxpackup cli -h",
    "beforeCompile": "npx wxpackup beforeCompile",
    "beforePreview": "npx wxpackup beforePreview",
    "beforeUpload": "npx wxpackup beforeUpload",
}
```
## Demo 示例

[wxpackup-startkit](https://github.com/charlzyx/wxpackup-startkit)
