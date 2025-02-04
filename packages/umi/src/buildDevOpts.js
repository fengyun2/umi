import { join, isAbsolute } from 'path';
import { readFileSync, existsSync } from 'fs';
import isWindows from 'is-windows';
import { winPath } from 'umi-utils';
import { parse } from 'dotenv';

export default function(opts = {}) {
  loadDotEnv();

  let cwd = opts.cwd || process.env.APP_ROOT || process.cwd();
  if (cwd) {
    if (!isAbsolute(cwd)) {
      cwd = join(process.cwd(), cwd);
    }
    cwd = winPath(cwd);
    // 原因：webpack 的 include 规则得是 \ 才能判断出是绝对路径
    if (isWindows()) {
      cwd = cwd.replace(/\//g, '\\');
    }
  }

  return {
    cwd,
  };
}

function loadDotEnv() {
  const baseEnvPath = join(process.cwd(), '.env');
  const localEnvPath = `${baseEnvPath}.local`;

  const loadEnv = envPath => {
    if (existsSync(envPath)) {
      const parsed = parse(readFileSync(envPath, 'utf-8'));
      Object.keys(parsed).forEach(key => {
        // eslint-disable-next-line no-prototype-builtins
        if (!process.env.hasOwnProperty(key)) {
          process.env[key] = parsed[key];
        }
      });
    }
  };

  loadEnv(baseEnvPath);
  loadEnv(localEnvPath);
}
