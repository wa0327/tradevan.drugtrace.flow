import { map, concatMap } from 'rxjs/operators'
import { normalize, dirname, basename, Path } from '@angular-devkit/core'
import { NodeJsSyncHost, createConsoleLogger } from '@angular-devkit/core/node'
import { Workspace } from '@angular-devkit/core/src/workspace'
import { Logger, IndentLogger } from '@angular-devkit/core/src/logger';
import { Architect, BuilderConfiguration, BuilderContext } from '@angular-devkit/architect'
import { BrowserBuilder, BrowserBuilderSchema, NormalizedBrowserBuilderSchema, DevServerBuilderOptions } from '@angular-devkit/build-angular'
import * as webpack from 'webpack'
import * as Server from 'webpack-dev-server'
import { appHook } from './webapi'

const projectDetail = {
    projectRoot: normalize(__dirname),
    projectFile: normalize('angular.json'),
    project: 'app',
    target: 'serve',
    config: ''
}

const host = new NodeJsSyncHost()
const context = getBuilderContext()

// runArchitect()

switch (projectDetail.target) {
    case 'build':
        runBuild()
        break
    case 'serve':
        runServe()
        break
}

function runArchitect() {
    const architect = context.architect
    const builderConfig = architect.getBuilderConfiguration({
        project: projectDetail.project,
        target: projectDetail.target,
        configuration: projectDetail.config
    })
    architect.run(builderConfig, context).subscribe(event => {
        if (event.success) {
            console.log('run successfully.')
        } else {
            console.error('run failed !!!')
        }
    })
}

function runBuild() {
    const workspace = context.workspace
    const architect = context.architect
    const browserConfig = <BuilderConfiguration<BrowserBuilderSchema>>getConfiguration(architect, projectDetail.project, projectDetail.target, projectDetail.config)
    const browserBuilder = new BrowserBuilder(context)
    const webpackConfig = browserBuilder.buildWebpackConfig(workspace.root, projectDetail.projectRoot, host, <NormalizedBrowserBuilderSchema>browserConfig.options)
    const compiler = webpack(webpackConfig)
    compiler.run(((err, stats) => {
        let str = stats.toString({ colors: true })
        console.log(str)
    }))
}

function runServe() {
    const workspace = context.workspace
    const architect = context.architect
    const serverConfig = <BuilderConfiguration<DevServerBuilderOptions>>getConfiguration(architect, projectDetail.project, projectDetail.target, projectDetail.config)
    const [project, target, config] = serverConfig.options.browserTarget.split(':')
    const browserConfig = <BuilderConfiguration<BrowserBuilderSchema>>getConfiguration(architect, project, target, config)
    const browserBuilder = new BrowserBuilder(context)
    const webpackConfig = browserBuilder.buildWebpackConfig(workspace.root, projectDetail.projectRoot, host, <NormalizedBrowserBuilderSchema>browserConfig.options)
    const compiler = webpack(webpackConfig)

    var firstDone = true
    compiler.hooks.done.tap('serve.js', stats => {
        let str
        if (firstDone) {
            str = stats.toString({ colors: true })
            firstDone = false
        } else {
            str = stats.toString('minimal')
        }

        console.log(str)
    })

    const server = new Server(compiler, {
        stats: false,
        after: appHook
    })

    server.listen(serverConfig.options.port, serverConfig.options.host, err => {
        if (err) {
            console.error(err)
        }
    })
}

function getBuilderContext() {
    const logger = createConsoleLogger()
    let context: BuilderContext

    new Workspace(projectDetail.projectRoot, host)
        .loadWorkspaceFromHost(projectDetail.projectFile)
        .subscribe(workspace => {
            new Architect(workspace)
                .loadArchitect()
                .subscribe(architect => {
                    context = {
                        host,
                        logger,
                        workspace,
                        architect
                    }
                })
        })

    return context
}

function getConfiguration(architect: Architect, project: string, target: string, config: string) {
    let builderConfig = architect.getBuilderConfiguration({
        project,
        target,
        configuration: config
    })

    architect
        .getBuilderDescription(builderConfig)
        .pipe(concatMap(builderDescription => architect.validateBuilderOptions(builderConfig, builderDescription)))
        .subscribe(config => {
            builderConfig = config
        })

    return builderConfig
}