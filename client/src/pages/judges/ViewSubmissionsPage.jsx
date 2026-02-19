import { useEffect, useState, useMemo, useCallback } from "react";
import { Box, Button, Link, MenuItem, Select, Stack } from "@mui/material";
import { AllCommunityModule, themeQuartz, colorSchemeLight } from "ag-grid-community";
import { AgGridReact, AgGridProvider } from "ag-grid-react";
import { ConfirmWindow, FilterDropdown } from "components";
import { getFetch, postFetch } from "utils/apiRequest";
import { baseURL } from "utils/constants";
import { optionsEval } from "utils/dummyData";
import { socketClient } from "socket/socket";
import TestCaseModal from "./modals/TestCaseModal";
import EvaluationModal from "./modals/PartiallyCorrectModal";

/* Clean white AG Grid theme */
const gridTheme = themeQuartz.withPart(colorSchemeLight).withParams({
  backgroundColor: "#ffffff",
  foregroundColor: "#333333",
  headerBackgroundColor: "#fafafa",
  headerFontWeight: 700,
  headerTextColor: "#707070",
  oddRowBackgroundColor: "#fafafa",
  rowHoverColor: "rgba(0, 0, 0, 0.04)",
  borderColor: "rgba(0, 0, 0, 0.07)",
  accentColor: "#1976d2",
  fontSize: 14,
  headerFontSize: 13,
  spacing: 8,
  wrapperBorderRadius: 10,
  columnBorder: false,
});

const modules = [AllCommunityModule];

const ViewSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState();
  const [teamsList, setTeamsList] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [problemsList, setProblemsList] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState("");
  const [isRunTestModalOpen, setIsRunTestModalOpen] = useState(false);
  const [isEvaluateModalOpen, setIsEvaluateModalOpen] = useState(false);

  // ── Cell Renderers ───────────────────────────────────────────────

  const UploadedFileCellRenderer = useCallback((params) => {
    const handleDownload = () => {
      const blob = new Blob([params.data.content]);
      const elem = window.document.createElement("a");
      elem.href = window.URL.createObjectURL(blob);
      elem.download = params.value;
      elem.style.display = "none";
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
      window.URL.revokeObjectURL(elem.href);
    };
    return (
      <Link
        component="button"
        onClick={handleDownload}
        sx={{ color: "#1976d2", textDecoration: "underline", cursor: "pointer", fontSize: "inherit" }}
      >
        {params.value}
      </Link>
    );
  }, []);

  const TestCasesCellRenderer = useCallback((params) => {
    return (
      <Button
        variant="contained"
        size="small"
        color="primary"
        onClick={() => {
          setIsRunTestModalOpen(true);
          setSelectedSubmission(params.data);
        }}
        sx={{
          textTransform: "none",
          fontWeight: 600,
          borderRadius: "8px",
          px: 2,
          py: 0.5,
          fontSize: "0.8rem",
        }}
      >
        Run Tests
      </Button>
    );
  }, []);

  const EvaluationCellRenderer = useCallback(
    (params) => {
      const handleChange = (e) => {
        handleTypeChange(params.data, e.target.value);
      };
      return (
        <Select
          value={params.value || ""}
          onChange={handleChange}
          size="small"
          fullWidth
          sx={{
            fontSize: "0.85rem",
            borderRadius: "8px",
            "& .MuiSelect-select": { padding: "8px 14px" },
          }}
        >
          {optionsEval.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ── Column Definitions ──────────────────────────────────────────

  const columnDefs = useMemo(
    () => [
      { field: "id", headerName: "ID", width: 90, sortable: true },
      { field: "team_name", headerName: "Team Name", minWidth: 160, flex: 1, sortable: true, filter: true },
      { field: "problem_title", headerName: "Problem Title", minWidth: 200, flex: 1.5, sortable: true, filter: true },
      { field: "submitted_at", headerName: "Submitted At", width: 150, sortable: true },
      {
        field: "uploadedFile",
        headerName: "Uploaded File",
        minWidth: 200,
        flex: 1,
        cellRenderer: UploadedFileCellRenderer,
      },
      {
        field: "testCases",
        headerName: "Test Cases",
        width: 150,
        cellRenderer: TestCasesCellRenderer,
        sortable: false,
        filter: false,
      },
      {
        field: "evaluation",
        headerName: "Evaluation",
        width: 200,
        cellRenderer: EvaluationCellRenderer,
        sortable: false,
        filter: false,
      },
      { field: "judge", headerName: "Judge", minWidth: 160, flex: 1 },
    ],
    [UploadedFileCellRenderer, TestCasesCellRenderer, EvaluationCellRenderer]
  );

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: false,
      filter: false,
    }),
    []
  );

  // ── Data Loading ────────────────────────────────────────────────

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

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socketClient) return;
    socketClient.on("newupload", () => loadSubmissions());
    socketClient.on("evalupdate", () => loadSubmissions());
    return () => {
      socketClient.off("newupload");
      socketClient.off("evalupdate");
    };
  }, [loadSubmissions]);

  // ── Handlers ────────────────────────────────────────────────────

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
    setSubmissions((prev) => prev.map((row) => (row.id === id ? { ...row, evaluation } : row)));
  };

  const filteredRows = useMemo(() => {
    return submissions.filter((row) => {
      const matchedTeam = selectedTeam === "" || row.team_name === selectedTeam;
      const matchedProblem = selectedProblem === "" || row.problem_title === selectedProblem;
      return matchedTeam && matchedProblem;
    });
  }, [submissions, selectedTeam, selectedProblem]);

  // Row class for checked submissions
  const getRowClass = useCallback((params) => {
    return params.data?.status === "checked" ? "submission-checked" : "";
  }, []);

  // ── Render ──────────────────────────────────────────────────────

  return (
    <Stack spacing={3} sx={{ mt: 4, mx: { xs: 3, md: 6, lg: 12 }, mb: 4, height: "calc(100vh - 140px)" }}>
      {/* Dropdown filters */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
        <FilterDropdown
          label="Team Name"
          options={teamsList}
          value={selectedTeam}
          onChange={setSelectedTeam}
        />
        <FilterDropdown
          label="Problem Title"
          options={problemsList}
          value={selectedProblem}
          onChange={setSelectedProblem}
        />
      </Box>

      {/* AG Grid Table — white container */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          borderRadius: "10px",
          overflow: "hidden",
          bgcolor: "#ffffff",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
          /* Checked submission rows */
          "& .submission-checked": {
            backgroundColor: "#b7f0c7 !important",
            color: "#0b5a2e",
            fontWeight: 600,
          },
          "& .submission-checked:hover": {
            backgroundColor: "#9ae6b4 !important",
          },
        }}
      >
        <AgGridProvider modules={modules}>
          <AgGridReact
            theme={gridTheme}
            rowData={filteredRows}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={15}
            paginationPageSizeSelector={[10, 15, 20, 50]}
            animateRows={true}
            rowSelection="single"
            getRowClass={getRowClass}
            suppressCellFocus={true}
            domLayout="normal"
            overlayNoRowsTemplate={
              '<div style="padding:40px;text-align:center;color:#999;font-size:1.1rem;">No submissions yet</div>'
            }
          />
        </AgGridProvider>
      </Box>

      {/* Modals */}
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

export default ViewSubmissionsPage;
