import * as ci from 'miniprogram-ci';
import {
  generateQrcodeImageFile,
  printQrcode2Terminal,
  readQrcodeImageContent,
} from '../qrcode';
import { log } from '../log';
import { loadConfig } from '../config';
import { kbSize } from '../utils';

const config = loadConfig();

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

export const postPreviewOrUpload = async (
  type: 'preview' | 'upload',
  outputQRCodePath: string,
  rsp:
    | Awaited<ReturnType<typeof ci.preview>>
    | Awaited<ReturnType<typeof ci.upload>>,
) => {
  analytics(rsp);
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
