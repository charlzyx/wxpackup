import fs from 'fs';
import { loadDotEnv } from '../../loadDotEnv';

export const generatorEnv = (outputs: string[]) => {
  const envs = loadDotEnv(process.env.env);
  const envTsFile = Object.entries(envs)
    .map(([k, v]) => {
      if (/^WXPACKUP_/.test(k)) {
        return '';
      }
      return `export const ${k} = '${v}';`;
    })
    .filter(Boolean)
    .join('\n');

  outputs.forEach((item) => fs.writeFileSync(item, envTsFile, 'utf-8'));
};
