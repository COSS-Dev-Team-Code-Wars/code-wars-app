import axios from 'axios';

const BASE_URL = 'https://judge0-ce.p.rapidapi.com';
const JUDGE_HEADERS = {
	//@ TO DO: Set as environment variables
	'x-rapidapi-key': 'b56512c026msh584397cf9af4f24p1a674cjsn62478e5e9a79',
	'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
};

async function fetchData(options) {
	try {
		const response = await axios.request(options);
		console.log(response.data);
		return response.data;
	} catch (error) {
		console.error(error);
	}
}

const healthCheck = async () => {
	const options = {
		method: 'GET',
		url: `${BASE_URL}/about`,
		headers: JUDGE_HEADERS
	};

	return fetchData(options);
};

const postSubmissions = (data) => {
	const options = {
		url: `${BASE_URL}/submissions`,
		method: 'POST',
		params: {
			base64_encoded: 'false',
		},
		headers: {
			...JUDGE_HEADERS,
			'Content-Type': 'application/json'
		},
		data
	};

	return fetchData(options);
};

const getSubmissions = (submissionToken) => {
	const options = {
		method: 'GET',
		url: `${BASE_URL}/submissions/${submissionToken}`,
		params: {
			base64_encoded: 'true',
		},
		headers: JUDGE_HEADERS
	};

	return fetchData(options);
};

export default { healthCheck, postSubmissions, getSubmissions };