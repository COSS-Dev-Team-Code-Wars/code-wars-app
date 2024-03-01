/* eslint-disable */ 
import { useState, useEffect } from 'react';

import {
	Box,
	Button,
	Stack,
	Switch,
	Typography
} from '@mui/material';

import {
	DropdownSelect,
	ErrorWindow,
	Sidebar,
	SuccessWindow,
	Table
} from 'components/';
import {
	optionsRounds,
	columnsLeaderboard,
} from 'utils/dummyData';
import { enterAdminPassword } from 'utils/enterAdminPassword';
import { useNavigate } from 'react-router-dom';

import { baseURL } from 'utils/constants';
import { postFetch } from 'utils/apiRequest';
import getLeaderboard from 'components/widgets/leaderboard/getLeaderboard';

import Loading from 'components/widgets/screen-overlays/Loading';
import { socketClient } from 'socket/socket';

// styling for leaderboard table
const additionalStyles = {
	backgroundColor: '#fff',
};
import { cloneDeep } from 'lodash';


/**
 * Purpose: Displays general options page for admin.
 * Params: None
 */
const GeneralOptionsPage = ({
	isLoggedIn,
	setIsLoggedIn,
	checkIfLoggedIn,
	currRound,
	setCurrRound,
	roundRef,
	freezeRef,
	immunityRef,
	freezeChecked,
	buyImmunityChecked,
	setFreezeChecked,
	setBuyImmunityChecked,
}) => {

	const [leaderboardRows, setLeaderboardRows] = useState([]);

	// used for client-side routing to other pages
	const navigate = useNavigate();

	/**
	   * Fetch overall leaderboard data
	   */
	async function fetchLeaderboardData() {
		let currLeaderboard = await getLeaderboard();
		let copy = cloneDeep(currLeaderboard);
		setLeaderboardRows(copy);
	}

	useEffect(() => { 
		let usertype = JSON.parse(localStorage?.getItem("user"))?.usertype;
		if (usertype == "judge") {
			navigate('/judge/submissions');
		}
		else if (usertype == "participant") {
			navigate('/participant/view-all-problems');
		}
		else if (usertype == "admin") {
			checkIfLoggedIn();	
		}
		else {
			setIsLoggedIn(false);
		}

		fetchLeaderboardData()
	}, []);

	useEffect(()=>{
		socketClient.on("evalupdate", ()=>{
			fetchLeaderboardData();
		});

		socketClient.on("powerupscorechange", ()=>{
			fetchLeaderboardData();
		});

		return () => {
			socketClient.off("evalupdate");
			socketClient.off("powerupscorechange");
		};
	});

	/**
	 * Purpose: Handler for toggle switch button. This will freeze the screens of all active sessions
	 */
	const handleFreeze = async (e) => {
		// for freezing all sessions
		if (e.target.checked) {
			await enterAdminPassword({ title: 'Freeze all active sessions' })
				.then( async (res) => {
					// proceed to request for freeze all screens

					// temp confirmation windows
					if (res == true) {
						const fResponse = await postFetch(`${baseURL}/setcommand`, {
							command: "freeze",
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
							command: "normal",
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
		};
	}

	/**
	 * Purpose: Handler for toggle switch button. This will allow teams to buy immunity
	 */
	const handleBuyImmunity = async (e) => {
		// for freezing all sessions
		if (e.target.checked) {
			await enterAdminPassword({ title: 'Enable buy immunity' })
				.then( async (res) => {
					// temp confirmation windows
					if (res == true) {
						const fResponse = await postFetch(`${baseURL}/set-buy-immunity`, {
							value: "enabled",
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
		// for disabling buy immunity to all sessions
		} else {
			await enterAdminPassword({ title: 'Disable buy immunity' })
				.then(async (res) => {

					// temp confirmation windows
					if (res == true) {
						const uResponse = await postFetch(`${baseURL}/set-buy-immunity`, {
							value: "disabled",
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
		};
	}

	/**
	 * Purpose: Handler for the apply button. This will terminate all active sessions.
	 */
	const handleAllLogout = async () => {
		await enterAdminPassword({ title:'Logout all active sessions'})
			.then(async (res) => {
				// proceed to request for logout all screens

				// temp confirmation windows
				if (res == true) {
					const lResponse = await postFetch(`${baseURL}/setcommand`, {
						command: "logout",
						round: roundRef.current.toLowerCase()
					});

					socketClient.emit("logout");

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
	 * Purpose: Fires confirmation window upon selecting an option in the move round select component.
	 */
	const handleRounds = async (selected) => {
		await enterAdminPassword({title:`${'Move to ' + `${selected}` + ' Round?'}`})
			.then( async (res) => {
				// proceed to request for moving rounds

				// temp confirmation windows
				if (res == true) {
					

					const cResponse = await postFetch(`${baseURL}/setcommand`, {
						command: freezeRef.current ? "freeze" : "normal",
						round: selected
					});
					
					SuccessWindow.fire({
						text: 'Successfully moved rounds!'
					});

					roundRef.current = selected;
					setCurrRound(selected);

					socketClient.emit("moveRound");

				} else if (res == false) {
					ErrorWindow.fire({
						title: 'Invalid Password!',
						text: 'Password is incorrect.'
					});
				}
			});
	};


	return (
		<> 
		{
			isLoggedIn ?
		<Box sx={{ display: 'flex' }}>
			{/* Sidebar */}
			<Sidebar />

			{/* Other components */}
			<Stack spacing={7} sx={{ margin:'4em', width:'100%' }}>

				{/* General Options */}
				<Box>
					<Typography variant="h4">GENERAL</Typography>  
					<Typography
						variant="h6"
						sx={{
							display: 'flex',
							flexDirection: 'row',
							marginLeft: '4em',
							marginTop: '2em',
						}}
					>
						{/* Labels */}
						<Stack spacing={4} sx={{ marginRight: '2em' }}>
							<span>Freeze all screens</span>
							<span>Allow buy immunity</span>
							<span>Logout all sessions</span>
							<span>Move Round</span>
						</Stack>

						{/* Buttons */}
						<Stack spacing={3} sx={{ width: '15%' }}>

							{/* Toggle Switch */}
							<Switch checked={freezeRef.current} onChange={(e) => handleFreeze(e)} />
							
							{/* Toggle Switch */}
							<Switch checked={immunityRef.current} onChange={(e) => handleBuyImmunity(e)} />
							
							{/* Apply Button */}
							<Button
								variant="contained"
								color="major"
								onClick={handleAllLogout}
								sx={{
									'&:hover': {
										bgcolor: 'major.light',
										color: 'general.main',
									}
								}}
							>
                Apply
							</Button>

							{/* Dropdown Select */}
							<DropdownSelect
								isDisabled={false}
								variant="filled"
								label="Select Round"
								minWidth="100px"
								options={optionsRounds}
								handleChange={(e) => handleRounds(e.target.value)}
								value={roundRef.current}
							/>
						</Stack>
					</Typography>
				</Box>

				{/* Overall Leaderboard Table */}
				<Box>
					<Typography variant="h4">LEADERBOARD</Typography>
					<Box sx={{ display: 'flex', justifyContent: 'center' }}>
						<Box sx={{ width: '65%'}}>
							<Table
								rows={leaderboardRows}
								columns={columnsLeaderboard}
								hideFields={['id']}
								additionalStyles={additionalStyles}
								pageSizeOptions={[5, 7]}
								pageSize={7}
								autoHeight
								initialState={{
									pagination: { paginationModel: { pageSize: 7 } },
								}}
							/>
						</Box>
					</Box>
				</Box>
			</Stack>
		</Box> : <Loading /> 
		} 
		</>
	);
};

export default GeneralOptionsPage;