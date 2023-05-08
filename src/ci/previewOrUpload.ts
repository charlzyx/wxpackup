import * as ci from 'miniprogram-ci';
import { log, spinner } from '../log';
import { byPWD, getCompileOptions } from '../utils';
import { CONFIG_FILES } from '../configFiles';
import { postPreviewOrUpload } from './shared';
import { getProject } from './project';
import { pkgNpm } from './packnpm';

export const previewOrUpload = async (
  type: 'preview' | 'upload',
  pub: {
    version: string;
    desc: string;
  },
) => {
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
    const compileOptions = getCompileOptions(
      CONFIG_FILES.projectConfig.read().setting,
    );
    if (type === 'upload') {
      const conf: Parameters<typeof ci.upload>[0] = {
        project,
        version: pub.version,
        desc: pub.desc,
        onProgressUpdate: spinner(),
        setting: compileOptions,
      };
      rsp = await ci.upload(conf);
      // log.grey(`--${hint}发布配置`, JSON.stringify(conf, null, 2));
    } else {
      const conf: Parameters<typeof ci.preview>[0] = {
        project,
        version: pub.version,
        desc: pub.desc,
        onProgressUpdate: spinner(),
        setting: compileOptions,
        qrcodeFormat: 'image',
        qrcodeOutputDest: outputQRCodePath,
      };
      // log.grey(`--${hint}发布配置`, JSON.stringify(conf, null, 2));
      rsp = await ci.preview(conf);
    }

    await postPreviewOrUpload(type, outputQRCodePath, rsp);
  } catch (error: any) {
    log.bgRed(
      `${hint}上传失败 ${new Date().toLocaleString()} \n${error.message}`,
    );
    console.log(error);
  }
};
