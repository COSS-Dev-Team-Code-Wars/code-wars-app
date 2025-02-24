/* eslint-disable */
import { useState, useEffect } from 'react';

import ViewListIcon from '@mui/icons-material/ViewList';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

import GeneralBackground from 'assets/GeneralBG.png';
import seal from 'assets/UPLB COSS.png';
import {
	CustomModal,
	FreezeOverlay,
	LoadingOverlay,
	Table,
	TopBar
} from 'components';
import getLeaderboard from 'components/widgets/leaderboard/getLeaderboard';
import { columnsLeaderboard } from 'utils/dummyData';
import { socketClient } from 'socket/socket';



/**
 * Additional styling for Leaderboard table
 */
const additionalStylesLeaderboard = {
	'& .MuiDataGrid-columnHeader': {
		bgcolor: 'rgba(0, 0, 0, 0.1)',
	},
	bgcolor: 'transparent',
	border: 'none',
	padding: 2,
};


/**
 * Purpose: Layout for judge-related pages.
 */
const JudgeLayout = ({
	freezeOverlay,
	isLoggedIn,
	setIsLoggedIn,
	checkIfLoggedIn,
}) => {
	/**
   * State handler for overall leaderboard modal window
   */
	const [open, setOpen] = useState(false);
	/**
   * State handler for rows of overall leaderboard
   */
	const [leaderboardRows, setLeaderboardRows] = useState([]);

	/**
	 * Fetch overall leaderboard data
	 */
	async function fetchData() {
		let currLeaderboard = await getLeaderboard();
		setLeaderboardRows(currLeaderboard);
	}

  useEffect(() => { 
		let usertype = JSON.parse(localStorage?.getItem('user'))?.usertype;
		if (usertype == 'participant') {
			navigate('/participant/view-all-problems');
		}
		else if (usertype == 'admin') {
			navigate('/admin/general');
		}
		else if (usertype == 'judge') {
			checkIfLoggedIn();
		}
		else {
			setIsLoggedIn(false);
		}

		

		fetchData();
    
	}, []);
	
	/**
	 * Web sockets for real time update of leaderboard
	 */
	useEffect(() => { 
		if(!socketClient) return;

		socketClient.on('evalupdate', () => {
			fetchData();
		});

		socketClient.on('updateScoreOnBuyDebuff', () => {
			fetchData();
		});
		
		socketClient.on('newBuff', () => {
			fetchData();
		})

		return () => {
			socketClient.off('evalupdate');
			socketClient.off('updateScoreOnBuyDebuff');
			socketClient.off('newBuff');
		};
	});

	/**
	* Handles opening of modal window for overall leaderboard.
	*/
	const handleButton = () => {
		setOpen(true);
	};
  
  
	return (
		<Box
			sx={{
				height: '100vh',
				overflow: 'hidden',
				backgroundSize: 'cover',
				backgroundRepeat: 'no-repeat',
				backgroundAttachment: 'fixed',
				backgroundImage: `url(${GeneralBackground})`,
			}}
			id="commonBox"
		>
			{ freezeOverlay ?
				<div className='fOverlayScreen' style={{ zIndex: '10000' }}>
					<FreezeOverlay />
				</div>

			// if user is logged in as judge
				: isLoggedIn ?
					<Box
						sx={{
							'& .timeColumn': {
								fontFamily: 'monospace'
							}
						}}
					>
						<TopBar
							isImg={true}
							icon={seal}
							title="Code Wars"
							subtitle="UPLB Computer Science Society"
							buttonText="VIEW LEADERBOARD"
							startIcon={<ViewListIcon />}
							handleButton={handleButton}
						/>
  
						{/* Children */}
						<Outlet />

						{/* Overall Leaderboard Modal Window */}
						<CustomModal isOpen={open} setOpen={setOpen} windowTitle="Leaderboard">
							<Table
								rows={leaderboardRows}
								columns={columnsLeaderboard}
								hideFields={['id', 'totalSpent']}
								additionalStyles={additionalStylesLeaderboard}
								pageSize={5}
								pageSizeOptions={[5, 10]}
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
						</CustomModal>
					</Box>

				// replace with protected page sana
					: <LoadingOverlay />
			}
		</Box>
	);
};

export default JudgeLayout;