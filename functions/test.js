const express = require('express');
const cors = require('cors');
const requestify = require('requestify');

const app = express();
app.use(cors({ origin: true }));

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

app.listen(8080, () => console.log('Test app listening on port 8080'));
