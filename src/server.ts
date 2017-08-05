// Enable sourcemap support of of Node.js
if (process.env.NODE_ENV !== 'production') {
  // tslint:disable-next-line:no-var-requires
  require('source-map-support').install();
}

import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as LRU from 'lru-cache';
import * as express from 'express';
import * as favicon from 'serve-favicon';
import * as compression from 'compression';
import { createBundleRenderer } from 'vue-server-renderer';

import { setupDevServer as SDS } from './build/setup-dev-server';

const isProd = process.env.NODE_ENV === 'production';
const useMicroCache = process.env.MICRO_CACHE !== 'false';

// tslint:disable:no-var-requires
const serverInfo = `express/${require('express/package.json').version} ` +
  `vue-server-renderer/${require('vue-server-renderer/package.json').version}`;
// tslint:enable:no-var-requires

const app = express();

const htmlTemplate = readFileSync(resolve(__dirname, './index.template.html'));

function createRenderer (bundle: string, options: any) {
  return createBundleRenderer(bundle, {
    ...options,
    template: htmlTemplate,
    cache: LRU({
      max: 1000,
      maxAge: 1000 * 60 * 15,
    }),
    basedir: resolve(__dirname, './dist'),
    runInNewContext: false,
  });
}

// HACK: Get the type of the `bundleRenderer`
const bundleRendererInstanceForGetType = true ? undefined as never : createRenderer('', {});
type BundleRenderer = typeof bundleRendererInstanceForGetType;

let renderer: BundleRenderer;
let readyPromise: Promise<{}>;

if (isProd) {
  // tslint:disable:no-var-requires
  const bundle = require('./dist/vue-ssr-server-bundle.json');
  const clientManifest = require('./dist/vue-ssr-client-manifest.json');
  // tslint:enable:no-var-requires

  renderer = createRenderer(bundle, {
    clientManifest,
  });
} else {
  // tslint:disable-next-line:no-var-requires
  const setupDevServer: typeof SDS = require('./build/setup-dev-server');
  readyPromise = setupDevServer(
    app,
    (bundle: string, options: any) => {
      renderer = createBundleRenderer(bundle, options);
    },
  );
}

const serve = (path: string, cache: boolean) => express.static(
  resolve(__dirname, path),
  {
    maxAge: cache && isProd ? 1000 * 60 * 60 * 24 * 30 : 0,
  },
);

app.use(compression({ threshold: 0 }));
app.use(favicon('./public/logo-48.png'));
app.use('/dist', serve('./dist', true));
app.use('/public', serve('../public', true));
app.use('/manifest.json', serve('./manifest.json', true));
app.use('/service-worker.js', serve('./dist/service-worker.js', false));

// 1-second microcache.
// See: https://www.nginx.com/blog/benefits-of-microcaching-nginx/
const microCache = LRU({
  max: 100,
  maxAge: 1000,
});

const isCacheable = (req: express.Request) => useMicroCache;

function render (req: express.Request, res: express.Response) {
  const timestamp = Date.now();

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Server', serverInfo);

  const handleError = (error: any) => {
    if (error.url) {
      res.redirect(error.url);
    } else if (error.code === 404) {
      res.status(404).end('404 | Page Not Found');
    } else {
      // Render Error Page or Redirect
      res.status(500).end('500 | Internal Server Error');
      console.error(`error during render : ${req.url}`);
      console.error(error.stack);
    }
  };

  const cacheable = isCacheable(req);
  if (cacheable) {
    const hit = microCache.get(req.url);
    if (hit) {
      if (!isProd) {
        console.log(`cache hit!`);
      }

      return res.end(hit);
    }
  }

  const context = {
    title: 'Vue SSR HN 2.0 with Typescript', // For the default title
    url: req.url,
  };

  renderer.renderToString(
    context,
    (err, html) => {
      if (err) {
        return handleError(err);
      }
      res.end(html);
      if (cacheable) {
        microCache.set(req.url, html);
      }
      if (!isProd) {
        console.log(`whole request: ${Date.now() - timestamp}ms`);
      }
    },
  );
}

app.get(
  '*',
  isProd ?
    render :
    (req: express.Request, res: express.Response) => {
      readyPromise.then(() => render(req, res));
    },
);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`server started at localhost:${port}`);
});
