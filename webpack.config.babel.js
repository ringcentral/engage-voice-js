import webpack from 'webpack'
const pack = require('./package.json')

const defaultConfig = {
  mode: 'production',
  devtool: 'source-map',
  entry: './src/engage-voice.ts',
  output: {
    filename: 'engage-voice.js',
    library: 'RingCentralEngageVoice',
    libraryTarget: 'umd',
    globalObject: 'this' // fix window undefined issue in node
  },
  resolve: {
    fallback: {
      url: require.resolve('url')
    },
    extensions: ['.tsx', '.ts', '.js']
  },
  externals: {
    axios: {
      commonjs: 'axios',
      commonjs2: 'axios',
      amd: 'axios',
      root: 'axios'
    },
    '@ringcentral/sdk': {
      commonjs: '@ringcentral/sdk',
      commonjs2: '@ringcentral/sdk',
      amd: '@ringcentral/sdk',
      root: 'RingCentral'
    },
    url: {
      commonjs: 'url',
      commonjs2: 'url',
      amd: 'url',
      root: 'url'
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.version': JSON.stringify(pack.version)
    })
  ]
}

export default defaultConfig
