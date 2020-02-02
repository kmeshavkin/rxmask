const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: {
    rxmask: './src/rxmask.ts',
    'rxmask.min': './src/rxmask.ts'
  },
  output: {
    path: path.resolve(__dirname, 'src'),
    filename: '[name].js'
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        include: /\.min\.js$/
      })
    ]
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        include: /src/
      }
    ]
  },
  mode: 'production'
};
