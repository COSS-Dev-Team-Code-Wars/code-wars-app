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
  Typography
} from '@mui/material';
import { cloneDeep } from 'lodash';
import { Link, useOutletContext } from 'react-router-dom';

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

import EvalEditInputCell from '../judges/submission-entries/EvalEditInputCell';
import renderEval from '../judges/submission-entries/EvalEditInputCell';

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
const ViewSubmissionLogPage = ({ isLoggedIn }) => {
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

  const {
		teamInfo
	} = useOutletContext();

  useEffect(() => {
    console.log(submissionsList);
  }, [submissionsList]);

  useEffect(() => {
    handleSocket();
  }, [fetchAllPrevious]);

  useEffect(() => {
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

  /**
   * Rendering cells dropdown selects for uploaded file and evaluation column of submission table
   */
  const modifiedSubmissionColumns = columnsSubmissions.filter((obj) => 
    ['id', 'problemTitle', 'submittedAt', 'uploadedFile'].includes(obj.field)
  ).map((obj) => {
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
              onClick={(e) => { handleDownload(e, params); }}
            >
              {params.value}
            </Link>
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
    return rowsSubmissions;
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

    socketClient.on('newupload', (arg)=> {
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
				
				subListRef.current?.map((submission)=> {
					if (submission.dbId == newsubmission.dbId) {
						present = true;
					} else {
						newSubmissionsList.push(submission);
					}
				});
				newSubmissionsList.unshift(newsubmission);

				if (!present) {
					setSubmissionsList(newSubmissionsList);
					subListRef.current = newSubmissionsList;
				}
			}
		});

    socketClient.on('evalupdate', (arg)=> {
			var judgeId = JSON.parse(localStorage?.getItem('user'))?._id;
			
			if (judgeId != arg.judge_id) {
				let foundIt = false;

				let newSubmissionsList = [];

				subListRef.current?.map((submission)=> {
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
      const submissions = await getFetch(`${baseURL}/getallsubmissions`);
  
      let submissionEntries = [];
  
      if (submissions.results.length > 0) {
        // map out the entries returned by fetch
        submissions.results.forEach((entry, index) => {
          // entries should be in reverse chronological order
          submissionEntries.unshift({
            id: entry.display_id,
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

      console.log("Fetched submissions:", submissionEntries);
    };

  return (
    <Stack spacing={5} sx={{
      mt: 5, mx: {
        xs: 5,
        md: 8,
        lg: 15
      },
      mb: 2.5 // Add bottom margin
    }} >

      {/* Dropdown selects for problem title */}
      <Box sx={{
        display: 'flex',
        flexDirection: {
          xs: 'column',
          md: 'row'
        },
      }}>

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
        rows={getFilteredRows(submissionsList)}
        columns={modifiedSubmissionColumns}
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
    </Stack>
  );
};

export default ViewSubmissionLogPage;