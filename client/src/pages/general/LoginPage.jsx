/* eslint-disable */ 
import { useContext, useState } from 'react';

// Modern rounded icons (same meaning, better look)
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';

import {
	Box,
	TextField,
	Button,
	Stack,
	Typography,
	IconButton,
	InputAdornment
} from '@mui/material';

import { useNavigate } from 'react-router-dom';

import LoginBackground from 'assets/CodeWarsBG[25-26].png';
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
	// state for password visibility toggle
	const [showPassword, setShowPassword] = useState(false);

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

	// Toggle password visibility
	const handleTogglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	return (
		// The login page has a background image that is different from all other pages.
		<Box
			sx={{
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
					top: { lg: 0 },
					right: { lg: 0 },
					paddingY: { lg: '5' },
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
						paddingY: { xs: '2.5rem', xl: '3rem' },
						paddingX: { xs: '2.8rem', xl: '3.5rem' },
						borderRadius: '28px',
						display: 'flex',
						flexDirection: 'column',
						marginBottom: '5vh',
						minWidth: { xs: '340px', sm: '420px', xl: '460px' },

						// Lighter glass morphism background
						background: 'linear-gradient(135deg, rgba(240, 248, 255, 0.25), rgba(230, 244, 255, 0.2))',

						backdropFilter: 'blur(16px) saturate(180%)',
						WebkitBackdropFilter: 'blur(16px) saturate(180%)',

						// Bright border
						border: '2px solid rgba(255, 255, 255, 0.55)',

						// Enhanced shadow with glow
						boxShadow: `
							0px 16px 48px rgba(0, 0, 0, 0.35),
							0px 0px 80px rgba(100, 200, 255, 0.25),
							inset 0px 2px 4px rgba(255, 255, 255, 0.45)
						`,

						transition: 'all 0.3s ease',

						'&:hover': {
							transform: 'translateY(-3px)',
							boxShadow: `
								0px 22px 60px rgba(0, 0, 0, 0.4),
								0px 0px 100px rgba(100, 200, 255, 0.35)
							`,
						},
					}}
				>
					{/* Sign In Title */}
					<Typography
						variant="h4"
						sx={{
							alignSelf: 'center',
							color: '#0D47A1',
							fontWeight: 900,
							marginBottom: '1.5em',
							fontSize: '3.0rem',
							textShadow: `
								0px 2px 10px rgba(255, 255, 255, 0.9),
								0px 4px 12px rgba(33, 150, 243, 0.35)
							`,
						}}
					>
						LOGIN
					</Typography>

					{/* Form */}
					<form>
						{/* Username */}
						<Box sx={{ marginBottom: '1.6em' }}>
							<Typography
								variant="caption"
								sx={{
									color: '#1565C0',
									fontWeight: 700,
									marginBottom: '0.6em',
									display: 'block',
									fontSize: '0.8rem',
									letterSpacing: '0.04em',
									textTransform: 'uppercase',
								}}
							>
								Username
							</Typography>

							<TextField
								fullWidth
								placeholder="Enter your username"
								onChange={e => SetUsername(e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<AccountCircleRoundedIcon
												sx={{
													color: '#1976D2',
													fontSize: '1.6rem',
													opacity: 0.9,
													filter: 'drop-shadow(0px 3px 6px rgba(33, 150, 243, 0.35))',
												}}
											/>
										</InputAdornment>
									),
								}}
								sx={{
									'& .MuiOutlinedInput-root': {
										height: '52px',
										borderRadius: '14px',
										background: 'rgba(255, 255, 255, 0.55)',
										border: '2px solid rgba(33, 150, 243, 0.3)',
										transition: 'all 0.3s ease',
										'& fieldset': { border: 'none' },
										'&.Mui-focused': {
											boxShadow: '0 0 0 4px rgba(33, 150, 243, 0.18)',
										},
									},
								}}
							/>
						</Box>

						{/* Password */}
						<Box>
							<Typography
								variant="caption"
								sx={{
									color: '#1565C0',
									fontWeight: 700,
									marginBottom: '0.6em',
									display: 'block',
									fontSize: '0.8rem',
									letterSpacing: '0.04em',
									textTransform: 'uppercase',
								}}
							>
								Password
							</Typography>

							<TextField
								fullWidth
								type={showPassword ? 'text' : 'password'}
								placeholder="Enter your password"
								onChange={e => SetPassword(e.target.value)}
								onKeyDown={(e)=>{ if (e.key === "Enter") handleLogin(username, password); }}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<LockRoundedIcon sx={{ color: '#1976D2' }} />
										</InputAdornment>
									),
									endAdornment: (
										<InputAdornment position="end">
											<IconButton onClick={handleTogglePasswordVisibility}>
												{showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
											</IconButton>
										</InputAdornment>
									),
								}}
								sx={{
									'& .MuiOutlinedInput-root': {
										height: '52px',
										borderRadius: '14px',
										background: 'rgba(255, 255, 255, 0.55)',
										border: '2px solid rgba(33, 150, 243, 0.3)',
										transition: 'all 0.3s ease',
										'& fieldset': { border: 'none' },
										'&.Mui-focused': {
											boxShadow: '0 0 0 4px rgba(33, 150, 243, 0.18)',
										},
									},
								}}
							/>
						</Box>

						{/* Sign In Button */}
						<Button
							fullWidth
							disabled={!username || !password}
							onClick={() => handleLogin(username, password)}
							variant="contained"
							sx={{
								height: '54px',
								marginTop: '32px',
								borderRadius: '14px',
								fontWeight: 700,
								letterSpacing: '1.2px',
								background: 'linear-gradient(135deg, #2196F3, #1976D2, #0D47A1)',
								'&:hover': { transform: 'translateY(-2px)' },
								'&.Mui-disabled': {
									background: 'linear-gradient(135deg, #90CAF9, #64B5F6)',
									color: '#E3F2FD',
								},
							}}
						>
							Login
						</Button>
					</form>		
				</Box>

				{/* Sponsor carousel in LogIn Page */}
				<Box sx={{ width: '100%' }}>
					<SponsorCarousel themeColor="#0D47A1" />
				</Box>
			</Box>
		</Box>
	);
};

export default LoginPage;
