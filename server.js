const fs = require('fs');
const hbs = require('hbs');
const cors = require('cors');
const path = require('path');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const serverConfig = {
	key: fs.readFileSync(path.join(__dirname, 'key.pem')),
	cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
};
const httpsServer = https.createServer(serverConfig, app);

app.set('views', './');
app.set('view engine', 'hbs');
app.set('port', process.env.PORT || 5000);
app.use(express.static(path.join(__dirname, 'push-api/src')));
app.use(express.static(path.join(__dirname, 'WebRTC-Example/src')));
app.use(express.static(path.join(__dirname, 'webvtt')));
if (process.env.NODE_ENV === 'production') {
	app.use(express.static(path.join(__dirname, 'WebRTC-multiroom/dist')));
}

app.use(cors());
app.use(bodyParser.json());

httpsServer.listen(app.get('port'), '0.0.0.0', () => {
	console.log(`Node app is running on https://localhost:${app.get('port')}`);
});

app.get('/', (req, res) => {
	res.render('./index', {
		multiRtcUrl: process.env.NODE_ENV === 'production' ? '/rtc-multi.html' : 'https://localhost:5001'
	});
});

require('./WebRTC-Example/server')(httpsServer);
require('./WebRTC-multiroom/server')();
require('./push-api/server')(app);
