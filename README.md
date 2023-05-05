# wxpackup 微信小程序打包工具

## .keystore/

上传秘钥文件夹, 可以多个, 文件名称  `private.${appid}.key` 其中 `appid` 要替换为你的 `appid`
如 `.keystore/private.wx324423422342.key`


## .env/.env*

环境变量, 会在 `beforeCompile` 钩子中, 解析并写入 `src/env.ts` 文件

> 其中 `WXPACKUP_` 开头将视为配置属性, 不在`src/env.ts` 中出现, 并将转换成 `camelCase` 作为 `config`, 比如, 下方的 `WXPACKUP_APP_ID=wx1231231920900`, 等价于 `wxpackup.config.json` 的 `"appId": 'wx1231231920900' `

.env/.env
```bash
# 默认环境变量
NODE_ENV=production
API_PREFIX=https://api.example.com
WXPACKUP_APP_ID=wx1231231920900
```

.env/.env.local
```bash
NODE_ENV=devlopment
API_PREFIX=https://test.example.com
WXPACKUP_APP_ID=wx18898989899989
```


## scripts

```json
{
    "#指定环境的build": "npm run build:preview  --env=local",
    "#这样也可以": "env=local npm run build:preview",
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
