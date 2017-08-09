const autoprefixer = require('autoprefixer')

const config = {
  extractCSS: process.env.NODE_ENV === 'production',
  preserveWhitespace: false,
  postcss: [
    autoprefixer({
      browsers: ['last 3 versions'],
    }),
  ],
}

module.exports = config
