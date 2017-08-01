// Enable sourcemap support of of Node.js
if (process.env.NODE_ENV !== 'production') {
  // tslint:disable-next-line:no-var-requires
  require('source-map-support').install();
}

import * as fs from 'fs';
import { resolve } from 'path';
import * as LRU from 'lru-cache';
import * as express from 'express';
import * as favicon from 'serve-favicon';
import * as compression from 'compression';
import { createBundleRenderer } from 'vue-server-renderer';

(function () {
  const a = [
    fs,
    resolve,
    LRU,
    express,
    favicon,
    compression,
    createBundleRenderer,
  ];
  console.log(a);
})();
