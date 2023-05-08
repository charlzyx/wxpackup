const Koa = require('koa');
const app = new Koa();
const fs = require('fs');
const path = require('path');
const { Stream } = require('stream');

const html = (title) => `<!DOCTYPE html>
<html lang="en">
<head>
  <title>wxpackup mock</title>
</head>
<body>
  <h1>${title || 'wxpackup mock: a very very simple static server as mock. '}</h1>
  <h2>- 在 mock 文件夹下创建 xxx.json 文件 即可通过 /xxx 获取到该mock数据, 例如:</h2>
  <pre>
  ./mock/yes.json         -> /yes
  ./mock/hello/world.json -> /hello/world
  ./mock/ok/yes.json      -> /ok/yes
  <pre>

  <h2>- 图片也支持, 但是需要带上后缀</h2>
  <pre>
  ./mock/hi.png         -> /hi.png
  </pre>
</body>
</html>`;

const find = (filePath, root) => {
  let target = path.join(root, filePath.replace(/^\//, ''));
  const isDir = fs.existsSync(target) && fs.statSync(target).isDirectory();
  if (isDir) {
    const jsonFile = path.resolve(target, 'index.json');
    if (fs.existsSync(jsonFile)) {
      return fs.readFileSync(jsonFile, 'utf-8');
    }
  }

  const has = fs.existsSync(target) && fs.statSync(target).isFile();

  if (has) {
    return fs.createReadStream(target);
  } else {
    target = `${target}.json`;
    const has = fs.existsSync(target) && fs.statSync(target).isFile();
    if (has) {
      return fs.readFileSync(target, 'utf-8');
    }
  }

  return null;
};

const server = (root = 'mock', port = '8081') => {
  app.use(async (ctx) => {
    if (ctx.path === '/') {
      ctx.body = html();
      return;
    }
    if (/\.ico/.test(ctx.path)) {
      ctx.body = 'noico';
      return;
    }
    const content = find(ctx.path, path.join(process.cwd(), root));
    const isStream = content instanceof Stream;
    if (isStream) {
      ctx.body = content;
    } else if (content) {
      ctx.body = {
        data: JSON.parse(content),
        code: 200,
        message: 'success',
        debug: {
          query: ctx.query,
          method: ctx.method,
        },
      };
    } else {
      ctx.body = html('404 Not Found.');
    }
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`wxpackup mock 服务器启动 🚀 http://localhost:${port}`);
  });
};

module.exports = server;
