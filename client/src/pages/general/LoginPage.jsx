/* eslint-disable */ 
import { useContext, useState } from 'react';

import KeyIcon from '@mui/icons-material/Key';
import PersonIcon from '@mui/icons-material/Person';
import {
	Box,
	TextField,
	Button,
	Stack,
	Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import LoginBackground from 'assets/LoginBG.png';
import { SponsorCarousel } from 'components/index.js';
import { baseURL } from 'utils/constants';
import { postFetch } from 'utils/apiRequest';
import Cookies from "universal-cookie";

/*
 * Purpose: Displays the login page for all users.
 * Params: None
 */
const LoginPage = () => {
	// state for the username textfield
	const [username, SetUsername] = useState('');
	// state for the password textfield
	const [password, SetPassword] = useState('');

	// used for client-side routing to other pages
	const navigate = useNavigate();

	/**
	 * Purpose: Handles click event on login button, sets user role based on username, and navigates to index page of user role.
	 * Params: <String> username - receives username input.
	 */
	const handleLogin = async (username, password) => {
		const loginResponse = await postFetch(`${baseURL}/login`, {
			username: username,
			password: password
		});

		if (!loginResponse.success) {
			alert(loginResponse.results);
		} else {
			let user = loginResponse.results;
			//console.log(loginResponse.results);
			//localStorage.setItem("user", JSON.stringify(user));

			// const cookies = new Cookies();
			localStorage.setItem("authToken", loginResponse.token);
			// cookies.set(
			// 	"authToken",
			// 	loginResponse.token,
			// 	{
			// 		secure: true,
			// 		path: "/",
			// 		age: 60*60*24,
			// 		sameSite: "none"
			// 	}
			// );
			if (user.usertype == "team") {
				user["username"] = user["team_name"];
				delete user["team_name"];
				user["usertype"] = "participant";

				navigate('/participant/view-all-problems');
			} 
			else if (user.usertype == "judge") {
				user["username"] = user["judge_name"];
				delete user["judge_name"];

				navigate('/judge/submissions');
			}
			else if (user.usertype == "admin") {
				user["username"] = user["admin_name"];
				delete user["admin_name"];

				navigate('/admin/general');
			}

			localStorage.setItem("user", JSON.stringify(user));
		}
	};


	return (
		// The login page has a background image that is different from all other pages.
		<Box
			sx = {{
				height: '100vh',
				overflow: 'hidden',
				display: { xs: 'center', lg: 'flex' },
				alignItems: { xs: 'center', lg: 'none'},
				justifyContent: { xs: 'center', lg: 'none' },
				
				backgroundSize: 'cover',
				backgroundRepeat: 'no-repeat',
				backgroundAttachment: 'fixed',
				backgroundImage: `url(${LoginBackground})`,
			}}
		>
			{/* Login form */}
			<Box
				sx={{
					top: { lg: 0, },
					right: { lg: 0 },
					paddingY: {lg: '5'},
					display: 'flex',
					marginY: '10vh',
					marginRight: { lg: '16%' },
					flexDirection: 'column',
					position: 'absolute',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			> 
				<Box
					sx={{ 
						paddingY: {
							xs: '2rem',
							xl: '4rem'
						},
						paddingX: '2.5rem',
						borderRadius: '20px',
						display: 'flex',
						flexDirection: 'column',
						marginBottom: '5vh',

						// White with opacity
						bgcolor: 'rgba(255, 255, 255, 0.1)',
						
						backdropFilter: 'blur(10px)',

						// For Safari support
						WebkitBackdropFilter: 'blur(10px)',

						// Black shadow
						boxShadow: '0px 0px 10px 5px rgba(0, 0, 0, 0.5)',
					}}
				>
					{/* Login Title */}
					<Typography
						variant="h4"
						sx={{
							alignSelf: 'center',
							color: 'major.light',
							marginBottom: {
								xs: '1.5em',
								xl: '1.8em',
							},
						}}
					>
						Login
					</Typography>

					{/* Form */}
					<form>
						{/* Username */}
						<Typography
							variant="body1"
							sx={{
								gap: 2,
								display: 'flex',
								marginBottom: {
									xs: '1em',
									lg: '1.5em',
									xl: '1.8em',
								},
							}}
						>
							<PersonIcon
								sx={{
									padding: '.7em',
									width: '10%',
									borderRadius: '5px',
									bgcolor: 'rgba(255, 255, 255, 0.15)',
								}}
							/>

							<TextField
								label="Username"
								variant="filled"
								onChange={e => {
									SetUsername(e.target.value);
								}}
								sx = {{
									bgcolor: 'rgba(255, 255, 255, 0.15)',
									borderTopLeftRadius: '5px',
									borderTopRightRadius: '5px',
									'& .MuiFormLabel-root': {
										color: 'white.main',
									},
									// input label when focused
									"& label.Mui-focused": {
										color: 'white.main',
									},
									'& .MuiFilledInput-root': {
										// White with reduced opacity
										color: 'rgba(255, 255, 255, 0.8)',

										// Placeholder color with reduced opacity
										'&::placeholder': {
											color: 'rgba(255, 255, 255, 0.5)',
										},
										'&:focus::placeholder': {
											color: 'rgba(255, 255, 255, 1)',      
										},
										// Underline color with reduced opacity
										'&:before': {
											borderBottom: '1px solid rgba(255, 255, 255, )',
										},
										// Underline on hover
										'&:hover:before': {
											borderBottom: '2px solid rgba(255, 255, 255, 1)',
										},
										// White color for the underline when focused
										'&.Mui-focused:before': {
											borderBottomColor: 'white',
										},
										// Border color when focused and input is not empty
										'&.Mui-focused:after': {
											borderBottomColor: 'major.main',
										},
									},
								}}
							/>
						</Typography>

						{/* Password */}
						<Typography
							variant="body1"
							sx={{
								gap: 2,
								display: 'flex',
								marginBottom: {
									xs: '1em',
									lg: '1.5em',
									xl: '1.8em',
								},
							}}
						>
							<KeyIcon
								sx={{
									padding: '.7em',
									width: '10%',
									borderRadius: '5px',
									bgcolor: 'rgba(255, 255, 255, 0.15)',
								}}
							/>
							
							<TextField
								label="Password"
								type="password"
								autoComplete="current-password"
								variant="filled"
								onChange={e => {
									SetPassword(e.target.value);
								}}
								onKeyDown={
									(e)=>{if (e.key === "Enter") {handleLogin(username, password);}}
								}
								sx = {{
									bgcolor: 'rgba(255, 255, 255, 0.15)',
									borderTopLeftRadius: '5px',
									borderTopRightRadius: '5px',
									'& .MuiFormLabel-root': {
										color: 'white.main',
									},
									// input label when focused
									"& label.Mui-focused": {
										color: 'white.main',
									},
									'& .MuiFilledInput-root': {
										// White with reduced opacity
										color: 'rgba(255, 255, 255, 0.8)',

										// Placeholder color with reduced opacity
										'&::placeholder': {
											color: 'rgba(255, 255, 255, 0.5)',
										},
										'&:focus::placeholder': {
											color: 'rgba(255, 255, 255, 1)',      
										},
										// Underline color with reduced opacity
										'&:before': {
											borderBottom: '1px solid rgba(255, 255, 255, )',
										},
										// Underline on hover
										'&:hover:before': {
											borderBottom: '2px solid rgba(255, 255, 255, 1)',
										},
										// White color for the underline when focused
										'&.Mui-focused:before': {
											borderBottomColor: 'white',
										},
										// Border color when focused and input is not empty
										'&.Mui-focused:after': {
											borderBottomColor: 'major.main',
										},
									},
								}}
							/>
						</Typography>

						{/* Sign In Button */}
						<Button 
							// type="submit"
							onClick={() => { handleLogin(username, password); }}
							variant="contained" 
							sx={{
								width: '100%',
								height: '6vh',
								maxHeight: '45px',
								marginTop: '20px',
								bgcolor: 'major.main',
								'&:hover': {
									bgcolor: 'major.light',
									color: 'general.main',
								}
							}}
						>
							Sign In
						</Button>
					</form>
				</Box>
                
				{/* Sponsor carousel in LogIn Page */}
				<Box sx={{ width: '100%' }}>
					<SponsorCarousel />
				</Box>
			</Box>
		</Box>
	);
};

export default LoginPage;