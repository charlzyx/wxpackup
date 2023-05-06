import * as ci from 'miniprogram-ci';
import fs from 'fs';
import path from 'path';
import {
  generateQrcodeImageFile,
  printQrcode2Terminal,
  readQrcodeImageContent,
} from './qrcode';
import { log, spinner } from './log';
import { loadConfig } from './config';
import { byPWD, ifNotFoundThrowError, kbSize } from './utils';
import { CONFIG_FILES } from './configFiles';

const config = loadConfig();

const CompileConfig: {
  preview: Parameters<typeof ci.preview>[0]['setting'];
  prod: Parameters<typeof ci.preview>[0]['setting'];
} = {
  preview: {
    minify: false,
    autoPrefixWXSS: true,
    es6: true,
    es7: true,
  },
  prod: {
    minify: true,
    autoPrefixWXSS: true,
    es6: true,
    es7: true,
  },
};

const getProject = () => {
  let privateKeyPath = byPWD(config.privateKeyPath);
  const appId = CONFIG_FILES.projectConfig.read().appid;

  const isDir = fs.statSync(privateKeyPath).isDirectory();
  if (isDir) {
    const hint = 'private.${appid}.key';
    privateKeyPath = path.join(privateKeyPath, hint).replace('${appid}', appId);
  }

  ifNotFoundThrowError(
    privateKeyPath,
    `秘钥文件未找到, 请确认文件是否存在, 并检查一下配置项
 - .env/.env.xxx 中 APP_ID 字段
 - project.config.json 中 appid 字段`,
  );

  const conf = {
    appid: appId,
    projectPath: config.projectPath,
    type: config.type,
    ignores: config.ignores,
    privateKeyPath: privateKeyPath,
  };

  return new ci.Project(conf);
};

const analytics = (
  rsp:
    | Awaited<ReturnType<typeof ci.preview>>
    | Awaited<ReturnType<typeof ci.upload>>,
) => {
  if (rsp.subPackageInfo) {
    const allPackageInfo = rsp.subPackageInfo.find(
      (item) => item.name === '__FULL__',
    );
    const mainPackageInfo = rsp.subPackageInfo.find(
      (item) => item.name === '__APP__',
    );
    const extInfo = `本次上传${
      // rome-ignore lint/style/noNonNullAssertion: <explanation>
      kbSize(allPackageInfo!.size)
    }kb ${mainPackageInfo ? `,其中主包${kbSize(mainPackageInfo.size)}kb` : ''}`;
    log.bgCyan(`上传成功 ${new Date().toLocaleString()} \n${extInfo}`);
  }
};

const postci = async (type: 'preview' | 'upload', outputQRCodePath: string) => {
  if (type === 'preview') {
    try {
      const content = await readQrcodeImageContent(outputQRCodePath);
      await printQrcode2Terminal(content);
      log.bgGreen(
        `预览二维码已生成，存储在:"${outputQRCodePath}",\n二维码内容是：${content}`,
      );
    } catch (error: any) {
      log.bgRed(`获取预览二维码失败${error.message}`);
      console.log(error);
    }
  } else {
    try {
      // 体验码规则： https://open.weixin.qq.com/sns/getexpappinfo?appid=xxx&path=入口路径.html#wechat-redirect
      const qrContent = `https://open.weixin.qq.com/sns/getexpappinfo?appid=${config.appId}#wechat-redirect`;
      await printQrcode2Terminal(qrContent);
      await generateQrcodeImageFile(outputQRCodePath, qrContent);
      log.bgGreen(
        `体验版二维码已生成，存储在:"${outputQRCodePath}",\n二维码内容是："${qrContent}"`,
      );
      log.bgGreen('可能需要您前往微信后台，将当前上传版本设置为“体验版”');
      log.bgGreen(
        '若本次上传的robot机器人和上次一致，并且之前已经在微信后台设置其为“体验版”，则本次无需再次设置',
      );
    } catch (error: any) {
      log.bgRed(`获取体验二维码失败${error.message}`);
      console.log(error);
    }
  }
};

export const pkgNpm = async (project: ReturnType<typeof getProject>) => {
  if (!config.packNpm) return;
  const hint = config.packNpm.manually ? '<自定义 npm 构建>' : '<npm 构建>';
  try {
    if (config.packNpm?.manually) {
      const ret = await ci.packNpmManually({
        // rome-ignore lint/style/noNonNullAssertion: <explanation>
        miniprogramNpmDistDir: config.packNpm.miniprogramNpmDistDir!,
        // rome-ignore lint/style/noNonNullAssertion: <explanation>
        packageJsonPath: config.packNpm.packageJsonPath!,
        ignores: config.packNpm.ignores,
      });
      log.bgGreen(
        `${hint}打包完成\n https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html#%E8%87%AA%E5%AE%9A%E4%B9%89-node-modules-%E4%BD%8D%E7%BD%AE%E7%9A%84%E6%9E%84%E5%BB%BA-npm\n`,
        JSON.stringify(ret, null, 2),
      );
      if (ret.warnList) {
        log.bgYellow(
          ret.warnList
            .map((it, index) => {
              return `${index + 1}. ${it.msg}
\t> code: ${it.code}
\t@ ${it.jsPath}:${it.startLine}-${it.endLine}`;
            })
            .join('---------------\n'),
        );
      }
    } else {
      const warnings = await ci.packNpm(project, {
        ignores: config.packNpm.ignores,
        reporter: (infos) => log.bgGray(infos),
      });
      log.bgGreen(
        `${hint}打包完成 \n https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html#%E6%9E%84%E5%BB%BAnpm `,
      );

      log.bgYellow(
        warnings
          .map((it, index) => {
            return `${index + 1}. ${it.msg}
\t> code: ${it.code}
\t@ ${it.jsPath}:${it.startLine}-${it.endLine}`;
          })
          .join('---------------\n'),
      );
    }
  } catch (error: any) {
    log.bgRed(
      `${hint} 打包失败 ${new Date().toLocaleString()} \n${error.message}`,
    );
    console.log(error);
    throw error;
  }
};

export const run = async (
  type: 'preview' | 'upload' | 'packnpm',
  pub: {
    version: string;
    desc: string;
  },
) => {
  try {
    if (type === 'packnpm') {
      log.bgGreen('执行 npm 构建');
      const project = getProject();
      await pkgNpm(project);
      log.bgGreen('npm 构建成功');
      return;
    }
  } catch (error) {
    log.bgRed('npm 构建失败');
    console.log(error);
    throw error;
  }

  const hint = type === 'preview' ? '<PREWVIEW|开发版>' : '<UPLOAD|体验版>';
  const outputQRCodePath = byPWD(`${type}.jpg`);
  try {
    const project = getProject();
    await pkgNpm(project);

    log.bgGreen(`上传${hint}代码到微信后台并预览`);
    log.green(`本次上传版本号为："${pub.version}"，上传描述为：“${pub.desc}”`);

    let rsp:
      | Awaited<ReturnType<typeof ci.preview>>
      | Awaited<ReturnType<typeof ci.upload>>;
    if (type === 'upload') {
      const conf: Parameters<typeof ci.upload>[0] = {
        project,
        version: pub.version,
        desc: pub.desc,
        onProgressUpdate: spinner(),
        setting: CompileConfig.preview,
      };
      rsp = await ci.upload(conf);
      // log.grey(`--${hint}发布配置`, JSON.stringify(conf, null, 2));
    } else {
      const conf: Parameters<typeof ci.preview>[0] = {
        project,
        version: pub.version,
        desc: pub.desc,
        onProgressUpdate: spinner(),
        setting: CompileConfig.preview,
        qrcodeFormat: 'image',
        qrcodeOutputDest: outputQRCodePath,
      };
      // log.grey(`--${hint}发布配置`, JSON.stringify(conf, null, 2));
      rsp = await ci.preview(conf);
    }
    analytics(rsp);
    await postci(type, outputQRCodePath);
  } catch (error: any) {
    log.bgRed(
      `${hint}上传失败 ${new Date().toLocaleString()} \n${error.message}`,
    );
    console.log(error);
  }
};
