import chalk, { Chalk } from 'chalk';
import ora from 'ora';

export const spinner = () => {
  const cache: Record<string, any> = {};
  return (
    task:
      | {
          id: string;
          message: string;
          status: 'done' | 'doing';
        }
      | string,
  ) => {
    if (typeof task === 'string') {
      console.log(chalk.bgGreen.cyan(task));
    } else {
      const memo = cache[task.id];
      if (memo?.isSpinning && task.status === 'done') {
        memo.succeed();
      } else {
        cache[task.id] = ora(task.message).start();
      }
    }
  };
};

const makeChalkProxy = (
  memo: any = chalk,
  logger = console.log,
  debugFlag = false,
): typeof chalk => {
  return new Proxy(() => {}, {
    get(_, propKey) {
      if (propKey === 'debug') {
        return makeChalkProxy(memo, logger, true);
      }
      memo = memo[propKey];
      return makeChalkProxy(memo, logger, debugFlag);
    },
    apply(_, __, argArray) {
      const ret = Reflect.apply(memo, memo, argArray);

      if (typeof ret === 'string') {
        const shouldOutput = debugFlag ? process.env.WXPACKUP_DEBUG : false;
        if (!shouldOutput) return;
        logger(ret);
      }
      return ret;
    },
  }) as any;
};

export const log = makeChalkProxy(new Chalk({}));
