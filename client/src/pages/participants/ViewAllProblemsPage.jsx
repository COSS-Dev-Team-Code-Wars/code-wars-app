/* eslint-disable */ 
import { useState, useEffect } from 'react';

import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import {
	Button,
	Box,
	Stack,
	Tooltip,
	Typography,
} from '@mui/material';
import { useNavigate, createSearchParams } from 'react-router-dom';

import { Table } from 'components/';
import { postFetch } from 'utils/apiRequest';
import { baseURL } from 'utils/constants';
import { columnsProblems } from 'utils/dummyData';


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
	 * State handler for currrent round.
	 */
	const [currQuestions, setCurrQuestions] = useState([]);
	/**
	 * State handler for team details.
	 */
	const [teamDetails, setTeamDetails] = useState({
		teamName: 'Team 1',
		score: 0
	});
	

	// options for round labels
	const rounds = ['EASY', 'MEDIUM', 'WAGER', 'HARD'];
	// used for client-side routing to other pages
	const navigate = useNavigate();


	useEffect(() => {
		getRoundQuestions();
	}, [currRound]);


	useEffect(() => {
		// get relevant team details here
	}, [])

	
	/**
	 * Fetching questions for the current round
	 */
	const getRoundQuestions = async () => {
		const qResponse = await postFetch(`${baseURL}/viewquestionsdiff`, {
			difficulty: currRound.toLowerCase()
		});
		//console.log(qResponse.questions);

		let counter = 0;
		let questionsList = [];

		let set = 'c';
		if (currRound.toLowerCase() == 'easy') {
			set = JSON.parse(localStorage?.getItem('user')).easy_set;
		}
		else if (currRound.toLowerCase() == 'medium') {
			set = JSON.parse(localStorage?.getItem('user')).medium_set;
		}

		await Promise.all(
			qResponse.questions?.map( async (question)=>{
				let formattedQuestion = {};
				formattedQuestion.problemTitle = question.title;
				formattedQuestion.id = question.display_id;
				counter += 1;
				formattedQuestion.dbId = question._id;
	
				const qeResponse = await postFetch(`${baseURL}/getlastsubmissionbyteam`, {
					problemId: question._id,
					teamId: JSON.parse(localStorage?.getItem('user'))._id
				});
	
				formattedQuestion.status = qeResponse.evaluation;
				formattedQuestion.score = qeResponse.score;
				formattedQuestion.checkedBy = qeResponse.checkedby;
				
				//console.log(set, question.set);
				if (set == 'c' || set == question.set) {
					questionsList.push(formattedQuestion);
				}
				
			})
		);
		const sortedList = [...questionsList].sort((a, b) => a.id - b.id);

		setCurrQuestions(sortedList);
	};

	
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


	return (
		<>
			{/* Full Desktop View for round buttons and problem table */}
			{/* Right column is for the round buttons and problem list table */}
			<Stack
				spacing={5}
				sx={{
					mt: { xl: 8 },
					mx: { xs: 5, xl: 0},
					width: {xl: '68%'},
					height: '100%',
					display: 'flex'
				}}
			>
				
				{/* Container for round buttons */}
				<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
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
							gap: 1,
							display: 'flex',
							flexDirection: 'column',
							fontFamily: 'Inter',
							fontSize: '1.25rem',
							color: '#fff',
							alignItems: 'end'
						}}
					>
						<Box sx={{ display:'flex', gap: 2 }}>
							<span style={{ fontWeight: '500' }}>Team Name:</span>
							<span style={{ fontWeight: '300' }}>{teamDetails.teamName}</span>
						</Box>
						<Box sx={{ display:'flex', gap: 2 }}>
							<span style={{ fontWeight: '500' }}>Current Score:</span>
							<span style={{ fontWeight: '300' }}>{teamDetails.score}</span>
						</Box>
					</Typography>
				</Box>

				{/* Problem List Table for the round */}
				<Table
					rows={currQuestions} //rowsProblems
					columns={columnsProblems}
					hideFields={[]}
					additionalStyles={additionalStyles}
					onRowClick={handleRowClick}
					pageSizeOptions={[5, 10]}
					autoHeight={true}
					pageSize={10}
					initialState={{
						pagination: { paginationModel: { pageSize: 10 } },
					}}
				/>
			</Stack>
		</>
	);
};

export default ViewAllProblemsPage;