const path = require('path')
const webpack = require('webpack')
const webpackDevServerPath = require.resolve('webpack-dev-server/client')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: {
        main: [
            `${webpackDevServerPath}?http://0.0.0.0:0`,
            './src/main.ts'
        ],
        polyfills: './src/polyfills.ts'
    },
    module: {
        rules: [{
            test: /\.ts$/,
            use: ['ts-loader']
        }]
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new CopyWebpackPlugin([
            'src/index.html',
            'src/favicon.ico',
            'src/styles-cy.css',
            'node_modules/jquery/dist/jquery.js'
        ]),
        new webpack.ProgressPlugin({
            profile: false,
            color: true
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css'
        })
    ],
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    stats: {
        colors: true
    },
    devServer: {
        publicPath: '/',
        host: '10.37.129.2',
        port: 8080,
        contentBase: false,
        stats: false
    }
}