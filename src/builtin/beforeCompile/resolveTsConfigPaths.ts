import { CONFIGS } from '../../configFiles';

export const resolveTsConfigPathsToAlias = () => {
  const tsConfig = CONFIGS.tsConfig.read();
  const projectConfig = CONFIGS.projectConfig.read();
  const appJson = CONFIGS.appJson.read();
  const paths = tsConfig.compilerOptions.paths || {};

  const pathsToAlias = (o: Record<string, string[]>) => {
    return Object.keys(o).reduce((map, key) => {
      const alias = o[key][0]
        .replace(projectConfig.miniprogramRoot, '')
        .replace(/^\.\//, '')
        .replace(/^\*$/, '/*');
      map[key] = alias;
      return map;
    }, {} as Record<string, string>);
  };

  const BEFORE = JSON.stringify(appJson.resolveAlias);
  appJson.resolveAlias = {
    ...appJson.resolveAlias,
    ...pathsToAlias(paths),
  };
  const AFTER = JSON.stringify(appJson.resolveAlias);

  if (BEFORE === AFTER) return;

  CONFIGS.appJson.rewrite(JSON.stringify(appJson, null, 2));
};
