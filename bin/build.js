const chalk = require('chalk'),
  fs = require('fs-extra-promise'),
  path = require('path'),
  webpack = require('webpack'),
  WebpackDevServer = require('webpack-dev-server')

/**
 * Copies config files to the widget folder
 * This method is synchronous
 * @returns {Promise}
 */
const copyConfigFiles = () => {
  const configFolder = path.join(
    process.cwd(),
    'node_modules/kambi-widget-core-library/widget_config/'
  )

  // files with special handling

  // gitignore, we need to rename it to .gitignore (npm strips .gitignore)
  filePath = path.join(configFolder, 'gitignore')
  if (fs.existsSync(filePath)) {
    const fileDest = path.join(process.cwd(), '.gitignore')
    fs.copySync(filePath, fileDest)
  }

  // mockSetupData.json, we need to copy it to /src/ and only if it doesn't exist
  filePath = path.join(configFolder, 'mockSetupData.json')
  if (fs.existsSync(filePath)) {
    const fileDest = path.join(process.cwd(), '/src/mockSetupData.json')
    if (!fs.existsSync(fileDest)) {
      fs.copySync(filePath, fileDest)
    }
  }

  return Promise.resolve()
}

/**
 * Deletes distribution folder recursively
 * @returns {Promise}
 */
const clean = () => {
  return copyConfigFiles().then(() =>
    fs.removeAsync(path.join(process.cwd(), 'dist'))
  )
}

clean.config = {
  name: 'clean',
  description: 'Removes build files',
}

/**
 * Starts a development server for widget.
 * @returns {Promise}
 */
const start = opt => {
  process.env.NODE_ENV = 'development'
  console.log(chalk.cyan('Starting the development server...'))

  const port = opt.options.port || 8080

  return copyConfigFiles().then(() => {
    const compiler = webpack(require('../webpack/webpack.config.js')) // eslint-disable-line

    const devServer = new WebpackDevServer(compiler, compiler.options.devServer)

    devServer.use(devServer.middleware)

    // Launch WebpackDevServer
    return new Promise((resolve, reject) => {
      devServer.listen(port, (err, result) => {
        if (err) {
          reject(err)
          return
        }
        // resolve(); if we resolve the server closes
      })
    })
  })
}

start.config = {
  name: 'start',
  description: 'Starts a development server',
  options: [['p', 'port=ARG', 'Listening port (default 8080)']],
}

/**
 * Builds a distributable package of widget.
 * @returns {Promise}
 */
const build = () => {
  process.env.NODE_ENV = 'production'
  return clean()
    .then(() => copyConfigFiles())
    .then(() => {
      return new Promise((resolve, reject) => {
        const config = require('../webpack/webpack.config.js') // eslint-disable-line

        const compiler = webpack(config)

        compiler.run((err, stats) => {
          if (err) {
            reject(err)
            return
          }

          process.stdout.write(
            stats.toString({ colors: true, errors: false }) + '\n'
          )

          if (stats.compilation.errors.length > 0) {
            reject(
              new Error(
                'Exiting due to compilation errors:\n\n' +
                  stats.compilation.errors.join('\n')
              )
            )
            return
          }
          setTimeout(() => {
            // gives some time for webpack-bundle-analyzer to process the report.html
            resolve(compiler)
          }, 3000)
        })
      })
    })
}

build.config = {
  name: 'build',
  description: 'Builds widget for production',
}

module.exports = [clean, build, start]
