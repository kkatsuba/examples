const ExtractTextPlugin = require("extract-text-webpack-plugin");
const merge = require('webpack-merge');
const baseConfig = require('./base.config.js');

const extractSass = new ExtractTextPlugin({
	filename: '[name].css',
	disable: true
});

module.exports = merge(baseConfig, {
	devtool: 'eval-source-map',
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: extractSass.extract({
					fallback: "style-loader",
					use: [{
						loader: "css-loader",
						options: {
							minimize: false
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
	]
});