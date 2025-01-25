
/* eslint-disable */ 
import { useEffect, useState } from 'react';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WestIcon from '@mui/icons-material/West';
import {
	Box,
	Button,
	Typography
} from '@mui/material';

import {
	ConfirmWindow,
	DropdownSelect,
	SuccessWindow,
	ErrorWindow
} from 'components';
import { socketClient } from 'socket/socket';
import { getFetch } from 'utils/apiRequest';
import { baseURL } from 'utils/constants';


/** 
 * Purpose: This component displays the details of the specific power-up selected.
 * Params:
 * 		<Int>				type - receives the type of power-up clicked.
 *    <Boolean>   open - tells whether to 
 *    <Object> 		powerUp - state containing the details about the power-up selected.
 */
const PowerUpDetails = ({ type, handleReturn, powerUp }) => {
	/**
	 * State handler for selected team recipient for debuff
	 */
	const [selectedTeam, setSelectedTeam] = useState('');
	/**
	 * State handler for selected debuff to dispel
	 */
	const [selectedDebuff, setSelectedDebuff] = useState('');
	/**
	 * State handler for user details (from local storage)
	 */
	const [userDetails, setUserDetails] = useState();
	/**
	 * State handler for enemy team details (from database)
	 */
	const [enemyTeamDetails, setEnemyTeamDetails] = useState([]);
	/** 
	 * State handler for user's active debuffs
	*/
	const [activeDebuffs, setActiveDebuffs] = useState([]);
	/**
	 * State handler for team options
	 */
	const [teamOptions, setTeamOptions] = useState([]);


	useEffect(() => {
		// get user details of current session from localStorage
		const user = JSON.parse(localStorage?.getItem("user")); 

		getAllTeams(user);
		setUserDetails(user);
	}, []); 


	/**
	 * Fire a GET request to get list of all teams
	 */
	const getAllTeams = async (user) => {
		try{
			const res = await getFetch(`${baseURL}/teams`);
			if (res.success) {
				let userTeamInfo = {};
				let enemyTeams = [];

				// filter user team from enemy teams
				res.teams.forEach(team => {
					if(team._id === user?._id){
						userTeamInfo = team;
					} else {
						enemyTeams.push(team);
					}
				});

				// create array consisting only of team names - to be used for dropdown select options
				const teamListOptions = enemyTeams.map(team => team.team_name);

				// create array consisting only of active debuff names - to be used for dropdown select options
				const activeDebuffListOptions = userTeamInfo.debuffs_received.length > 0 ? userTeamInfo.debuffs_received.map(debuff => debuff.name) : ['No Active Debuffs'];

				// update states
				setEnemyTeamDetails(enemyTeams);
				setTeamOptions(teamListOptions);
				setSelectedTeam(teamListOptions[0]);
				setActiveDebuffs(activeDebuffListOptions);
				setSelectedDebuff(activeDebuffListOptions[0]);
			} else {
				console.log(res.message);
				return [];
			}
		} catch (err) {
			console.log(err);
		}
	};

	/**
	* Sets state of selectedTeam for applying debuff.
	*/
	const handleTeams = (e) => {
		setSelectedTeam(e.target.value);
	};

	/**
	* Sets state of selectedDebuff when buying dispel.
	*/
	const handleDispel = (e) => {
		setSelectedDebuff(e.target.value);
	};

	/**
	 * Apply the debuff to the selected team.
	 */
	const applyDebuff = (powerUp) => {
		// ask for confirmation of action
		ConfirmWindow.fire({
			text: 'Are you sure you want to use ' + `${powerUp.name}` + ' on ' + `${selectedTeam}` + '?',
			
		}).then((res) => {
			if (res['isConfirmed']) {
				// websocket for applying debuff
				socketClient.emit("applyDebuff", {
					"powerUp": powerUp,
					"userTeam": userDetails,
					"recipientTeam": enemyTeamDetails.find((team) => team.team_name === selectedTeam)
				});

				socketClient.on("scenarioCheckerDebuff", (scenario) => {
					if(scenario === 'existing'){
						ErrorWindow.fire({
							text: `You have an active ${powerUp.name}. Stacking of buffs is not allowed!`
						});
					} else if (scenario === 'insufficient_funds') {
						ErrorWindow.fire({
							text: `You have insufficient points to buy ${powerUp.name}!`
						});
					} else {
						SuccessWindow.fire({
							text: 'Successfully used '+`${powerUp.name}`+' on '+`${selectedTeam}`+'!'
						});
					}
				});

				// reset values
				setSelectedTeam('');
				handleReturn();
			} else {
				return;
			}
		});
	};

	/**
	 * Reset the selected target team and go back to debuff list.
	 */
	const handleBackDebuff = () => {
		setSelectedTeam('');
		handleReturn();
	};

	/**
	 * Applying chosen buff to user team
	 */
	const handleBuy = (powerUp) => {
		console.log(powerUp)
		// ask for confirmation of action
		ConfirmWindow.fire({
			text: 'Are you sure you want to use ' + `${powerUp.code === 'immune' ? powerUp.name + " " + Object.keys(powerUp.tier)[0] : powerUp.name}` + ' on your team?',
			
		}).then((res) => {
			if (res['isConfirmed']) {
				// websocket for buying buff
				socketClient.emit("buyBuff", {
					"powerUp": powerUp,
					"userTeam": userDetails,
					"debuff_to_dispel": powerUp.code === 'dispel' ? selectedDebuff : null
				});


				socketClient.on("scenarioCheckerBuff", (scenario) => {
					if(scenario === 'existing'){
						ErrorWindow.fire({
							text: `You have an active buff ${powerUp.code === 'immune' ? powerUp.name + " " + Object.keys(powerUp.tier)[0] : powerUp.name}. Stacking of buffs is not allowed!`
						});
					} else if (scenario === 'insufficient_funds') {
						ErrorWindow.fire({
							text: `You have insufficient points to buy ${powerUp.code === 'immune' ? powerUp.name + " " + Object.keys(powerUp.tier)[0] : powerUp.name}!`
						});
					} else {
						SuccessWindow.fire({
							text: 'Successfully used '+`${powerUp.code === 'immune' ? powerUp.name + " " + Object.keys(powerUp.tier)[0] : powerUp.name}`+' on your team!'
						});
					}
				});

				// reset values
				setSelectedTeam('');
				handleReturn();
			} else {
				return;
			}
		});
	};

	return (
		<Box
			sx={{
				width: '100%',
				display: 'flex',
				justifyContent: 'center',
				cursor: 'pointer',
				color: 'white.main',
				bgcolor: 'rgba(0, 10, 30, 3)',
				boxShadow: 'inset 0px 5px 5px -5px rgba(0,0,0,0.5)',
			}}
		>
			{/* Subcontainer */}
			<Box sx={{ width: '80%', display: 'flex', flexDirection: 'column' }} >
				
				{/* Return button */}
				<Button
					onClick={handleBackDebuff}
					variant="contained"
					sx={{
						bgcolor: 'rgba(0, 0, 10, 1)',
						width: '100px',
						marginBottom: '20px',
						'&:hover': {
							bgcolor: 'rgba(30, 40, 50, 1)',
						},
					}}
				>
					<WestIcon
						sx={{
							width: '20px',
							height: '20px',
							color: 'rgba(255, 255, 255, 0.5)',
						}}
					/>

					<Typography
						sx={{
							fontWeight: '60px',
							color: 'rgba(255, 255, 255, 0.5)',
							marginLeft: '5px',
							fontSize: {
								xs: '0.9rem',
								lg: '0.95rem',
							}
						}}
					>
						Back
					</Typography>
				</Button>

				{/* Power-up name */}
				<Typography
					sx={{
						marginBottom: '10px',
						fontSize: {
							xs: '0.9rem',
							lg: '0.95rem',
						},
						color: 'white.main'
					}}
				>
					{powerUp.code === 'immune' ? powerUp.name + " " + Object.keys(powerUp.tier)[0] : powerUp.name}
				</Typography>
				
				{/* Power-up description */}
				<Typography
					sx={{
						fontSize: {
							xs: '0.85rem',
							xl: '0.9rem'
						},
						color: 'rgba(255, 255, 255, 0.5)',
						fontWeight: '20px',
						marginBottom: '20px',
					}}
				>
					{powerUp.tier[Object.keys(powerUp.tier)[0]].description}
				</Typography>
				
				{/* Power-up cost */}
				<Typography
					sx={{
						fontSize: {
							xs: '0.85rem',
							xl: '0.9rem'
						},
						color: 'rgba(255, 255, 255, 0.5)',
						fontWeight: '20px',
						marginBottom: '20px',
					}}
				>
					Cost: { powerUp.code == "dispel" ? "120% of the cost of the dispelled debuff" : powerUp.code == "immune" && Object.keys(powerUp.tier)[0] == 4 ? "1000 + 10% of the team\’s current total points" : powerUp.tier[Object.keys(powerUp.tier)[0]].cost}
				</Typography>
				
				{type === 2 ?
					// Debuffs should have ui elements that allow the participants to select an enemy team to inflict the power-up on.
					<>
						{/* Select team dropdown select */}
						<DropdownSelect
							isDisabled={false}
							label="Team Name"
							minWidth="100%"
							variant="filled"
							options={teamOptions}
							handleChange={handleTeams}
							value={selectedTeam}
						/>

						{/* Button to inflict the debuff */}
						<Button
							onClick={() => applyDebuff(powerUp)}
							variant="contained"
							sx={{
								marginBottom: '20px',
								marginTop: '20px',
								height: '40px',
								fontSize: '14px',
							}}
						>
							Inflict debuff to {selectedTeam}
						</Button>
					</> :
					type === 1 && powerUp.code === 'dispel' ?
					<>
						{/* Select debuff to dispel dropdown select */}
						<DropdownSelect
							isDisabled={false}
							label="Active Debuffs"
							minWidth="100%"
							variant="filled"
							options={activeDebuffs}
							handleChange={handleDispel}
							value={selectedDebuff}
						/>

						{/* Button to Dispel the debuff */}
						<Button
							onClick={() => handleBuy(powerUp)}
							variant="contained"
							sx={{
								marginBottom: '20px',
								marginTop: '20px',
								height: '40px',
								fontSize: '14px',
								'& disabled': {
									bgcolor: 'primary.disabled'
								}
							}}
							disabled={activeDebuffs[0] === 'No Active Debuffs'}
						>
							Dispel {selectedDebuff}
						</Button>
					</> :
					// Buffs only have the buy button					
					<>
						{/* Buy button */}
						<Button
							variant="contained"
							onClick={() => handleBuy(powerUp)}
							sx={{ marginBottom: '20px' }}
						>
							<ShoppingCartIcon sx={{ margin: '5px' }} />
							BUY
						</Button>
					</>
				}
			</Box>
		</Box>
	);
};

export default PowerUpDetails;