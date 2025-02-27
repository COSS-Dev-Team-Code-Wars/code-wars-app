/* eslint-disable */ 
import { ConfirmWindow } from 'components';
import { postFetch } from './apiRequest';
import { baseURL } from './constants';


/**
 * Purpose: Takes in the admin's password and verifies in the server if it is correct.
 * Params: <String> title - title for the confirmation window
 */
export const enterAdminPassword = async ({ title }) => {
	// Swal with two textfields and a prompt to copy
	const { value: formValues } = await ConfirmWindow.fire({
		title: `${title}`,
		input: "password",
		inputLabel: "Enter admin password to confirm action:",
		inputAttributes: {
			autocorrect: "off",
			autocapitalize: "off"
		},
		inputValidator: (value) => {
			if (!value) {
				return "Please input a valid password.";
			}
		}
	});

	let passwordVerify = async (pw) => {
		// admin login POST request
		const loginResponse = await postFetch(`${baseURL}/login`, {
			username: 'admin',
			password: pw
		});

		if (!loginResponse.success) {
			return false;
		} else {
			return true;
		}
	};

	if (formValues) {
		return passwordVerify(formValues);
	}
};

