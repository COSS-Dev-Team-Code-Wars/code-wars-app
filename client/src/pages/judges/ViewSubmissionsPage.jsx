/* eslint-disable */ 
import {
	useState,
	useEffect,
	useRef
} from 'react';

import {
	Box,
	MenuItem,
	Stack,
	Typography,
	Button,
} from '@mui/material';
import { cloneDeep } from 'lodash';
import { Link } from 'react-router-dom';

import {
	DropdownSelect,
	Table,
} from 'components/';
import { socketClient } from 'socket/socket';
import { getFetch } from 'utils/apiRequest';
import { baseURL } from 'utils/constants';
import {
	columnsSubmissions,
} from 'utils/dummyData';

import EvalEditInputCell from './submission-entries/EvalEditInputCell';
import renderEval from './submission-entries/EvalViewInputCell';
import TestCaseModal from './modals/TestCaseModal';


/**
 * Additional Styling for Submissions table
 */
const additionalStylesSubmissions = {
	backgroundColor: '#fff',
	paddingX: 2,
};


// temp; options for client-side filtering
const teamsList = [];
const questionsList = [];


/**
 * Purpose: Displays the View Submissions Page for judges.
 */
const ViewSubmissionsPage = ({ isLoggedIn }) => {

	//const [fetchAllPrevious, setFetchAllPrevious] = useState(false);
	const fetchAllPrevious = useRef(false);
	const [submissionsList, setSubmissionsList] = useState([]);
	const subListRef = useRef([]);
	const presentDbIds = useRef([]);

	const renderEvalEditInputCell = (params) => {
		return <EvalEditInputCell props={params} submissionsList={submissionsList} setSubmissionsList={setSubmissionsList} subListRef={subListRef} />;
	};

	/**
	 * State handler for team dropdown select
	 */
	const [selectedTeam, setSelectedTeam] = useState('');
	/**
	 * State handler for problem title dropdown select
	 */
	const [selectedProblem, setSelectedProblem] = useState('');
	/**
	 * State handler for dropdown select options
	 */
	const [options, setOptions] = useState([]);


	useEffect(()=>{
		console.log(submissionsList);
	}, [submissionsList]);


	useEffect(()=>{
		handleSocket();
	}, [fetchAllPrevious]);


	useEffect(()=>{
		if (isLoggedIn) {
			if (!fetchAllPrevious.current) {
				fetchAllPrevious.current = true;
				getSubmissions();
			}
		}
	}, [isLoggedIn]);


	/**
	 * Handles on click event on submitted file for a particular submission entry.
	 */
	const handleDownload = (e, params) => {
		e.preventDefault();
		console.log(params);
		downloadFile(params.row.uploadedFile, params.row.content);

		params.row.hasFileDownloaded = true;

		if (params.row.evaluation == 'Pending') {
			console.log(cloneDeep(submissionsList));
			params.row.isDisabled = false;

			var copy = cloneDeep(submissionsList);

			setSubmissionsList(copy);
			subListRef.current = copy;
			console.log(copy);
		} else {
			params.row.isDisabled = true;
		}
	};

	/**
	 * Handles downloading of file.
	 */
	const downloadFile = (filename, data) => {
		const blob = new Blob([data]);
		const elem = window.document.createElement('a');
		elem.href = window.URL.createObjectURL(blob);
		elem.download = filename;      
		elem.style.display = 'none';  
		document.body.appendChild(elem);
		elem.click();        
		document.body.removeChild(elem);
		window.URL.revokeObjectURL(elem.href);
	};

	const [openModal, setOpenModal] = useState(false);
	const [selectedSubmission, setSelectedSubmission] = useState(null);

	/**
	 * Rendering cells dropdown selects for uploaded file and evaluation column of submission table
	 */
	const modifiedSubmissionColumns = columnsSubmissions.map((obj) => {
		if (obj.field === 'evaluation') {
			return {
				...obj,
				renderEditCell: renderEvalEditInputCell,
				renderCell: renderEval,
			};
		}
		if (obj.field === 'uploadedFile') {
			return {
				...obj,
				renderCell: (params) => {
					return (
						<Link
							target="_blank"
							download
							onClick={(e) => {handleDownload(e, params);}}
						>
							{params.value}
						</Link>
					);
				}
			};
		}
		if (obj.field === 'runTests') {
			return {
				...obj,
				renderCell: (params) => {
					return (
						<Button 
							variant="contained" 
							color="primary"
							onClick={() => {
								setOpenModal(true);
								setSelectedSubmission(params.row);
							}}
						>
							Run Tests
						</Button>
					);
				}
			};
		}
		return obj;
	});

	/**
	* Sets state of selectedTeam for filtering.
	*/
	const handleTeams = (e) => {
		setSelectedTeam(e.target.value);
	};

	/**
	* Sets state of selectedProblem for filtering.
	*/
	const handleProblems = (e) => {
		setSelectedProblem(e.target.value);
	};
	
	
	/**
	* Client-side filtering based on values from the dropdown selects.
  * will be replaced if magkakaron ng server-side filtering
	*/
	const getFilteredRows = (rowsSubmissions) => {
		// will hold the filtered rows
		let temp = [];
		let temp2 = [];

		if (selectedTeam === '' & selectedProblem === '') return rowsSubmissions;

		// Filter out rows based on selectedTeam
		if (selectedTeam != '') {
			rowsSubmissions.filter((row) => {
				// if entry is submitted by selectedTeam
				if (row.teamName === selectedTeam) {
					// If matched row is not yet in temp, push to temp
					if (!temp.find(obj => obj.id === row.id)) {
						temp.push(row);
					}
				}
			});
		}
		
		if (selectedProblem != '') {
			// if there is a selectedTeam, filter based on temp, not on rowsSubmissions
			if (temp.length > 0) {
				temp.filter((row) => {
					// if problemTitle matches selectedProblem
					if (row.problemTitle === selectedProblem) {
						// If matched row is not yet in temp2, push to temp
						if (!temp2.find(obj => obj.id === row.id)) {
							temp2.push(row);
						}
					}
				});
				return temp2;
			
			// if there is no selected team
			} else {
				rowsSubmissions.filter((row) => {
					// if problemTitle matches selectedProblem
					if (row.problemTitle === selectedProblem) {
						// If matched row is not yet in temp2, push to temp
						if (!temp.find(obj => obj.id === row.id)) {
							temp.push(row);
						}
					}
				});
				return temp;
			}
		}
		return temp;
	};

	/**
	 * Real-time updating of submission entries.
	 */
	const handleSocket = () => {
		
		if (!socketClient) {
			console.log('There is a problem with the socketClient');
			return;
		} else {
			//console.log("socketClient is present")
		}

		socketClient.on('newupload', (arg)=>{
			//console.log(subListRef.current);

			if (!presentDbIds.current.includes(arg._id)) {
				presentDbIds.current.push(arg._id);

				let newsubmission = {};
				newsubmission.id = arg.display_id;
				newsubmission.teamName = arg.team_name;
				newsubmission.problemTitle = arg.problem_title;
				newsubmission.submittedAt = new Date(arg.timestamp).toLocaleTimeString();
				newsubmission.uploadedFile = arg.filename;
				newsubmission.evaluation = arg.evaluation;
				newsubmission.checkedBy = arg.judge_name;
				newsubmission.content = arg.content,
				newsubmission.possible_points = arg.possible_points,
				newsubmission.dbId = arg._id;
				newsubmission.totalCases = arg.total_test_cases;

				newsubmission.isDisabled = true;

				let newSubmissionsList = [];
				let present = false;
				
				subListRef.current?.map((submission)=>{
					//console.log(submission.dbId,"==",newsubmission.dbId);
					if (submission.dbId == newsubmission.dbId) {
						present = true;
					} else {
						newSubmissionsList.push(submission);
					}
				});
				newSubmissionsList.unshift(newsubmission);

				//console.log(subListRef.current,"\n", newSubmissionsList, "\n", present);

				if (!present) {
					//console.log("NEW SUBMISSION:",arg._id,"\n", new Date().toLocaleTimeString());
					setSubmissionsList(newSubmissionsList);
					subListRef.current = newSubmissionsList;
				}
			}
			//getSubmissions();
		});

		socketClient.on('evalupdate', (arg)=>{
			var judgeId = JSON.parse(localStorage?.getItem('user'))?._id;
			
			if (judgeId != arg.judge_id) {
				//console.log("evalupdate", arg);
				//let copy = cloneDeep(submissionsList);
				let foundIt = false;

				let newSubmissionsList = [];

				subListRef.current?.map((submission)=>{
					//console.log(submission.dbId,"==",newsubmission.dbId);
					if (!foundIt && submission.id == arg.display_id) {
						foundIt = true;

						submission.id = arg.display_id;
						submission.teamName = arg.team_name;
						submission.problemTitle = arg.problem_title;
						submission.submittedAt = new Date(arg.timestamp).toLocaleTimeString();
						submission.uploadedFile = arg.filename;
						submission.evaluation = arg.evaluation;
						submission.checkedBy = arg.judge_name;
						submission.content = arg.content;
						submission.possible_points = arg.possible_points;
						submission.dbId = arg._id;
						submission.totalCases = arg.total_test_cases;
						submission.isDisabled = true;
					}
					newSubmissionsList.push(submission);
				});
				
				//console.log(copy);
				setSubmissionsList(newSubmissionsList);
				subListRef.current = newSubmissionsList;
			}


		});
  
		return () => {
			socketClient.off('newupload');
			socketClient.off('evalupdate');
		};

	}; 

	/**
	 * Fetching submissions on page mount.
	 */
	const getSubmissions = async () => {
		const submissions = await getFetch(`${baseURL}/getallsubmissions`,);

		let submissionEntries = [];

		if (submissions.results.length > 0) {
			// map out the entries returned by fetch
			submissions.results.forEach((entry, index) => {
				// entries should be in reverse chronological order
				submissionEntries.unshift({
					id: entry.display_id,//submissions.results.length - index,
					teamName: entry.team_name,
					problemTitle: entry.problem_title,
					submittedAt: new Date(entry.timestamp).toLocaleTimeString(),
					uploadedFile: entry.filename,
					evaluation: entry.evaluation,
					checkedBy: entry.judge_name,
					content: entry.content,
					possible_points: entry.possible_points,
					dbId: entry._id,
					totalCases: entry.total_test_cases,
					isDisabled: true
				});

				// add team name to teamsList
				if (!teamsList.includes(entry.team_name)) {
					teamsList.push(entry.team_name);
				}
				// add problem title to questionsList
				if (!questionsList.includes(entry.problem_title)) {
					questionsList.push(entry.problem_title);
				}
				
				presentDbIds.current.push(entry._id);

				// set options for dropdown select filtering
				setOptions([teamsList, questionsList]);
			});

			// setting UI table state
			setSubmissionsList([...submissionEntries]);
			subListRef.current = submissionEntries;
		}


		//console.log(questionsList, teamsList)
		// console.log(options[0])
		// console.log(options[1])
		//console.log("submissionEntries", submissionEntries)

		//setFetchAllPrevious(true);
		
		//handleSocket();
	};
	
	
	return (
		<Stack spacing={5} sx={{
			mt: 5, mx: {
				xs: 5,
				md: 8,
				lg: 15
		}}} >
			
			{/* Dropdown selects for team name and problem title */}
			<Box sx={{
				display: 'flex',
				flexDirection: {
					xs: 'column',
					md: 'row'
				},
				gap: 5,
			}}>
				<DropdownSelect
					isDisabled={false}
					label="Team Name"
					minWidth="28%"
					variant="filled"
					options={teamsList}
					handleChange={handleTeams}
					value={selectedTeam}
				>
					{/* Empty Value */}
					<MenuItem value="">
						<em>All</em>
					</MenuItem>
				</DropdownSelect>

				<DropdownSelect
					isDisabled={false}
					minWidth="38%"
					variant="filled"
					label="Problem Title"
					options={questionsList}
					handleChange={handleProblems}
					value={selectedProblem}
				>
					{/* Empty Value */}
					<MenuItem value="">
						<em>All</em>
					</MenuItem>
				</DropdownSelect>
			</Box>

			{/* Submission Entry Table */}
			<Table
				rows={getFilteredRows(submissionsList)}// useMemo(() => {return getFilteredRows(rowsSubmissions)}, [selectedTeam, selectedProblem] ) // Replaced original for now due to error happening when # of hooks used change between renders
				columns={modifiedSubmissionColumns}// useMemo(() => {return modifiedSubmissionColumns}, [] )
				hideFields={[]}
				additionalStyles={additionalStylesSubmissions}
				density={'comfortable'}
				columnHeaderHeight={45}
				pageSizeOptions={[5, 8, 10]}
				autoHeight
				initialState={{
					pagination: { paginationModel: { pageSize: 5 } },
				}}
				getCellClassName={(params) => {
					if (params.field === 'submittedAt') {
						return 'timeColumn';
					}
				}}

				// if there are no submission entries yet
				slots={{
					noRowsOverlay: () => (
						<Stack height="100%" alignItems="center" justifyContent="center">
							<Typography><em>No records to display.</em></Typography>
						</Stack>
					)
				}}
			/>
			<TestCaseModal 
				open={openModal} 
				setOpen={setOpenModal} 
				submission={selectedSubmission} 
			/>
		</Stack>
	);
};

export default ViewSubmissionsPage;