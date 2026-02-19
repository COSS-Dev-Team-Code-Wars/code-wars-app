import { useEffect, useState, useMemo, useCallback } from "react";
import { Box, Button, Link, MenuItem, Select, Stack } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { DropdownSelect, ConfirmWindow } from "components";
import { getFetch, postFetch } from "utils/apiRequest";
import { baseURL } from "utils/constants";
import { optionsEval } from "utils/dummyData";
import { socketClient } from "socket/socket";
import TestCaseModal from "./modals/TestCaseModal";
import EvaluationModal from "./modals/PartiallyCorrectModal";

const ViewSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState();
  const [teamsList, setTeamsList] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [problemsList, setProblemsList] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState("");
  const [isRunTestModalOpen, setIsRunTestModalOpen] = useState(false);
  const [isEvaluateModalOpen, setIsEvaluateModalOpen] = useState(false);
  const columns = [
    { field: "id", headerName: "ID", width: 75 },
    { field: "team_name", headerName: "Team Name", width: 200 },
    { field: "problem_title", headerName: "Problem Title", width: 300 },
    { field: "submitted_at", headerName: "Submitted At", width: 150 },
    {
      field: "uploadedFile",
      headerName: "Uploaded File",
      width: 300,
      renderCell: (cell) => {
        return (
          <Link target="_blank" download onClick={() => handleDownload(cell)}>
            {cell.value}
          </Link>
        );
      },
    },
    {
      field: "testCases",
      headerName: "Test Cases",
      width: 150,
      renderCell: (cell) => {
        return (
          <Button variant="contained" color="primary" onClick={() => handleClickRunTest(cell.row)}>
            Run Tests
          </Button>
        );
      },
    },
    {
      field: "evaluation",
      headerName: "Evaluation",
      width: 200,
      renderCell: (cell) => {
        return (
          <Select
            value={cell.value}
            onChange={(e) => handleTypeChange(cell.row, e.target.value)}
            sx={{ border: "0px", outline: "none", "& .MuiSelect-select": { padding: "10px 14px" }, "&:focus": { border: "none" } }}
            fullWidth
          >
            {optionsEval.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        );
      },
    },
    { field: "judge", headerName: "Judge", width: 250 },
  ];

  const handleClickRunTest = (submission) => {
    setIsRunTestModalOpen(true);
    setSelectedSubmission(submission);
  };

  // Memoize loadSubmissions to avoid re-creating it on every render
  const loadSubmissions = useCallback(async () => {
    const submissions = await getFetch(`${baseURL}/getallsubmissions`);
    const transformedData = submissions.results.map(({ _id, timestamp, filename, judge_name, ...rest }) => ({
      id: _id,
      uploadedFile: filename,
      submitted_at: new Date(timestamp).toLocaleTimeString(),
      judge: judge_name,
      ...rest,
    }));
    console.log(transformedData);
    setSubmissions(transformedData);
    setTeamsList([...new Set(transformedData.map((e) => e.team_name))]);
    setProblemsList([...new Set(transformedData.map((e) => e.problem_title))]);
  }, []);

  // Initial load
  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socketClient) return;

    // Listen for new submissions
    socketClient.on('newupload', () => {
      loadSubmissions();
    });

    // Listen for evaluation updates from other judges
    socketClient.on('evalupdate', () => {
      loadSubmissions();
    });

    return () => {
      socketClient.off('newupload');
      socketClient.off('evalupdate');
    };
  }, [loadSubmissions]);

  const handleDownload = (cell) => {
    const blob = new Blob([cell.row.content]);
    const elem = window.document.createElement("a");
    elem.href = window.URL.createObjectURL(blob);
    elem.download = cell.row.uploadedFile;
    elem.style.display = "none";
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
    window.URL.revokeObjectURL(elem.href);
  };

  const handleTypeChange = async (submission, evaluation) => {
    if (evaluation === "Partially Correct") {
      setSelectedSubmission(submission);
      setIsEvaluateModalOpen(true);
      return;
    }
    const { isConfirmed } = await ConfirmWindow.fire({
      html: `Are you sure you want to choose ${evaluation} as the evaluation?<br /><br />Submitted evaluations are final and irreversible.`,
    });
    if (!isConfirmed) return;
    let judgeID = JSON.parse(localStorage?.getItem("user"))?._id;
    let judgeName = JSON.parse(localStorage?.getItem("user"))?.username;
    postFetch(`${baseURL}/checksubmission`, {
      submissionId: submission.id,
      evaluation: evaluation,
      judgeId: judgeID,
      judgeName: judgeName,
      correctCases: evaluation === "Correct" ? submission.total_test_cases : 0,
      possiblePoints: submission.possible_points,
    });
    updateEvaluationOfSubmission(submission.id, evaluation);
  };

  const updateEvaluationOfSubmission = (id, evaluation) => {
    setSubmissions(submissions.map((row) => (row.id === id ? { ...row, evaluation } : row)));
  };

  const filteredRows = useMemo(() => {
    return submissions.filter((row) => {
      const matchedTeam = selectedTeam === "" || row.team_name === selectedTeam;
      const matchedProblem = selectedProblem === "" || row.problem_title === selectedProblem;
      return matchedTeam && matchedProblem;
    });
  }, [submissions, selectedTeam, selectedProblem]);

  return (
    <Stack spacing={5} sx={{ mt: 5, mx: { xs: 5, md: 8, lg: 15 } }}>
      {/* Dropdown selects for team name and problem title */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 5 }}>
        <DropdownSelect
          isDisabled={false}
          label="Team Name"
          minWidth="28%"
          variant="filled"
          options={teamsList}
          handleChange={(e) => setSelectedTeam(e.target.value)}
          value={selectedTeam}
        >
          <MenuItem value="">
            <em>All</em>
          </MenuItem>
        </DropdownSelect>

        <DropdownSelect
          isDisabled={false}
          minWidth="38%"
          variant="filled"
          label="Problem Title"
          options={problemsList}
          handleChange={(e) => setSelectedProblem(e.target.value)}
          value={selectedProblem}
        >
          <MenuItem value="">
            <em>All</em>
          </MenuItem>
        </DropdownSelect>
      </Box>
      {submissions && (
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSize={10}
          density="comfortable"
          columnHeaderHeight={45}
          pageSizeOptions={[10, 15, 20]}
          autoHeight
          disableColumnSelector
          disableColumnFilter
          checkboxSelection={false}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          style={{ backgroundColor: "#FFFFFF", paddingX: 2 }}
          sx={commonStyles}
          getRowClassName={(params) => (params.row.status === 'checked' ? 'submission-checked' : '')}
        />
      )}
      <TestCaseModal open={isRunTestModalOpen} setOpen={setIsRunTestModalOpen} submission={selectedSubmission} />
      <EvaluationModal
        open={isEvaluateModalOpen}
        setOpen={setIsEvaluateModalOpen}
        submission={selectedSubmission}
        updateEvaluation={updateEvaluationOfSubmission}
      />
    </Stack>
  );
};

const commonStyles = {
  // modify cell typography
  ".MuiDataGrid-cell": {
    fontFamily: "Inter",
    fontSize: { xs: "0.93rem", xl: "0.98rem" },
    fontWeight: "400",
    borderLeft: "none",
    borderRight: "none",
    borderTop: "none",
    borderBottom: "1px solid rgba(0, 0, 0, 0.07)",
  },
  // make column header separator invisible
  ".MuiDataGrid-columnSeparator": { display: "none" },
  // remove cell focus on selection
  ".MuiDataGrid-cell:focus": { outline: "none" },
  // make cursor a pointer on all rows
  ".MuiDataGrid-row:hover": { cursor: "pointer" },
  // Change the color and width of the line
  ".MuiDataGrid-footerContainer": { borderTop: "none" },
  // Modify column header font styling
  ".MuiDataGrid-columnHeaderTitle": {
    fontWeight: "700",
    fontFamily: "Poppins",
    color: "#707070",
    fontSize: { xs: ".93rem", xl: ".98rem" },
  },
  backgroundColor: "#fff",
  paddingX: 2,
  // style for checked submissions (more prominent green)
  '& .submission-checked': {
    backgroundColor: '#b7f0c7',
    color: '#0b5a2e',
    fontWeight: 600,
  },
  '& .submission-checked .MuiDataGrid-cell': {
    backgroundColor: '#b7f0c7',
    color: '#0b5a2e',
    fontWeight: 600,
  },
  '& .submission-checked .MuiDataGrid-cell a': {
    color: '#0b5a2e',
  },
};

export default ViewSubmissionsPage;
