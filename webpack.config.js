const HTMLWebpackPlugin = require('html-webpack-plugin');

const babel_loader = {
  loader: 'babel-loader',
  options: {
    presets: [
      '@babel/preset-env',
      '@babel/preset-react',
    ],
    plugins: [
      ['import', {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
      }],
    ],
  },
};

const less_loader = {
  loader: 'less-loader',
  options: {
    javascriptEnabled: true,
  },
};

module.exports = {
  entry: './app',
  output: { filename: '[name].[hash:8].js' },
  devServer: {
    contentBase: 'app',
  },
  watchOptions: {
    ignored: /node_modules/,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: babel_loader,
        exclude: /node_modules/,
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', less_loader],
      },
    ],
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: 'app/index.html',
    }),
  ],
};
