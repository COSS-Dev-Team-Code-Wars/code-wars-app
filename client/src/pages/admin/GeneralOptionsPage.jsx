/* eslint-disable */ 
import React, { useState, useEffect } from 'react';

import {
	Box,
	Button,
	Stack,
	Switch,
	TextField,
	Typography,
	Paper,
	Card,
	CardContent,
	Divider,
	alpha,
	Chip,
	Grid,
} from '@mui/material';

import {
	LockOpen as LockOpenIcon,
	Lock as LockIcon,
	Campaign as CampaignIcon,
	Logout as LogoutIcon,
	NavigateNext as NavigateNextIcon,
	Leaderboard as LeaderboardIcon,
	Security as SecurityIcon,
	Settings as SettingIcon,
} from '@mui/icons-material';

import {
	DropdownSelect,
	ErrorWindow,
	SuccessWindow,
	Table
} from 'components/';
import getLeaderboard from 'components/widgets/leaderboard/getLeaderboard';
import { socketClient } from 'socket/socket';
import { postFetch } from 'utils/apiRequest';
import { baseURL } from 'utils/constants';
import {
	optionsRounds,
	columnsLeaderboard,
} from 'utils/dummyData';
import { enterAdminPassword } from 'utils/enterAdminPassword';




// styling for leaderboard table
const additionalStyles = {
	backgroundColor: '#fff',
	borderRadius: '12px',
};


/**
 * Purpose: Displays general options page for admin.
 */
const GeneralOptionsPage = ({
	setCurrRound,
	roundRef,
	freezeRef,
	immunityRef,
	announcementRef,
	setFreezeChecked,
	setBuyImmunityChecked,
	setAnnouncementList
}) => {

	/**
	 * State handler for rows in leaderboard modal.
	 */
	const [leaderboardRows, setLeaderboardRows] = useState([]);

	/**
	 * State handler for announcements.
	 */
	const [newMessage, setNewMessage] = useState("");

	/**
	 * Fetch overall leaderboard data
	 */
	async function fetchData() {
		let currLeaderboard = await getLeaderboard();
		setLeaderboardRows(currLeaderboard);
	}

	useEffect(() => { 
		fetchData();
	}, []);

	/**
	 * Handler for toggle switch button. This will freeze the screens of all active sessions
	 */
	const handleFreeze = async (e) => {
		// for freezing all sessions
		if (e.target.checked) {
			await enterAdminPassword({ title: 'Freeze all active sessions' })
				.then(async (res) => {
					
					// proceed to request for freeze all screens
					if (res == true) {
						const fResponse = await postFetch(`${baseURL}/setcommand`, {
							command: 'freeze',
							round: roundRef.current.toLowerCase()
						});

						SuccessWindow.fire({
							text: 'Successfully froze all active sessions!'
						});
						
						freezeRef.current = true;
						setFreezeChecked(true);

					} else if (res == false) {
						ErrorWindow.fire({
							title: 'Invalid Password!',
							text: 'Password is incorrect.'
						});
					}
				});
			
		// for unfreezing all sessions
		} else {
			await enterAdminPassword({ title: 'Unfreeze all active sessions' })
				.then(async (res) => {
					// proceed to request to unfreeze all screens

					// temp confirmation windows
					if (res == true) {
						const uResponse = await postFetch(`${baseURL}/setcommand`, {
							command: 'normal',
							round: roundRef.current.toLowerCase()
						});

						SuccessWindow.fire({
							text: 'Successfully disabled freeze for all active sessions!'
						});
						
						freezeRef.current = false;
						setFreezeChecked(false);

					} else if (res == false) {
						ErrorWindow.fire({
							title: 'Invalid Password!',
							text: 'Password is incorrect.'
						});
					}
				});
		}
	};

	/**
	 * Handler for toggle switch button. This will allow teams to buy immunity
	 */
	const handleBuyImmunity = async (e) => {

		// for allowing buy immunity for all sessions
		if (e.target.checked) {
			await enterAdminPassword({ title: 'Enable buy immunity' })
				.then(async (res) => {
					
					if (res == true) {
						const fResponse = await postFetch(`${baseURL}/set-buy-immunity`, {
							value: 'enabled',
						});

						SuccessWindow.fire({
							text: 'Successfully enabled buy immunity!'
						});
						
						immunityRef.current = true;
						setBuyImmunityChecked(true);

					} else if (res == false) {
						ErrorWindow.fire({
							title: 'Invalid Password!',
							text: 'Password is incorrect.'
						});
					}
				});
			
		// for disabling buy immunity for all sessions
		} else {
			await enterAdminPassword({ title: 'Disable buy immunity' })
				.then(async (res) => {

					if (res == true) {
						const uResponse = await postFetch(`${baseURL}/set-buy-immunity`, {
							value: 'disabled',
						});

						SuccessWindow.fire({
							text: 'Successfully disabled buy immunity for all active sessions!'
						});
						
						immunityRef.current = false;
						setBuyImmunityChecked(false);

					} else if (res == false) {
						ErrorWindow.fire({
							title: 'Invalid Password!',
							text: 'Password is incorrect.'
						});
					}
				});
		}
	};

	/**
	 * Handler for the announce button. This will post the message to all active sessions.
	 */
	const handleAnnounce = async () => {
		await enterAdminPassword({ title:'Post message to everyone'})
			.then(async (res) => {

				// proceed to request for announcement
				if (res == true) {
					if (!newMessage.trim()) return;
			
					const timestamp = new Date().toLocaleString();
					const newEntry = { message: newMessage, time: timestamp };

					// Update state with new message
					setAnnouncementList((prevMessages) => {
						const updatedMessages = [newEntry, ...prevMessages];

						announcementRef.current = updatedMessages;

						return updatedMessages;
					});

					const fResponse = await postFetch(`${baseURL}/announce`, {
						messages: announcementRef.current,
					});

					setNewMessage("");

					SuccessWindow.fire({
						text: 'Successfully announced to everyone!'
					});

				} else {
					ErrorWindow.fire({
						title: 'Invalid Password!',
						text: 'Password is incorrect.'
					});
				}
			});
	};

	/**
	 * Handler for the apply button. This will terminate all active sessions.
	 */
	const handleAllLogout = async () => {
		await enterAdminPassword({ title:'Logout all active sessions'})
			.then(async (res) => {

				// proceed to request for logout all active sessions
				if (res == true) {
					const lResponse = await postFetch(`${baseURL}/setcommand`, {
						command: 'logout',
						round: roundRef.current.toLowerCase()
					});

					socketClient.emit('logout');

					SuccessWindow.fire({
						text: 'Successfully logged out all active sessions!'
					});

				} else if (res == false) {
					ErrorWindow.fire({
						title: 'Invalid Password!',
						text: 'Password is incorrect.'
					});
				}
			});
	};

	/**
	 * Fires confirmation window upon selecting an option in the move round select component.
	 */
	const handleRounds = async (selected) => {
		await enterAdminPassword({title:`${'Move to ' + `${selected}` + ' Round?'}`})
			.then( async (res) => {

				if (res == true) {
					const cResponse = await postFetch(`${baseURL}/setcommand`, {
						command: freezeRef.current ? 'freeze' : 'normal',
						round: selected
					});
					
					SuccessWindow.fire({
						text: 'Successfully moved rounds!'
					});

					roundRef.current = selected;
					setCurrRound(selected);

					socketClient.emit('moveRound');

				} else if (res == false) {
					ErrorWindow.fire({
						title: 'Invalid Password!',
						text: 'Password is incorrect.'
					});
				}
			});
	};


	return (
		<Box
			sx={{
				minHeight: '100vh',
				py: 5,
			}}
		>
			<Box
				sx={{
					maxWidth: 1800,
					mx: 'auto',
					px: { xs: 2, md: 4 },
				}}
			>
				<Grid container spacing={4}>
					{/* General Options */}
					<Grid item xs={12} lg={5}>
						<Card
							elevation={3}
							sx={{
								borderRadius: 4,
								border: '2px solid',
								borderColor: alpha('#009fac', 0.3),
								overflow: 'hidden',
								background: 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)',
								height: '100%',
							}}
						>
							{/* Header */}
							<Box
								sx={{
									p: 3,
									background: `linear-gradient(135deg, ${alpha('#009fac', 0.15)} 0%, ${alpha('#395395', 0.15)} 100%)`,
									borderBottom: '2px solid',
									borderColor: alpha('#009fac', 0.3),
								}}
							>
								<Stack direction="row" alignItems="center" spacing={2}>
									<Box
										sx={{
											p: 1.5,
											borderRadius: 3,
											background: 'linear-gradient(135deg, #009fac 0%, #395395 100%)',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											boxShadow: `0 4px 20px ${alpha('#009fac', 0.4)}`,
										}}
									>
										<SettingIcon sx={{ fontSize: 32, color: '#fff' }} />
									</Box>
									<Typography variant="h4" fontWeight={700} color="#009fac">
										GENERAL OPTIONS
									</Typography>
								</Stack>
							</Box>

							<CardContent sx={{ p: 4 }}>
								<Stack spacing={3}>
									{/* Freeze Screens */}
									<Paper
										elevation={1}
										sx={{
											p: 3,
											borderRadius: 3,
											border: '1px solid',
											borderColor: alpha('#009fac', 0.2),
											transition: 'all 0.3s',
											backgroundColor: '#fff',
											'&:hover': {
												boxShadow: `0 4px 16px ${alpha('#009fac', 0.15)}`,
											},
										}}
									>
										<Stack direction="row" alignItems="center" justifyContent="space-between">
											<Stack direction="row" alignItems="center" spacing={2}>
												<Box
													sx={{
														p: 1.5,
														borderRadius: 2,
														backgroundColor: freezeRef.current ? alpha('#f44336', 0.1) : alpha('#4caf50', 0.1),
													}}
												>
													{freezeRef.current ? (
														<LockIcon sx={{ color: '#f44336', fontSize: 28 }} />
													) : (
														<LockOpenIcon sx={{ color: '#4caf50', fontSize: 28 }} />
													)}
												</Box>
												<Box>
													<Typography variant="h6" fontWeight={700} color="text.primary">
														Freeze All Screens
													</Typography>
													<Typography variant="body2" color="text.secondary">
														{freezeRef.current ? 'Sessions are currently frozen' : 'Sessions are active'}
													</Typography>
												</Box>
											</Stack>
											<Switch
												checked={freezeRef.current}
												onChange={(e) => handleFreeze(e)}
												sx={{
													'& .MuiSwitch-track': {
													border: '1.5px solid #999',
													backgroundColor: '#e0e0e0',
													opacity: 1,
													},
													'& .MuiSwitch-thumb': {
													boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
													},
													'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
													backgroundColor: '#f44336',
													borderColor: '#f44336',
													},
												}}
											/>
										</Stack>
									</Paper>

									{/* Buy Immunity */}
									<Paper
										elevation={1}
										sx={{
											p: 3,
											borderRadius: 3,
											border: '1px solid',
											borderColor: alpha('#395395', 0.2),
											transition: 'all 0.3s',
											backgroundColor: '#fff',
											'&:hover': {
												boxShadow: `0 4px 16px ${alpha('#395395', 0.15)}`,
											},
										}}
									>
										<Stack direction="row" alignItems="center" justifyContent="space-between">
											<Stack direction="row" alignItems="center" spacing={2}>
												<Box
													sx={{
														p: 1.5,
														borderRadius: 2,
														backgroundColor: alpha('#395395', 0.1),
													}}
												>
													<SecurityIcon sx={{ color: '#395395', fontSize: 28 }} />
												</Box>
												<Box>
													<Typography variant="h6" fontWeight={700} color="text.primary">
														Allow Buy Immunity
													</Typography>
													<Typography variant="body2" color="text.secondary">
														{immunityRef.current ? 'Teams can buy immunity' : 'Immunity purchasing disabled'}
													</Typography>
												</Box>
											</Stack>
											<Switch
												checked={immunityRef.current}
												onChange={(e) => handleBuyImmunity(e)}
												sx={{
											'& .MuiSwitch-track': {
											border: '1.5px solid #999',
											backgroundColor: '#e0e0e0',
											opacity: 1,
											},
											'& .MuiSwitch-thumb': {
											boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
											},
											'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
											backgroundColor: '#f44336',
											borderColor: '#f44336',
											},
										}}
											/>
										</Stack>
									</Paper>

									{/* Announcement */}
									<Paper
										elevation={1}
										sx={{
											p: 3,
											borderRadius: 3,
											border: '1px solid',
											borderColor: alpha('#ff9800', 0.2),
											transition: 'all 0.3s',
											backgroundColor: '#fff',
											'&:hover': {
												boxShadow: `0 4px 16px ${alpha('#ff9800', 0.15)}`,
											},
										}}
									>
										<Stack spacing={2}>
											<Stack direction="row" alignItems="center" spacing={2}>
												<Box
													sx={{
														p: 1.5,
														borderRadius: 2,
														backgroundColor: alpha('#ff9800', 0.1),
													}}
												>
													<CampaignIcon sx={{ color: '#ff9800', fontSize: 28 }} />
												</Box>
												<Box>
													<Typography variant="h6" fontWeight={700} color="text.primary">
														Announcement
													</Typography>
													<Typography variant="body2" color="text.secondary">
														Broadcast a message to all active sessions
													</Typography>
												</Box>
											</Stack>
											<Stack direction="row" spacing={2}>
												<TextField
													fullWidth
													variant="outlined"
													multiline
													rows={3}
													placeholder="Type your announcement message here..."
													value={newMessage}
													onChange={(e) => setNewMessage(e.target.value)}
													sx={{
														'& .MuiOutlinedInput-root': {
															borderRadius: 2.5,
															backgroundColor: alpha('#ff9800', 0.03),
															transition: 'all 0.3s',
															'&:hover': {
																backgroundColor: alpha('#ff9800', 0.05),
															},
															'&.Mui-focused': {
																backgroundColor: '#fff',
																boxShadow: `0 0 0 3px ${alpha('#ff9800', 0.1)}`,
															},
														},
													}}
												/>
												<Button
													variant="contained"
													onClick={handleAnnounce}
													sx={{
														minWidth: '140px',
														borderRadius: 2.5,
														fontWeight: 700,
														textTransform: 'none',
														background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
														boxShadow: `0 4px 14px ${alpha('#ff9800', 0.4)}`,
														transition: 'all 0.3s',
														'&:hover': {
															transform: 'translateY(-2px)',
															boxShadow: `0 6px 20px ${alpha('#ff9800', 0.5)}`,
														},
													}}
												>
													Post
												</Button>
											</Stack>
										</Stack>
									</Paper>

									{/* Logout All Sessions */}
									<Paper
										elevation={1}
										sx={{
											p: 3,
											borderRadius: 3,
											border: '1px solid',
											borderColor: alpha('#f44336', 0.2),
											transition: 'all 0.3s',
											backgroundColor: '#fff',
											'&:hover': {
												boxShadow: `0 4px 16px ${alpha('#f44336', 0.15)}`,
											},
										}}
									>
										<Stack direction="row" alignItems="center" justifyContent="space-between">
											<Stack direction="row" alignItems="center" spacing={2}>
												<Box
													sx={{
														p: 1.5,
														borderRadius: 2,
														backgroundColor: alpha('#f44336', 0.1),
													}}
												>
													<LogoutIcon sx={{ color: '#f44336', fontSize: 28 }} />
												</Box>
												<Box>
													<Typography variant="h6" fontWeight={700} color="text.primary">
														Logout All Sessions
													</Typography>
													<Typography variant="body2" color="text.secondary">
														Terminate all active user sessions immediately
													</Typography>
												</Box>
											</Stack>
											<Button
												variant="contained"
												onClick={handleAllLogout}
												sx={{
													minWidth: '140px',
													borderRadius: 2.5,
													fontWeight: 700,
													textTransform: 'none',
													background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
													boxShadow: `0 4px 14px ${alpha('#f44336', 0.4)}`,
													transition: 'all 0.3s',
													'&:hover': {
														transform: 'translateY(-2px)',
														boxShadow: `0 6px 20px ${alpha('#f44336', 0.5)}`,
													},
												}}
											>
												Apply
											</Button>
										</Stack>
									</Paper>

									{/* Move Round */}
									<Paper
										elevation={1}
										sx={{
											p: 3,
											borderRadius: 3,
											border: '1px solid',
											borderColor: alpha('#009fac', 0.2),
											transition: 'all 0.3s',
											backgroundColor: '#fff',
											'&:hover': {
												boxShadow: `0 4px 16px ${alpha('#009fac', 0.15)}`,
											},
										}}
									>
										<Stack direction="row" alignItems="center" justifyContent="space-between">
											<Stack direction="row" alignItems="center" spacing={2}>
												<Box
													sx={{
														p: 1.5,
														borderRadius: 2,
														backgroundColor: alpha('#009fac', 0.1),
													}}
												>
													<NavigateNextIcon sx={{ color: '#009fac', fontSize: 28 }} />
												</Box>
												<Box>
													<Typography variant="h6" fontWeight={700} color="text.primary">
														Move Round
													</Typography>
													<Typography variant="body2" color="text.secondary">
														Current round: <Chip label={roundRef.current} size="small" sx={{ fontWeight: 700, ml: 1 }} />
													</Typography>
												</Box>
											</Stack>
											<Box sx={{ minWidth: '200px' }}>
												<DropdownSelect
													isDisabled={false}
													variant="filled"
													label="Select Round"
													minWidth="100px"
													options={optionsRounds}
													handleChange={(e) => handleRounds(e.target.value)}
													value={roundRef.current}
													sx={{
														'& .MuiFilledInput-root': {
															borderRadius: 2.5,
															backgroundColor: alpha('#009fac', 0.1),
															'&:hover': {
																backgroundColor: alpha('#009fac', 0.15),
															},
															'&.Mui-focused': {
																backgroundColor: alpha('#009fac', 0.1),
															},
														},
													}}
												/>
											</Box>
										</Stack>
									</Paper>
								</Stack>
							</CardContent>
						</Card>
					</Grid>

					{/* Leaderboard */}
					<Grid item xs={12} lg={7}>
						<Card
							elevation={3}
							sx={{
								borderRadius: 4,
								border: '2px solid',
								borderColor: alpha('#395395', 0.3),
								overflow: 'hidden',
								background: 'linear-gradient(135deg, #eef2f7 0%, #d6e4f0 100%)',
								height: '100%',
							}}
						>
							{/* Header */}
							<Box
								sx={{
									p: 3,
									background: `linear-gradient(135deg, ${alpha('#395395', 0.15)} 0%, ${alpha('#009fac', 0.15)} 100%)`,
									borderBottom: '2px solid',
									borderColor: alpha('#395395', 0.3),
								}}
							>
								<Stack direction="row" alignItems="center" spacing={2}>
									<Box
										sx={{
											p: 1.5,
											borderRadius: 3,
											background: 'linear-gradient(135deg, #395395 0%, #009fac 100%)',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											boxShadow: `0 4px 20px ${alpha('#395395', 0.4)}`,
										}}
									>
										<LeaderboardIcon sx={{ fontSize: 32, color: '#fff' }} />
									</Box>
									<Typography variant="h4" fontWeight={700} color="#395395">
										OVERALL LEADERBOARD
									</Typography>
								</Stack>
							</Box>

							<CardContent sx={{ p: 4 }}>
								<Box
									sx={{
										width: '100%',
										'& .MuiDataGrid-root': {
											borderRadius: 3,
											border: '1px solid',
											borderColor: alpha('#395395', 0.2),
											boxShadow: `0 2px 8px ${alpha('#395395', 0.08)}`,
										},
									}}
								>
									<Table
										rows={leaderboardRows}
										columns={columnsLeaderboard}
										hideFields={['id']}
										additionalStyles={additionalStyles}
										pageSizeOptions={[5, 10]}
										pageSize={10}
										autoHeight
										initialState={{
											pagination: { paginationModel: { pageSize: 10 } },
										}}
										slots={{
											noRowsOverlay: () => (
												<Stack height="100%" alignItems="center" justifyContent="center" spacing={2} sx={{ py: 8 }}>
													<LeaderboardIcon sx={{ fontSize: 64, color: alpha('#395395', 0.3) }} />
													<Typography variant="h6" color="text.secondary">
														No records to display
													</Typography>
													<Typography variant="body2" color="text.secondary">
														Leaderboard data will appear here once available
													</Typography>
												</Stack>
											)
										}}
									/>
								</Box>
							</CardContent>
						</Card>
					</Grid>
				</Grid>

				{/* Bottom padding */}
				<Box sx={{ height: 60 }} />
			</Box>
		</Box>
	);
};


export default GeneralOptionsPage;