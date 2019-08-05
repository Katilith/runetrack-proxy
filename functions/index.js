const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const requestify = require('requestify');

const app = express();
app.use(cors({ origin: 'https://runetrack.app' }));

function validPlayerName(playerName) {
	return /^[a-zA-Z0-9 -]{1,12}$/.test(playerName);
}

app.get('/clans/:clanName', (request, response) => {
	const clanName = request.params['clanName'];
	if(!clanName || !clanName.trim()) {
		response.status(400).send('Bad Request');
		return;
	}

	requestify.get(`http://services.runescape.com/m=clan-hiscores/members_lite.ws?clanName=${ clanName }`)
		.then(runescapeResponse => response.send(runescapeResponse.body))
		.catch(() => response.status(404).send('Error Fetching Clan Data'));
});

app.get('/profiles/:playerName/skills/:skillId', (request, response) => {
	const playerName = request.params['playerName'];
	const skillIdStr = request.params['skillId'];
	if(!playerName || !playerName.trim() || !skillIdStr || !skillIdStr.trim() || !validPlayerName(playerName)) {
		response.status(400).send('Bad Request');
		return;
	}

	const skillId = parseInt(skillIdStr);
	if(isNaN(skillId)) {
		response.status(400).send('Bad Request');
		return;
	}

	requestify.get(`https://apps.runescape.com/runemetrics/xp-monthly?searchName=${ playerName }&skillid=${ skillId }`)
		.then(runescapeResponse => response.send(runescapeResponse.body))
		.catch(error => response.send(error));
});

app.get('/profiles/:playerName/quests', (request, response) => {
	const playerName = request.params['playerName'];
	if(!playerName || !playerName.trim() || !validPlayerName(playerName)) {
		response.status(400).send('Bad Request');
		return;
	}

	requestify.get(`https://apps.runescape.com/runemetrics/quests?user=${ playerName }`)
		.then(runescapeResponse => response.send(runescapeResponse.body))
		.catch(error => response.send(error));
});

app.get('/profiles/:playerName/clan', (request, response) => {
	const playerName = request.params['playerName'];
	if(!playerName || !playerName.trim() || !validPlayerName(playerName)) {
		response.status(400).send('Bad Request');
		return;
	}

	requestify.get(`http://services.runescape.com/m=website-data/playerDetails.ws?names=["${ playerName }"]&callback=jQuery000000000000000_0000000000&_=0`)
		.then(runescapeResponse => {
			let body = runescapeResponse.body;
			if(!body || body.indexOf('jQuery000000000000000_0000000000([') === -1) {
				response.status(500).send('Unknown Error');
				return;
			}

			body = body.substring('jQuery000000000000000_0000000000(['.length, body.length - 4);

			const clanDetails = JSON.parse(body);
			if(clanDetails.hasOwnProperty('isSuffix')) {
				clanDetails.isSuffix = undefined;
			}

			if(clanDetails.hasOwnProperty('title')) {
				clanDetails.title = undefined;
			}

			response.send(clanDetails);
		})
		.catch(error => response.send(error));
});

app.get('/profiles/:playerName', (request, response) => {
	const playerName = request.params['playerName'];
	if(!playerName || !playerName.trim() || !validPlayerName(playerName)) {
		response.status(400).send('Bad Request');
		return;
	}

	requestify.get(`https://apps.runescape.com/runemetrics/profile/profile?user=${ playerName }&activities=20`)
		.then(runescapeResponse => response.send(runescapeResponse.body))
		.catch(error => response.send(error));
});

const api = functions.https.onRequest(app);

module.exports = {
	api
};
