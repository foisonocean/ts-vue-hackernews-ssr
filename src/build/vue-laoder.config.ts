import * as autoprefixer from 'autoprefixer';

export default {
  extractCSS: process.env.NODE_ENV === 'production',
  preserveWhitespace: false,
  postcss: [
    autoprefixer({
      browsers: ['last 3 versions'],
    }),
  ],
};
