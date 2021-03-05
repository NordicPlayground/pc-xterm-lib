const path = require('path');
const webpack = require('webpack');

const config = {
    entry: './src/index.ts',
    target: 'web',
    output: {
        filename: 'index.js',
        library: 'pcXtermLib',
        libraryTarget:'umd',
        path: path.join(__dirname, 'dist'),
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    plugins: [
        // fix "process is not defined" error
        new webpack.ProvidePlugin({
          process: 'process/browser',
        }),
      ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: [/node_modules/],
                use: [
                    {
                        loader: 'ts-loader',
                    },
                ],
            },
        ],
    },
};

module.exports = config;
