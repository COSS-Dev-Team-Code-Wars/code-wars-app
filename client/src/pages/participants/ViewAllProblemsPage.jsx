/* eslint-disable */ 
import { useState, useEffect } from 'react';

import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import {
	Button,
	Box,
	Stack,
} from '@mui/material';
import { useNavigate, createSearchParams } from 'react-router-dom';

import { Table } from 'components/';
import { columnsProblems } from 'utils/dummyData';

import { baseURL } from 'utils/constants';
import { postFetch } from 'utils/apiRequest';



/**
 * Purpose: Displays the View All Problems Page for participants.
 */
const ViewAllProblemsPage = ({ currRound }) => {
	
	const [currQuestions, setCurrQuestions] = useState([]);
	
	// options for round labels
	const rounds = ['EASY', 'MEDIUM', 'WAGER', 'HARD'];


	const getRoundQuestions = async () => {
		const qResponse = await postFetch(`${baseURL}/viewquestionsdiff`, {
			difficulty: currRound.toLowerCase()
		});

		let counter = 0
		let questionsList = []

		await Promise.all(
			qResponse.questions?.map( async (question)=>{
				let formattedQuestion = {};
				formattedQuestion.problemTitle = question.title;
				formattedQuestion.id = question.display_id;;
				counter += 1;
				formattedQuestion.dbId = question._id;
	
				const qeResponse = await postFetch(`${baseURL}/getlastsubmissionbyteam`, {
					problemId: question._id,
					teamId: JSON.parse(localStorage?.getItem("user"))._id
				});
	
				formattedQuestion.status = qeResponse.evaluation;
				formattedQuestion.score = qeResponse.score;
				formattedQuestion.checkedBy = qeResponse.checkedby;
	
				questionsList.push(formattedQuestion);
			})
		);
		//console.log(questionsList);
		const sortedList = [...questionsList].sort((a, b) => a.id - b.id);

		setCurrQuestions(sortedList);
	}

	useEffect(() => {
		getRoundQuestions();
	}, [currRound]);


	// Styling for the problem list table
	const additionalStyles = {
		backgroundColor: '#fff',
		overflow: 'auto',
	};

	// used for client-side routing to other pages
	const navigate = useNavigate();

	/**
   * Purpose: Handles opening of leaderboard modal window upon clicking the ellipsis button.
   * Params: <Object> receives information of selected problem in the Problem List Table.
   */
	const handleRowClick = (params) => {
		//console.log(params);
		let customParams = {
			checkedBy: params.row.checkedBy,
			id: params.row.dbId,
			problemTitle: params.row.problemTitle,
			score: params.row.score,
			status: params.row.status
		}

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
					mt : 8,
					// mt: { xl: 8 },
					mx: 0,
					// mx: { xs: 5, xl: 0},
					width: '68%',
					// width: {xl: '68%'},
					height: '100%',
					// display: "flex"
				}}
			>
				
				{/* Container for round buttons */}
				<Box sx={{
					display: 'flex', gap: 3,
					// justifyContent: {
					// 	xs: 'center', xl: 'initial'
					// }
					justifyContent: 'initial'
				}}>
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