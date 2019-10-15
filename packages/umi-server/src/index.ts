import { join } from 'path';
import { nodePolyfill, patchDoctype } from './utils';

export interface IConfig {
  root?: string;
  manifest?: string;
  filename?: string;
  /** default false */
  polyfill?: boolean;
  runInMockContext?: {};
  // use renderToStaticMarkup
  staticMarkup?: boolean;
  // htmlSuffix
  htmlSuffix?: boolean;
  // modify render html function
}

export interface IContext {
  req: {
    url: string;
  };
}

export interface IResult {
  ssrHtml: string;
  matchPath: string;
}

type IServer = (config: IConfig) => (ctx: IContext) => Promise<IResult>;

const server: IServer = config => {
  const {
    root,
    manifest = join(root, 'ssr-client-mainifest.json'),
    filename = join(root, 'umi.server'),
    staticMarkup = false,
    runInMockContext = {},
    polyfill = false,
  } = config;
  nodePolyfill(polyfill)('http://localhost', runInMockContext);
  // eslint-disable-next-line import/no-dynamic-require
  const serverRender = require(filename);
  const { ReactDOMServer } = serverRender;

  return async ctx => {
    const {
      req: { url },
    } = ctx;

    const { htmlElement, rootContainer, matchPath } = await serverRender.default(ctx);
    const ssrHtml = patchDoctype(
      ReactDOMServer[staticMarkup ? 'renderToStaticMarkup' : 'renderToString'](htmlElement),
    );
    // enable render rootContainer
    // const ssrHtmlElement =
    return {
      ssrHtml,
      matchPath,
    };
  };
};

export { server as default };
