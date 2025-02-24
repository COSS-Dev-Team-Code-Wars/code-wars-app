/* eslint-disable */ 
import { useEffect } from 'react';

import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import {
	Button,
	Box,
	Stack,
	Tooltip,
	Typography,
} from '@mui/material';
import { useNavigate, createSearchParams, useOutletContext } from 'react-router-dom';

import { Table } from 'components/';
import { columnsProblems } from 'utils/dummyData';
import { rowsProblems } from 'utils/dummyData';


/**
 * Additional styling for the problem list table
 */
const additionalStyles = {
	backgroundColor: '#fff',
	overflow: 'auto',
};


/**
 * Purpose: Displays the View All Problems Page for participants.
 */
const ViewAllProblemsPage = ({ currRound }) => {
	/**
	 * Consuming context needed for the page
	 */
	const {
		teamInfo,
		setTeamInfo,
		currQuestions,
		getRoundQuestions
	} = useOutletContext();

	
	// options for round labels
	const rounds = ['EASY', 'MEDIUM', 'WAGER', 'HARD'];
	// used for client-side routing to other pages
	const navigate = useNavigate();


	useEffect(() => {
		getRoundQuestions();
	}, [currRound]);


	/**
   * Purpose: Handles opening of leaderboard modal window upon clicking the ellipsis button.
   * Params: <Object> receives information of selected problem in the Problem List Table.
   */
	const handleRowClick = (params) => {
		let customParams = {
			checkedBy: params.row.checkedBy,
			id: params.row.dbId,
			problemTitle: params.row.problemTitle,
			score: params.row.score,
			status: params.row.status
		};

		navigate({
			pathname: '/participant/view-specific-problem',
			search: createSearchParams(customParams).toString()
		});
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
				display: 'flex',
				width: '100%',
				paddingBottom: "20px",
				// height: '100%',
				alignContent: {
					xs: 'center',
					md: 'none'
				},
				justifyContent: {
					xs: 'center',
					md: 'none'
				}
			}}
		>
			{/* Full Desktop View for round buttons and problem table */}
			{/* Right column is for the round buttons and problem list table */}
			<Stack	
				spacing={5}
				sx={{
					px: { xs: 8, xl: 0 },
					mx: { xs: 5, xl: 0},
					// mt: { xs: 3, md: 4, lg: 6 },
					mt: { xs: 0, xl: 6},
					pr: { xl: 7 },
					// height: '100%',
					width: { xs: '100%'},
				}}
			>
				
				{/* Container for round buttons and team name + score */}
				<Box
					sx={{
						px: {
							xs: '3em',
							xl: '0'
						},
						display: 'flex',
						flexDirection: {
							xs: 'column',
							md: 'row'
						},
						justifyContent: {
							sx: 'initial',
							md: 'space-between',
						},
						gap: 4
					}}
				>
					{/* Round buttons */}
					<Box sx={{ display: 'flex', gap: 3, height: '70%', alignSelf: 'center' }}>
						{rounds.map((round, idx) => 
							<Button
								key={idx}
								variant="contained"
								startIcon={currRound === round ? <LockOpenIcon/> : <LockIcon />}
								disabled={currRound === round ? false : true}
								size="large"
								sx={{
									fontFamily: 'Poppins',
									fontWeight: '600',
									minWidth: 125,
									gap: 0.5,
									bgcolor: 'major.main',
									'&:hover': {
										bgcolor: 'major.light',
										color: 'general.main',
									},
									'&:disabled': {
										bgcolor: 'major.light',
										color: '#fff'
									}
								}}
							>
								{round}
							</Button>
						)}
					</Box>

					{/* Team Name and Team Score */}
					<Typography
						sx={{
							gap: {
								xs: 10,
								md: 1
							},
							color: '#fff',
							display: 'flex',
							fontSize: {
								xs: '1rem',
								lg: '1.15rem'
							},
							flexDirection: {
								xs: 'row',
								md: 'column'
							},
							alignItems: {
								xs: 'center',
								md: 'end',
							},
							justifyContent: {
								xs: 'center',
								md: 'initial'
							},
						}}
					>
						<Box sx={{ display:'flex', gap: 2 }}>
							<span style={{ fontWeight: '500' }}>Team Name:</span>
							<span style={{ fontWeight: '300' }}>{teamInfo.teamName}</span>
						</Box>
						<Box sx={{ display:'flex', gap: 2 }}>
							<span style={{ fontWeight: '500' }}>Current Score:</span>
							<span style={{ fontWeight: '300' }}>{teamInfo.score}</span>
						</Box>
					</Typography>
				</Box>

				{/* Problem List Table for the round */}
				<Table
					rows={currQuestions}
					// rows={rowsProblems}
					columns={columnsProblems}
					hideFields={[]}
					additionalStyles={additionalStyles}
					onRowClick={handleRowClick}
					pageSizeOptions={[3, 6]}
					autoHeight={true}
					pageSize={6}
					initialState={{
						pagination: { paginationModel: { pageSize: 6 } },
					}}
				/>
			</Stack>
		</Box>
	);
};

export default ViewAllProblemsPage;