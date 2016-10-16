// http://webpack.github.io/docs/configuration.html
// http://webpack.github.io/docs/webpack-dev-server.html
var app_root = 'src'; // the app root folder: src, src_users, etc
var path = require('path');
module.exports = {
    app_root: app_root, // the app root folder, needed by the other webpack configs
    entry: [
        // http://gaearon.github.io/react-hot-loader/getstarted/
        'webpack-dev-server/client?http://localhost:8080',
        'webpack/hot/only-dev-server',
        __dirname + '/' + app_root + '/index.js',
    ],
    output: {
        path: __dirname + '/public/js',
        publicPath: 'js/',
        filename: 'bundle.js',
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules/,
            },
            {
                // https://github.com/jtangelder/sass-loader
                test: /\.scss$/,
                loaders: ['style', 'css', 'sass'],
            }
        ],
    },
    devServer: {
        contentBase: __dirname + '/public',
    },
    plugins: [],
};