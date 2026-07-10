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
        loader: 'swc-loader',
        options: {
          jsc: {
            parser: { syntax: 'typescript', decorators: true },
            transform: { legacyDecorator: true, decoratorMetadata: true },
            keepClassNames: true,
            target: 'es2021',
          },
          module: { type: 'commonjs' },
        },
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    // pg-native is an optional native addon — not available in the Docker image
    new webpack.IgnorePlugin({ resourceRegExp: /^pg-native$/ }),
    // @nestjs/microservices is an optional peer dep of @nestjs/core, unused here
    new webpack.IgnorePlugin({ resourceRegExp: /^@nestjs\/microservices(\/.*)?$/ }),
    // class-transformer/storage is an optional require in @nestjs/mapped-types, not present in class-transformer@0.5.1
    new webpack.IgnorePlugin({ resourceRegExp: /^class-transformer\/storage$/ }),
    // ws optional native addons, not installed
    new webpack.IgnorePlugin({ resourceRegExp: /^(bufferutil|utf-8-validate)$/ }),
  ],
};
