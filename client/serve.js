const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackConfig = require('./webpack.config')

const serverConfig = webpackConfig.devServer
const compiler = webpack(webpackConfig)

var firstDone = true
compiler.hooks.done.tap('serve.js', stats => {
    let str
    if (firstDone) {
        str = stats.toString(webpackConfig.stats)
        firstDone = false
    } else {
        str = stats.toString('minimal')
    }

    console.log(str)
})

const devServer = new WebpackDevServer(compiler, serverConfig)
const httpServer = devServer.listen(serverConfig.port, serverConfig.host, err => {
    if (err) {
        console.error(err)
    }
})