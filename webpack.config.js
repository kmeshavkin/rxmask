const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/rxmask.js',
  output: {
    path: path.resolve(__dirname, 'src'),
    filename: 'rxmask.min.js'
  },
  mode: 'production'
};
