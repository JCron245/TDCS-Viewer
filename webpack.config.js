const webpack = require('webpack');
const path = require('path');
const fileSystem = require('fs-extra');
const env = require('./utils/env');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const Dotenv = require('dotenv-webpack');

const ASSET_PATH = process.env.ASSET_PATH || '/';

var alias = {
	'react-dom': '@hot-loader/react-dom',
};

// load the secrets
var secretsPath = path.join(__dirname, 'secrets.' + env.NODE_ENV + '.js');

var fileExtensions = [
	'jpg',
	'jpeg',
	'png',
	'gif',
	'eot',
	'otf',
	'ttf',
	'woff',
	'woff2',
];

if (fileSystem.existsSync(secretsPath)) {
	alias['secrets'] = secretsPath;
}

var options = {
	mode: process.env.NODE_ENV || 'development',
	entry: {
		popup: path.join(__dirname, 'src', 'pages', 'Popup', 'index.tsx'),
	},
	chromeExtensionBoilerplate: {
		notHotReload: ['contentScript', 'devtools'],
	},
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: '[name].bundle.js',
		clean: true,
		publicPath: ASSET_PATH,
	},
	module: {
		rules: [
			{
				// look for .css or .scss files
				test: /\.(css|scss)$/,
				// in the `src` directory
				use: [
					{
						loader: 'style-loader',
					},
					{
						loader: 'css-loader',
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,
						},
					},
				],
			},
			{
				test: new RegExp('.(' + fileExtensions.join('|') + ')$'),
				loader: 'file-loader',
				options: {
					name: '[name].[ext]',
				},
				exclude: /node_modules/,
			},
			{
				test: /\.svg$/,
				use: ['@svgr/webpack', 'file-loader'],
			},
			{
				test: /\.html$/,
				loader: 'html-loader',
				exclude: /node_modules/,
			},
			{ test: /\.(ts|tsx)$/, loader: 'ts-loader', exclude: /node_modules/ },
			{
				test: /\.(js|jsx)$/,
				use: [
					{
						loader: 'source-map-loader',
					},
					{
						loader: 'babel-loader',
					},
				],
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		alias: alias,
		extensions: fileExtensions
			.map((extension) => '.' + extension)
			.concat(['.js', '.jsx', '.ts', '.tsx', '.css', 'scss']),
	},
	plugins: [
		new webpack.ProgressPlugin(),
		// expose and write the allowed env vars on the compiled bundle
		new webpack.EnvironmentPlugin(['NODE_ENV']),
		new Dotenv(),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: 'src/manifest.json',
					to: path.join(__dirname, 'build'),
					force: true,
					transform: function (content, path) {
						// generates the manifest file using the package.json information
						return Buffer.from(
							JSON.stringify({
								description: process.env.npm_package_description,
								version: process.env.npm_package_version,
								...JSON.parse(content.toString()),
							})
						);
					},
				},
			],
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: 'src/assets/img/tdcs-viewer128.png',
					to: path.join(__dirname, 'build'),
					force: true,
				},
			],
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: 'src/assets/img/tdcs-viewer34.png',
					to: path.join(__dirname, 'build'),
					force: true,
				},
			],
		}),
		new HtmlWebpackPlugin({
			template: path.join(__dirname, 'src', 'pages', 'Popup', 'index.html'),
			filename: 'popup.html',
			chunks: ['popup'],
			cache: false,
		}),
	],
	infrastructureLogging: {
		level: 'info',
	},
};

if (env.NODE_ENV === 'development') {
	options.devtool = 'cheap-module-source-map';
} else {
	options.optimization = {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				extractComments: false,
			}),
		],
	};
}

module.exports = options;
