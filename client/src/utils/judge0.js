import axios from 'axios';

const BASE_URL = 'https://ce.judge0.com';
const JUDGE_HEADERS = {
  'X-Judge0-Client-Id': '71d31de9-f23c-4c16-8267-174c33c8f94a',
  'X-Judge0-Client-Secret': 'd724bbb0-6441-4f15-9831-b1ac7a2ecf59'
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

const postSubmissions = async (data) => {
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

const getSubmissions = async (submissionToken) => {
	if (!submissionToken) {
		console.error('Error: submissionToken is undefined!');
		return null;
	}

	const options = {
		method: 'GET',
		url: `${BASE_URL}/submissions/${submissionToken}`,
		params: {
			base64_encoded: 'false',
		},
		headers: JUDGE_HEADERS
	};

	return fetchData(options);
};

const postBatchSubmissions = async (submissions) => {
	try {
	  const response = await axios.post(`${BASE_URL}/submissions/batch`, 
		{ submissions },  // ✅ Correct batch submission payload
		{
		  params: { base64_encoded: "false" },
		  headers: JUDGE_HEADERS,
		}
	  );
  
	  if (!response.data || !Array.isArray(response.data)) {
		console.error("Unexpected response format:", response.data);
		return null;
	  }
  
	  const tokens = response.data.map(sub => sub.token); // ✅ Extract tokens properly
  
	  return tokens; // ✅ Return array of tokens
	} catch (error) {
	  console.error("Error submitting batch submissions:", error);
	  return null;
	}
  };  

  const getBatchSubmissions = async (tokens) => {
	try {
	  if (!tokens || tokens.length === 0) {
		console.error("No tokens provided for batch fetch.");
		return null;
	  }
  
	  const response = await axios.get(`${BASE_URL}/submissions/batch`, {
		params: {
		  tokens: tokens.join(","), // ✅ Ensure tokens are passed correctly
		  base64_encoded: "false",
		  fields: "token,stdout,stderr,status_id,language_id", // ✅ Correct fields
		},
		headers: JUDGE_HEADERS,
	  });
  
	  if (!response.data || !response.data.submissions || !Array.isArray(response.data.submissions)) {
		console.error("Unexpected response format:", response.data);
		return null;
	  }
  
	  return response.data.submissions; // ✅ Extracts actual results correctly
	} catch (error) {
	  console.error("Error fetching batch results:", error);
	  return null;
	}
  };

export default { healthCheck, postSubmissions, getSubmissions, postBatchSubmissions, getBatchSubmissions };