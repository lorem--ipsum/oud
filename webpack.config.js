// const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    oud: './src/app/app.tsx',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: { onlyCompileBundledFiles: true },
          },
        ],
      },
      {
        test: /\.s?css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                require('postcss-preset-env')({
                  browsers: ['> 1%', 'last 3 versions', 'Firefox ESR', 'Opera 12.1'],
                }),
              ],
            },
          },
          { loader: 'sass-loader' },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.scss'],
  },

  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
    libraryTarget: 'umd',
  },

  externals: {
    // '@implydata/little-pictures': '@implydata/little-pictures',
    // '@implydata/beltful': '@implydata/beltful',
    react: 'react',
    'react-dom': 'react-dom',
    three: 'three',
  },

  plugins: [
    // new CopyPlugin(
    //   [{ from: 'caladan-utils.scss', to: '' }, { from: 'styles/**/*.utils.scss', to: '' }],
    //   { context: './src' },
    // ),
  ],
};
