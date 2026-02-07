/* eslint-disable */
import { useState, useEffect, Fragment } from 'react';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {
	Box,
	IconButton,
	Stack,
	Typography,
} from '@mui/material';

import { CustomModal, Table } from 'components';
import { columnsLeaderboard } from 'utils/dummyData';

import getLeaderboard from './getLeaderboard';
import { socketClient } from 'socket/socket';


/**
 * Additional styling for overall leaderboard modal window.
 */
const additionalStyles = {
	'& .MuiDataGrid-columnHeader': {
		fontSize: 'h2',
		bgcolor: 'rgba(0, 0, 0, 0.1)',
	},
	bgcolor: 'transparent',
	border: 'none',
	padding: 2,
};


/**
 * Purpose: Displays the top 4 participants in the realtime leaderboard for participants.
 * Params: None
 */
const ParticipantsLeaderboard = () => {
	/**
	 * State handler for overall leaderboard modal.
	 */
	const [open, setOpen] = useState(false);
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
		if (!socketClient) return;

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
	}, [socketClient]);

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
		<Box
			sx={{
				minWidth: 300,
				alignItems: 'center',
				alignContent: 'center',
				justifyContent: 'center',
				borderRadius: '15px',
				bgcolor: 'rgba(255, 255, 255, 0.1)',
				boxShadow: '0px 0px 10px 5px rgba(0, 0, 0, 0.5)',
				backdropFilter: 'blur(10px)',
			}}
		>
			<Stack
				sx={{
					paddingX: 4,
					paddingTop: 4,
					alignItems: 'center',
				}}
			>
				{/* Component Title */}
				<Typography variant="h5">Real-time</Typography>
				<Typography variant="h5">Leaderboard</Typography>

				{/* Rankings */}
				<Box sx={{ marginTop: 2, width: '100%' }}>
					{leaderboardRows.map((row, idx) => (
						// check if row belongs to top 4
						idx < 4 ? (
							// if row is in top 4, display this
							<Typography
								key={idx}
								sx={{
									gap: 5,
									padding: 2,
									marginY: 1,
									display: 'flex',
									borderRadius: '5px',
									background: 'rgba(255, 255, 255)',
								}}
							>
								{/* Circle with color based on rank */}
								<span
									style={{
										width: '20px',
										height: '20px',
										borderRadius: '50%',
										background:
											row.rank === 1
												? '#C64343'
												: row.rank === 2
													? '#30C136'
													: row.rank === 3
														? '#2C64A6'
														: row.rank === 4
															? '#C825CB'
															: 'transparent',
									}}
								/>
								<span>{row.team_name}</span>
							</Typography>
						) : <Fragment key={idx}></Fragment>
					))}
				</Box>

				{/* Ellipsis menu */}
				<IconButton onClick={handleButton}>
					<MoreHorizIcon style={{ width: 40, height: 30, color: '#fff' }} />
				</IconButton>
			</Stack>

			{/* Overall Leaderboard Modal Window */}
			<CustomModal isOpen={open} setOpen={setOpen} windowTitle="Leaderboard">
				<Table
					rows={leaderboardRows}
					columns={columnsLeaderboard}
					hideFields={['id', 'total_points_used']}
					additionalStyles={additionalStyles}
					pageSize={5}
					pageSizeOptions={[5, 10]}
					initialState={{
						pagination: { paginationModel: { pageSize: 5 } },
					}}
				/>
			</CustomModal>
		</Box>
	);
};

export default ParticipantsLeaderboard;