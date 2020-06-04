import webpack from 'webpack'
const pack = require('./package.json')

const defaultConfig = {
  mode: 'production',
  devtool: 'source-map',
  entry: './src/engage-voice.js',
  output: {
    filename: 'engage-voice.js',
    library: 'RingCentralEngageVoice',
    libraryTarget: 'umd',
    globalObject: 'this' // fix window undefined issue in node
  },
  externals: {
    axios: {
      commonjs: 'axios',
      commonjs2: 'axios',
      amd: 'axios',
      root: 'axios'
    },
    '@ringcentral/sdk': {
      commonjs: 'RingCentral',
      commonjs2: 'RingCentral',
      amd: 'RingCentral',
      root: 'RingCentral'
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.version': JSON.stringify(pack.version)
    })
  ]
}

export default defaultConfig
