import { input, select } from '@inquirer/prompts';
import fs from 'fs';
import path from 'path';
import { CONFIG_FILES } from './configFiles';
import { byPWD } from './utils';

const builtinTpl = path.resolve(__dirname, '../templates');
const userTpl = byPWD('.templates');

const qa = async () => {
  const base = await select({
    message: '请选择要创建的基础路径',
    choices: [
      { value: 'src/components', name: 'src/components' },
      { value: 'src/pages', name: 'src/pages' },
      { value: 'src/packages', name: 'src/packages' },
      { value: '', name: '手动输入' },
    ],
  });

  const name = await input({
    message: '请填写要创建的页面/组件名称',
    default: 'demo',
  });

  const dirpath = `${base}/${name}`;

  const type = await select({
    message: '请选择要创建的类型',
    choices: [
      { value: 'component', name: '组件' },
      { value: 'page', name: '页面' },
    ],
  });

  const filename = dirpath.split('/').pop();
  const suff = ['ts', 'less', 'json', 'wxml'].some((suffix) => {
    const has = fs.existsSync(byPWD(dirpath, `${filename}.${suffix}`));
    if (has) return true;
  });
  try {
    path.parse(byPWD(dirpath));
  } catch (error) {
    throw new Error(`路径不合法: ${byPWD(dirpath)})}`);
  }

  if (suff) {
    throw new Error(`文件已存在: ${byPWD(dirpath, `${filename}.${suff}`)}`);
  }

  if (!fs.existsSync(dirpath)) {
    fs.mkdirSync(dirpath, { recursive: true });
  }

  ['ts', 'less', 'json', 'wxml'].forEach((suffix) => {
    const getFile = (dir: string) => path.join(dir, type, `index.${suffix}`);
    let content = fs.existsSync(getFile(userTpl))
      ? fs.readFileSync(getFile(userTpl), 'utf-8')
      : fs.readFileSync(getFile(builtinTpl), 'utf-8');

    content = content
      .replace('PAGENAME', filename || 'NAME')
      .replace('COMPNAME', filename || 'NAME');
    fs.writeFileSync(byPWD(dirpath, `${filename}.${suffix}`), content, 'utf-8');
  });
  console.log(' 🎉 创建成功! ~> ', dirpath);
  if (type === 'page') {
    const appJSON = CONFIG_FILES.appJson.read();
    appJSON.pages.push(`${dirpath.replace('src/', '')}/${filename}`);
    CONFIG_FILES.appJson.rewrite(JSON.stringify(appJSON, null, 2));
    console.log(' 🎉 写入 app.json 成功!');
  }
};

qa();
