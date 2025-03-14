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
import { getFetch } from "utils/apiRequest";
import { baseURL } from "utils/constants";
import judge0API from "utils/judge0";

const programmingLanguages = [
    { name: "Python", value: "python", extension: ".py", id: 71 },
    //{ name: "C++", value: "cpp", extension: ".cpp", id: 54 },
    { name: "C", value: "c", extension: ".c", id: 50 },
    //{ name: "JavaScript", value: "javascript", extension: ".js", id: 63 },
    //{ name: "Java", value: "java", extension: ".java", id: 62 },
    //{ name: "Go", value: "go", extension: ".go", id: 60 },
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
    if (submission?.problem_title) {
      await fetchProblemId(submission.problem_title);
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
        const response = await judge0API.postSubmissions({
          source_code: submission.content,
          language_id: language,
          stdin: testCase.input.replace(/\\n/g, "\n"),
          expected_output: testCase.expected_output.replace(/\\n/g, "\n"),
        });

        if (response.token) {
          // Poll Judge0 for this specific test case
          const fetchResult = async (token, testCase) => {
            const maxRetries = 20; // Stop after 20 attempts (20 sec max)
            let retries = 0;
          
            while (retries < maxRetries) {
              const res = await judge0API.getSubmissions(token);
          
              if (res && res.status && res.status.id >= 3) { // Status 3+ means completed
                setResults((prevResults) =>
                  prevResults.map((r) =>
                    r.testCase.display_id === testCase.display_id
                      ? { testCase, result: res }
                      : r
                  )
                );
                return; // Stop polling once we get a result
              }
          
              retries++;
              await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 sec before retrying
            }
          
            setError(`Test case #${testCase.display_id} timed out`);
          };                    

          fetchResult(response.token, testCase);
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

  const cleanOutput = (stdout, expected) => {
    if (!stdout) return ""; // Handle empty output
  
    stdout = stdout.trimEnd();
    expected = expected.trimEnd();
  
    // Normalize line breaks and spaces before comparing
    const normalize = (str) => {
      return str
        .split("\n")  // Split by lines
        .map(line => line)
        .join("\n");  // Rejoin with line breaks
    };
  
    // Normalize both the stdout and expected output
    const normalizedStdout = normalize(stdout);
    const normalizedExpected = normalize(expected);
  
    // If the normalized output is equal to the expected, return the output
    if (normalizedStdout === normalizedExpected) {
      return normalizedStdout;
    }
  
    return stdout;
  };  

  return (
    <CustomModal isOpen={open} setOpen={setOpen} windowTitle="Test Case Results">
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box sx={{ maxHeight: "250px", overflowY: "auto" }}>
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
                  cleanOutput(result.stdout, testCase.expected_output) === testCase.expected_output
                    ? "#d4edda"
                    : cleanOutput(result.stdout, testCase.expected_output) || result.stderr
                    ? "#f8d7da"
                    : "white",
                marginBottom: "5px",
                padding: "10px",
                borderRadius: "5px",
            }}
            >
            <ListItemText
              primary={<Typography variant="body2" sx={{ fontWeight: "bold" }}>Test Case #{index + 1}</Typography>}
              secondary={
                <>
                  <Typography variant="body2" sx={{ marginTop: "15px", fontWeight: "bold" }}>Input:</Typography>
                  
                  <Typography variant="body2">
                    <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                      {testCase.input.replace(/\\n$/g, "").replace(/\\n/g, ", ")}
                    </pre>
                  </Typography>

                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>Expected Output:</Typography>
                  
                  <Typography variant="body2">
                    <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                      {cleanOutput(testCase.expected_output, testCase.expected_output)}
                    </pre>
                  </Typography>

                  {result.status.description === "Running..." ? (
                    <Typography variant="body2" color="gray"><em>Running...</em></Typography>
                  ) : (
                    <>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>Actual Output:</Typography>
                      
                      <Typography variant="body2">
                        <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                          {cleanOutput(result.stdout, testCase.expected_output) || (result.stderr ? "Error: " + result.stderr : "Error")}
                        </pre>
                      </Typography>
                    </>
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

        <Box sx={{ maxHeight: "400px", overflowY: "auto", padding: "5px", backgroundColor: "#f4f4f4", borderRadius: "5px" }}>
          <Typography variant="body2" component="pre" sx={{ whiteSpace: "pre-wrap" }}>
            {submission?.content || "No content available"}
          </Typography>
        </Box>
      </Box>
    </CustomModal>
  );
};

export default TestCaseModal;
