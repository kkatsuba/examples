const argv = require('yargs').argv;

const isProd = argv.mode === 'production';

module.exports = (env) => {
	if (isProd) {
		return require('./webpack/prod.config.js')		
	} 

	return require('./webpack/dev.config.js');
};
