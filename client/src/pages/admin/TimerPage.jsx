/* eslint-disable */ 
import { useState, useEffect } from 'react';

import {
	Box,
	Button,
	Stack,
	Switch,
	Toolbar,
	Typography
} from '@mui/material';

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
import { RoundTimer } from 'components';
import { columnsLeaderboardAdmin } from 'utils/dummyData';




// styling for leaderboard table
const additionalStyles = {
	backgroundColor: '#fff',
};


/**
 * Purpose: Displays round timer and leaderboard page for admin.
 */
const TimerPage = () => {

	/**
	 * State handler for rows of overall leaderboard.
	 */
	const [leaderboardRows, setLeaderboardRows] = useState([]);

	/**
	 * Fetch overall leaderboard data
	 */
	useEffect(() => { 
		fetchData();
	}, []);
	
	/**
	 * Web sockets for real time update
	 */
	useEffect(() => { 
		if(!socketClient) return;

		socketClient.on('evalupdate', () => {
			fetchData();
		});

		socketClient.on('updateScoreOnBuyBuff', () => {
			fetchData();
		});

		socketClient.on('updateScoreOnBuyDebuff', () => {
			fetchData();
		});


		return () => {
			socketClient.off('evalupdate');
			socketClient.off('updateScoreOnBuyBuff');
			socketClient.off('updateScoreOnBuyDebuff');
		};
	});

	/**
	* Handles opening of modal window for overall leaderboard.
	*/
	const handleButton = () => {
		setOpen(true);
	};

	/**
	 * Fetch leaderboard data
	 */
	async function fetchData() {
		let currLeaderboard = await getLeaderboard();
		setLeaderboardRows(currLeaderboard);
	}

	return (
		<Stack spacing={10} sx={{ margin:'4em', width:'100%' }}>
			
			{/* General Options */}
			<Box sx={{ paddingTop: '3em' }}>
				<RoundTimer fontSize='3rem' minWidth='600px' sx={{ fontSize:'4rem' }}/>
			</Box>

			{/* Overall Leaderboard Table */}
			<Box
				sx={{ 
					display: 'flex', 
					justifyContent: 'center', 
					flexDirection:'column', 
					alignItems: 'center', 
				}}
			>
				<Typography
					sx={{
						fontSize: '2rem',
						fontWeight: 600,
						fontFamily: 'Poppins',
						color: '#fff'
					}}
				>
					CURRENT LEADERBOARD
				</Typography>
				<Box sx={{ width: '38%', marginTop: '1em' }}>
					<Table
						rows={leaderboardRows}
						columns={columnsLeaderboardAdmin}
						hideFields={['id', 'total_points_used']}
						additionalStyles={additionalStyles}
						pageSizeOptions={[5]}
						pageSize={5}
						autoHeight
						initialState={{
							pagination: { paginationModel: { pageSize: 5 } },
						}}
						// if there are no entries yet
						slots={{
							noRowsOverlay: () => (
								<Stack height="100%" alignItems="center" justifyContent="center">
									<Typography><em>No records to display.</em></Typography>
								</Stack>
							)
						}}
					/>
				</Box>
			</Box>
		</Stack>
	);
};


export default TimerPage;