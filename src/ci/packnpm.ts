import * as ci from 'miniprogram-ci';

import { log } from '../log';
import { loadConfig } from '../config';
import { getProject } from './project';

const config = loadConfig();

export const pkgNpm = async (project?: ReturnType<typeof getProject>) => {
  if (!project) {
    project = getProject();
  }
  if (!config.packNpm) {
    console.log('没有 npm 构建配置, 跳过');
    return;
  }
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
