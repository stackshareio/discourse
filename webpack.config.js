const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const {DefinePlugin} = webpack;

const PRODUCTION = process.env.NODE_ENV === 'production';

if (!PRODUCTION) {
  require('dotenv').config({path: '.env'});
}

const dist = path.resolve(__dirname, 'out');

const entry = {
  analytics: ['./app/analytics.js'],
  sentry: ['./app/sentry.js'],
  maharo: ['./maharo/index.js'],
  legacy: [
    './app/polyfills.js',
    './app/bundles/legacy/startup/fetch-polyfill.js',
    './app/bundles/legacy/startup/react_on_rails-polyfill.js',
    './app/bundles/legacy/components/track/track.js',
    './app/bundles/legacy/components/shared/util/util.js',
    './app/bundles/legacy/components/notifications/notifications.js',
    './app/bundles/legacy/startup/clientRegister.jsx'
  ],
  api: ['./app/banner.js', './app/polyfills.js', './app/bundles/api/startup/register.js'],
  feed: ['./app/banner.js', './app/polyfills.js', './app/bundles/feed/startup/register.js'],
  'feed-mobile': ['./app/polyfills.js', './app/bundles/feed/startup/register-mobile.js'],
  'stack-profile': ['./app/polyfills.js', './app/bundles/stack-profile/startup/register.js'],
  'stack-profile-mobile': [
    './app/polyfills.js',
    './app/bundles/stack-profile/startup/register-mobile.js'
  ],
  stackups: ['./app/polyfills.js', './app/bundles/stackups/startup/register.js'],
  'stackups-mobile': ['./app/polyfills.js', './app/bundles/stackups/startup/register-mobile.js'],
  'tool-profile': ['./app/polyfills.js', './app/bundles/tool-profile/startup/register.js'],
  'tool-profile-mobile': [
    './app/polyfills.js',
    './app/bundles/tool-profile/startup/register-mobile.js'
  ],
  'long-form-content': [
    './app/polyfills.js',
    './app/bundles/long-form-content/startup/register.js'
  ],
  'long-form-content-mobile': [
    './app/polyfills.js',
    './app/bundles/long-form-content/startup/register-mobile.js'
  ],
  'tool-stackups': ['./app/polyfills.js', './app/bundles/tool-stackups/startup/register.js'],
  'tool-stackups-mobile': [
    './app/polyfills.js',
    './app/bundles/tool-stackups/startup/register-mobile.js'
  ],
  'tool-alternatives': [
    './app/polyfills.js',
    './app/bundles/tool-alternatives/startup/register.js'
  ],
  'tool-alternatives-mobile': [
    './app/polyfills.js',
    './app/bundles/tool-alternatives/startup/register-mobile.js'
  ],
  site: ['./app/polyfills.js', './app/bundles/site/startup/register.js'],
  'approval-tool': ['./app/polyfills.js', './app/bundles/approval-tool/startup/register.js'],
  home: ['./app/polyfills.js', './app/bundles/home/startup/register.js'],
  alternatives: ['./app/polyfills.js', './app/bundles/alternatives/startup/register.js'],
  'alternatives-mobile': [
    './app/polyfills.js',
    './app/bundles/alternatives/startup/register-mobile.js'
  ],
  'company-profile': ['./app/polyfills.js', './app/bundles/company-profile/startup/register.js'],
  'company-profile-mobile': [
    './app/polyfills.js',
    './app/bundles/company-profile/startup/register-mobile.js'
  ],
  'company-team': ['./app/polyfills.js', './app/bundles/company-team/startup/register.js'],
  'company-team-mobile': [
    './app/polyfills.js',
    './app/bundles/company-team/startup/register-mobile.js'
  ],
  jobs: ['./app/polyfills.js', './app/bundles/jobs/startup/register.js'],
  'jobs-mobile': ['./app/polyfills.js', './app/bundles/jobs/startup/register-mobile.js'],
  'api-dashboard': ['./app/polyfills.js', './app/bundles/api-dashboard/startup/register.js'],
  'api-dashboard-mobile': [
    './app/polyfills.js',
    './app/bundles/api-dashboard/startup/register-mobile.js'
  ],
  stacks: ['./app/polyfills.js', './app/bundles/stacks/startup/register.js'],
  'stacks-mobile': ['./app/polyfills.js', './app/bundles/stacks/startup/register-mobile.js'],
  'private-dashboard': [
    './app/polyfills.js',
    './app/bundles/private-dashboard/startup/register.js'
  ],
  'private-dashboard-mobile': [
    './app/polyfills.js',
    './app/bundles/private-dashboard/startup/register-mobile.js'
  ],
  'team-profile': ['./app/polyfills.js', './app/bundles/team-profile/startup/register.js'],
  'team-profile-mobile': [
    './app/polyfills.js',
    './app/bundles/team-profile/startup/register-mobile.js'
  ]
};

class NameAllModulesPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('NameAllModulesPlugin', compilation => {
      compilation.hooks.beforeModuleIds.tap('NameAllModulesPlugin', modules => {
        for (const module of modules) {
          if (module.id === null) {
            module.id = module.identifier();
          }
        }
      });
    });
  }
}

const plugins = [
  new DefinePlugin({
    'process.env.SENTRY_RELEASE': JSON.stringify(process.env.SENTRY_RELEASE),
    'process.env': 'window.env'
  }),
  new NameAllModulesPlugin(),
  new ManifestPlugin({writeToFileEmit: true})
];

const asyncVendors = ['react-rte', 'snapsvg', 'showdown', 'uploadcare-widget', 'react-popper'];

let config = {
  mode: PRODUCTION ? 'production' : 'development',
  devtool: PRODUCTION ? 'source-map' : 'eval-source-map',

  optimization: {
    nodeEnv: PRODUCTION ? 'production' : 'development',
    runtimeChunk: 'single',
    splitChunks: {
      minSize: 1,
      cacheGroups: {
        vendor: {
          test: c =>
            c.context &&
            c.context.includes('/node_modules/') &&
            !asyncVendors.find(m => c.context.includes(m)),
          name: 'vendor',
          chunks: 'all'
        },
        common: {
          name: 'common',
          chunks: 'initial',
          minChunks: 2
        }
      }
    },
    minimizer: [new TerserPlugin({sourceMap: true})]
  },

  entry,

  output: {
    path: dist,
    filename: PRODUCTION ? '[name].[contenthash].js' : '[name].js'
    //NOTE: publicPath is dynamically set at runtime via WEBPACK_PUBLIC_PATH env var on the rails server
  },

  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx', '.mjs', '*'],
    alias: {
      'react-dom': '@hot-loader/react-dom'
    }
  },

  plugins,

  module: {
    noParse: [/moment.js/], // this prevents the locales from being pulled in
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader']
      },
      {
        test: require.resolve('snapsvg'),
        loader: 'imports-loader?this=>window,fix=>module.exports=0'
      },
      {
        test: /\.png$/,
        loader: 'url-loader',
        options: {
          limit: 256000
        }
      }
    ]
  },
  externals: {
    jquery: 'jQuery'
  }
};

module.exports = config;
