/* eslint-disable */
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { CustomModal } from "components";
import { postFetch, getFetch } from "utils/apiRequest";
import { baseURL } from "utils/constants";

const programmingLanguages = [
    { name: "Python", value: "python", extension: ".py", id: 71 },
    { name: "C++", value: "cpp", extension: ".cpp", id: 54 },
    { name: "C", value: "c", extension: ".c", id: 50 },
    { name: "JavaScript", value: "javascript", extension: ".js", id: 63 },
    { name: "Java", value: "java", extension: ".java", id: 62 },
    { name: "Go", value: "go", extension: ".go", id: 60 },
];  

const TestCaseModal = ({ open, setOpen, submission }) => {
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [problemId, setProblemId] = useState(null);

  const getLanguage = (filename) => {
    const ext = filename.substring(filename.lastIndexOf("."));
    const lang = programmingLanguages.find((lang) => lang.extension === ext);
    return lang ? lang.id : null;
  };  

  const handleOpen = async () => {
    if (submission?.problemTitle) {
      await fetchProblemId(submission.problemTitle);
    }
    if (problemId) {
      await fetchTestCases();
    }
  };
  
  useEffect(() => {
    if (open) {
      handleOpen();
    }
  }, [open]);
  

  useEffect(() => {
    if (problemId) {
      fetchTestCases();
    }
  }, [problemId]);

  const runJudge0Tests = async (testCases) => {
    const language = getLanguage(submission.uploadedFile);
    if (!language) {
      setError("Unsupported language");
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
  
      // Initialize test case results with a "Running..." status
      setResults(testCases.map(testCase => ({
        testCase,
        result: { status: { description: "Running..." } } // Placeholder until result arrives
      })));
  
      // Submit each test case separately and update results immediately
      for (const testCase of testCases) {  
        const response = await postFetch(`http://localhost:2358/submissions?base64_encoded=false`, {
          source_code: submission.content,
          language_id: language,
          stdin: testCase.input.replace(/\\n/g, "\n"),
          expected_output: testCase.expected_output,
        });
    
        if (response.token) {
          // Poll Judge0 for this specific test case
          const fetchResult = async () => {
            while (true) {
              const res = await fetch(`http://localhost:2358/submissions/${response.token}`);
              const data = await res.json();
  
              if (data.status && data.status.id >= 3) { // Status 3+ means completed
                // Update results **immediately** for this test case
                setResults((prevResults) =>
                  prevResults.map((r) =>
                    r.testCase.display_id === testCase.display_id
                      ? { testCase, result: data }
                      : r
                  )
                );
                break; // Exit loop when result is ready
              }
  
              await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait before retrying
            }
          };
  
          fetchResult(); // Start polling for this test case result immediately
        }
      }
    } catch (err) {
      setError("Error running tests on Judge0");
    } finally {
      setLoading(false);
    }
  };  
  
  const fetchProblemId = async (problemTitle) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getFetch(`${baseURL}/viewquestions`);
      
      if (response.success) {
        const matchedProblem = response.questions.find(
          (q) => q.title === problemTitle
        );

        if (matchedProblem) {
          setProblemId(matchedProblem.display_id);
        } else {
          setError("Problem not found");
        }
      } else {
        setError("Failed to fetch problems");
      }
    } catch (err) {
      setError("Error fetching problems");
    } finally {
      setLoading(false);
    }
  };

  const fetchTestCases = async () => {
    if (!problemId) return; // Prevent API call if problemId is null
  
    try {
      setLoading(true);
      setError(null);
      const response = await getFetch(`${baseURL}/testcases/${problemId}`);
  
      if (response.success) {
        setTestCases(response.testCases);
        runJudge0Tests(response.testCases);
      } else {
        setError(response.message || "Failed to fetch test cases");
      }
    } catch (err) {
      setError("Error fetching test cases");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal isOpen={open} setOpen={setOpen} windowTitle="Test Case Results">
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box sx={{ maxHeight: "400px", overflowY: "auto" }}>
          <Typography variant="body1" sx={{ marginBottom: "20px" }}>
            Below are the test cases and their results:
          </Typography>
        <List>
        {results.map(({ testCase, result }, index) => (
            <ListItem
            key={index}
            sx={{
                display: "flex",
                justifyContent: "space-between",
                backgroundColor:
                result.stdout?.trim() === testCase.expected_output?.trim()
                    ? "#d4edda"
                    : result.stdout
                    ? "#f8d7da"
                    : "white",
                marginBottom: "5px",
                padding: "10px",
                borderRadius: "5px",
            }}
            >
            <ListItemText
                primary={`Test Case #${testCase.display_id}`}
                secondary={
                <>
                    <Typography variant="body2"><strong>Input:</strong> {testCase.input.replace(/\\n$/g, "").replace(/\\n/g, ", ")}</Typography>
                    <Typography variant="body2"><strong>Expected Output:</strong> {testCase.expected_output}</Typography>
                    {result.status.description === "Running..." ? (
                    <Typography variant="body2" color="gray"><em>Running...</em></Typography>
                    ) : (
                    <Typography variant="body2"><strong>Actual Output:</strong> {result.stdout?.trim() || "Error"}</Typography>
                    )}
                </>
                }
            />
            </ListItem>
        ))}
        </List>
        </Box>
      )}

      <Box sx={{ marginTop: "20px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px", width: "800px"}}>
        <Typography variant="h6" color="#4978c6" sx={{ fontWeight: "bold" }}>Uploaded File</Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          {submission?.uploadedFile || "No file uploaded"}
        </Typography>

        <Box sx={{ maxHeight: "200px", overflowY: "auto", padding: "5px", backgroundColor: "#f4f4f4", borderRadius: "5px", maxHeight: "550px" }}>
          <Typography variant="body2" component="pre" sx={{ whiteSpace: "pre-wrap" }}>
            {submission?.content || "No content available"}
          </Typography>
        </Box>
      </Box>
    </CustomModal>
  );
};

export default TestCaseModal;
