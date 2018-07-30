const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const merge = require('webpack-merge');
const baseConfig = require('./base.config.js');

const extractSass = new ExtractTextPlugin({
	filename: '[name].css',
	disable: false
});

module.exports = merge(baseConfig, {
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: extractSass.extract({
					fallback: "style-loader",
					use: [{
						loader: "css-loader",
						options: {
							minimize: true
						}
					},
						"sass-loader"
					]
				})
			}
		]
	},
	plugins: [
		extractSass
	],
	optimization: {
		minimizer: [
			new UglifyJsPlugin({
				sourceMap: true,
				uglifyOptions: {
					compress: {
						inline: false,
						warnings: false,
						drop_console: true,
						unsafe: true
					},
				},
			}),
		],
	}
});
