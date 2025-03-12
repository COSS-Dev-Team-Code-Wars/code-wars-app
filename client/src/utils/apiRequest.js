/*
* This file is used to implement API calls.
*/

/* HOW TO USE:

GET REQUESTS
const query = {
	userId: userId
}
async function getUserPosts(userId) {
	await getFetch('https://sample-url', query).then((val) => {})
}

POST/PUT REQUESTS
const newUser = {
	firstName: "Juan",
	lastName: "dela Cruz",
	posts: []
}
function postUser() {
	postFetch('https://sample-url', newUser).then((val) => {})
}

DELETE REQUESTS
function deleteUser() {
	deleteFetch('https://sample-url', userId).then((val) => {})
}
*/



/**
 * Function for fetching with GET requests.
 * @param {String} url contains the base URL.
 * @param {Object} params contains the query.
 * @returns {Promise<Array<Object>>} A promise that contains the data fetched from database.
*/
export async function getFetch(url, params) {

	let newURL = '';

	// If there are parameters given, reconstruct the query string and combine it with the given base url.
	if (params) {
		// reconstruct the query
		const queryString = Object.entries(params).map(param => {
			return `${param[0]}=${param[1]}`;
		}).join('&');

		newURL = `${url}?${queryString}`;
	} else {
		newURL = url;
	}

	// using the fetch function
	return await fetch(newURL, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
			
	}).then((res) => {
		return res.json();

	}).catch((err) => {
		console.error(err);
	});
}


/** Function used for fetching with POST requests.
 * @param {String} url contains the base URL.
 * @param {Object} obj contains information about the data to be inserted into DB.
*/
export async function postFetch(url, obj) {
		
	return fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(obj),
		credentials: 'omit'
	}).then((res) => {
		return res.json();
	}).catch((err) => {
		console.log(err);
	});
}


/** Function used for fetching with PUT requests.
 * @param {String} url contains the base URL.
 * @param {Object} obj contains information about the data to be updated in the DB.
*/
export async function putFetch(url, obj) {

	return fetch(url, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(obj)
		
	}).then((res) => {
		return res.ok;
	});
}


/** Function used for fetching with DELETE requests.
 * @param {String} url contains the base URL.
 * @param {String} id contains the database id of the information to be deleted.
*/
export async function deleteFetch(url, id) {

	return fetch(`${url}${id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		}

	}).then((res) => {
		return res.ok;
	});
}