// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
var store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})
			.catch(error => {
				console.error("Error retrieving data from Get Tracks API: " + error)
			})

		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
			.catch(error => {
				console.error("Error rendering racer cars: " + error);
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
		}

		// Podracer form field
		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()
	
			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate(target)
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	// console.log("Inside method handleCreateRace...");

	// TODO - Get player_id and track_id from the store
	const trackId = store.track_id;
	const playerId = store.player_id;

	// render starting UI
	const tracksInfo = await getTracks();
	const raceTrackInfo = tracksInfo.filter(aTrack => aTrack.id == trackId)[0];
	renderAt('#race', renderRaceStartView(raceTrackInfo, [playerId]))

	
	// const race = TODO - invoke the API call to create the race, then save the result
	const race = await createRace(playerId, trackId);

	// TODO - update the store with the race id
	// Server Bug? Race ID always returning as ID + 1.
	store.race_id = race.ID - 1;

	// The race has been created, now start the countdown
	// TODO - call the async function runCountdown
	await runCountdown()

	// TODO - call the async function startRace
	// console.log("Starting race now...");
	// console.log("\tRace ID: " + store.race_id);
	await startRace(store.race_id);

	// TODO - call the async function runRace
	console.log("Running race now...");
	// console.log("\tRace ID: " + store.race_id);
	await runRace(store.race_id);
}

function runRace(raceID) {
	return new Promise(resolve => {
		// TODO - use Javascript's built in setInterval method to get race info every 500ms
		const raceInterval = setInterval(async function(){
			console.log("Run Race Interval")
			const raceInfo = await getRace(raceID);
			/*
			TODO - if the race info status property is "in-progress", update the leaderboard by calling:
			renderAt('#leaderBoard', raceProgress(res.positions))
			*/
			if (raceInfo.status == "in-progress") {
				console.log("\tRace is in progress! Rendering leaderboard...");
				renderAt('#leaderBoard', raceProgress(raceInfo.positions))
			} else if (raceInfo.status == "finished") {
				/*
					TODO - if the race info status property is "finished", run the following:

					clearInterval(raceInterval) // to stop the interval from repeating
					renderAt('#race', resultsView(res.positions)) // to render the results view
					reslove(res) // resolve the promise
				*/
				clearInterval(raceInterval);
				renderAt('#race', resultsView(raceInfo.positions)) // to render the results view
				resolve(raceInfo) // resolve the promise
			} else {
				throw new Error("Unexpected race status: " + raceInfo.status);
			}

		}, 500);
	}).catch(err => {
		// remember to add error handling for the Promise
		console.error("Error encountered in runRace: " + err);
	})
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return new Promise(resolve => {
			// TODO - use Javascript's built in setInterval method to count down once per second
			const newInterval = setInterval(function(){
				if (timer > 0) {
					// run this DOM manipulation to decrement the countdown for the user
					document.getElementById('big-numbers').innerHTML = --timer;
				} else {
					// TODO - if the countdown is done, clear the interval, resolve the promise, and return
					clearInterval(newInterval);
					resolve(true);
				}
				// alert("Hello"); 
			}, 1000);
		})
	} catch(error) {
		console.error(error);
	}
}

function handleSelectPodRacer(target) {
	console.log("selected a pod", target.id)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected racer to the store
	store.player_id = parseInt(target.id);
}

function handleSelectTrack(target) {
	console.log("selected a track", target.id)

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected track id to the store
	store.track_id = target.id;
	
}

function handleAccelerate() {
	console.log("accelerate button clicked")
	// TODO - Invoke the API call to accelerate
	console.log("Calling method accelerate...");
	accelerate(store.race_id);
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer

	return `
		<li class="card podracer" id="${id}">
			<h3>${driver_name}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
		</li>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name } = track

	return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	console.log("Inside method renderRaceStartView...");
	console.log("Track = " + JSON.stringify(track));
	return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	console.log("Inside method raceProgress...");
	let userPlayer = positions.find(e => e.id === store.player_id)

	console.log("\tPositions = " + JSON.stringify(positions));
	console.log("\tPlayer ID = " + store.player_id);
	console.log("\tUser player = " + userPlayer);
	userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints 

async function getTracks() {
	// GET request to `${SERVER}/api/tracks`

	return new Promise((resolve, reject) => {
		return fetch (`${SERVER}/api/tracks`)
		.then(result => {
			return result.json();
		})
		.then(data => {
			resolve(data);
		})
		.catch(error => {
			console.error("Error while querying tracks data from Server API: " + error);
			// throw new Error(error);
		})
	})
}

async function getRacers() {
	// GET request to `${SERVER}/api/cars`

	return new Promise((resolve, reject) => {
		return fetch (`${SERVER}/api/cars`)
		.then(result => {
			return result.json();
		})
		.then(data => {
			resolve(data);
		})
		.catch(error => {
			console.error("Error while querying cars data from Server API: " + error);
			// throw new Error(error);
		})
	})

}

async function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }
	console.log(JSON.stringify(body));
	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body)
	})
	.then(res => res.json())
	.catch(err => console.log("Problem with createRace request::", err))
}

async function getRace(id) {
	// GET request to `${SERVER}/api/races/${id}`

	return new Promise((resolve, reject) => {
		return fetch (`${SERVER}/api/races/${id}`)
		.then(result => {
			return result.json();
		})
		.then(data => {
			resolve(data);
		})
		.catch(error => {
			console.error("Error while querying races data from Server API: " + error);
			// throw new Error(error);
		})
	})

}

function startRace(id) {
	// start service does not return anything. So no need to capture results.
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
	.catch(err => console.log("Problem with getRace request::", err))
}

function accelerate(id) {
	// POST request to `${SERVER}/api/races/${id}/accelerate`
	// options parameter provided as defaultFetchOpts
	// no body or datatype needed for this request
	console.log("Inside method accelerate...");
	console.log("Race ID = " + id);
	return fetch(`${SERVER}/api/races/${id}/accelerate`, {
		method: 'POST',
		...defaultFetchOpts()
	})
	.then(res => res.json())
	.catch(err => console.log("Problem with accelerate request::", err))
}
