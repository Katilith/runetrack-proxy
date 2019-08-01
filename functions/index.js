const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const requestify = require('requestify');

const app = express();
app.use(cors({ origin: 'https://runetrack.app' }));

app.get('/clans/:clanName', (request, response) => {
	const clanName = request.params['clanName'];
	if(!clanName || !clanName.trim()) {
		response.status(400).send('Bad Request');
		return;
	}

	const url = `http://services.runescape.com/m=clan-hiscores/members_lite.ws?clanName=${ clanName }`;
	requestify.get(url)
		.then(runescapeResponse => response.send(runescapeResponse.body))
		.catch(() => response.status(404).send('Error Fetching Clan Data'));
});

app.get('*', (request, response) => {
	requestify.get('https://apps.runescape.com' + request.url)
		.then(runescapeResponse => response.send(runescapeResponse.body))
		.catch(error => response.send(error));
});

const api = functions.https.onRequest(app);

module.exports = {
	api
};
