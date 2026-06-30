const path = require('path');
const webpack = require('webpack');

module.exports = {
  context: __dirname,
  entry: './src/main.ts',
  target: 'node',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: process.env.NODE_ENV !== 'production' ? 'cheap-module-source-map' : false,
  output: {
    path: path.join(__dirname, '../../dist/apps/api'),
    filename: 'main.js',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          configFile: path.join(__dirname, 'tsconfig.app.json'),
          transpileOnly: true,
        },
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    // pg-native is an optional native addon — not available in the Docker image
    new webpack.IgnorePlugin({ resourceRegExp: /^pg-native$/ }),
  ],
};
