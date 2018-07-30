const path = require("path");
const argv = require('yargs').argv;
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const isProd = argv.mode === 'production';

module.exports = {
	context: path.resolve(__dirname, "../app"),
	resolve: {
		extensions: [".js", ".jsx"]
	},
	entry: "./index.jsx",
	output: {
		path: path.resolve(__dirname, '../dist')
	},
	module: {
		rules: [
			{
				enforce: 'pre',
				test: /\.js[x]$/,
				exclude: /node_modules/,
				loader: 'eslint-loader',
				options: {
					configFile: '.eslintrc',
					failOnWarning: false,
					failOnError: false
				}
			},
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: [{
					loader: "babel-loader"
				}]
			},
			{
				test: /\.(ttf|eot|svg|woff|png)$/,
				loader: "file-loader",
				options: {
					name: "[path][name].[ext]?[hash]"
				}
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: "rtc",
			hash: true,
			template: path.resolve(__dirname, "../app/index.html"),
			filename: isProd ? 'rtc-multi.html' : 'index.html'
		}),
		new webpack.HotModuleReplacementPlugin()
	],
	devServer: {
		port: 5001,
		hot: true,
		open: true
	}
};