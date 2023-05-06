import fs from 'fs';
import { loadDotEnv } from '../../loadDotEnv';

export const generatorEnv = (outputs: string[]) => {
  const envs = loadDotEnv(process.env.env);

  outputs.forEach((item) =>
    fs.writeFileSync(
      item,
      Object.entries(envs)
        .map(([k, v]) => {
          if ('APP_ID' === k || !/^APP_/.test(k)) {
            return '';
          }
          return `export const ${k.replace('APP_', '')} = '${v}';`;
        })
        .filter(Boolean)
        .join('\n'),
      'utf-8',
    ),
  );
};
