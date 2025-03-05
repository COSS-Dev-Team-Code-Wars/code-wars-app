import { useState, useEffect } from "react";
import { socketClient } from "socket/socket";
import { baseURL } from "utils/constants";
import Prism from "prismjs";
import Editor from "react-simple-code-editor";
import "prismjs/themes/prism-tomorrow.css";
import "./CodeEditor.css";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-java";
import "prismjs/components/prism-python";
import "prismjs/components/prism-go";
import "prismjs/components/prism-javascript";
import { Button, Typography } from "@mui/material";
import { postFetch, getFetch } from "utils/apiRequest";
import { CustomModal } from "components";

const programmingLanguages = [
  { name: "Python", value: "python", extension: ".py", id: 71 },
  //{ name: "C++", value: "cpp", extension: ".cpp" },
  { name: "C", value: "c", extension: ".c", id: 50 },
  //{ name: "JavaScript", value: "javascript", extension: ".js" },
  //{ name: "Java", value: "java", extension: ".java" },
  //{ name: "Go", value: "go", extension: ".go" },
];

function CodeEditor() {
  const id = new URLSearchParams(window.location.search).get("id");
  const user = JSON.parse(localStorage.getItem("user"));
  const [code, setCode] = useState(localStorage.getItem(id) || "");
  const [language, setLanguage] = useState(programmingLanguages[0]);
  const [isStunned, setIsStunned] = useState(false);
  const [isHighlightDisabled, setIsHighlightDisabled] = useState(false);
  const [isImmune, setIsImmune] = useState(false);
  const [isSubmissionError, setIsSubmissionError] = useState(false);
  const [isSubmissionSuccess, setIsSubmissionSuccess] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);

  // Handles applying debuffs and buffs
  const processDebuff = (debuff, activate) => {
    if (debuff.code === "stun") setIsStunned(activate);
    else if (debuff.code === "editor") setIsHighlightDisabled(activate);
    else if (["immune"].includes(debuff.code)) setIsImmune(activate);
  };

  // Handles WebSocket events for buffs and debuffs
  useEffect(() => {
    const loadActivePowerUps = async () => {
      try {
        const res = await fetch(`${baseURL}/teams/${user._id}`);
        const data = await res.json();

        [...data.team.active_buffs, ...data.team.debuffs_received].forEach((debuff) => processDebuff(debuff, true));
      } catch (error) {
        console.error("Error loading active power-ups:", error);
      }
    };
    loadActivePowerUps();

    const hadnleStartBuffOrDebuff = (powerUp) => processDebuff(powerUp, true);
    const handleEndBuffOrDebuff = (powerUp) => processDebuff(powerUp, false);
    socketClient.on("newDebuff", hadnleStartBuffOrDebuff);
    socketClient.on("debuffEnded", handleEndBuffOrDebuff);
    socketClient.on("newBuff", hadnleStartBuffOrDebuff);
    socketClient.on("buffEnded", handleEndBuffOrDebuff);
    return () => {
      socketClient.off("newDebuff", hadnleStartBuffOrDebuff);
      socketClient.off("debuffEnded", handleEndBuffOrDebuff);
      socketClient.off("newBuff", hadnleStartBuffOrDebuff);
    };
  }, []);

  // Highlights code based on the selected language and debuffs
  const highlightCode = (code) => {
    const selectedLanguage = isImmune || !isHighlightDisabled ? language.value : "plain";
    return Prism.highlight(code, Prism.languages[selectedLanguage] || Prism.languages.plain, selectedLanguage);
  };

  // Handles language selection
  const handleChangePL = (e) => {
    if (isStunned && !isImmune) return;
    const selected = programmingLanguages.find((pl) => pl.value === e.target.value);
    setLanguage(selected);
  };

  // Updates code in localStorage and state
  const handleCodeChange = (newCode) => {
    if (isStunned && !isImmune) return;
    localStorage.setItem(id, newCode);
    setCode(newCode);
  };

  // Handles code submission
  const handleSubmitCode = async () => {
    try {
      const { question } = await postFetch(`${baseURL}/viewquestioncontent`, { problemId: id, teamId: user._id });
      const body = {
        filename: `${user.username}-${question.title}${language.extension}`,
        content: code,
        problemId: question._id,
        problemTitle: question.title,
        possiblePoints: question.points,
        teamId: user._id,
        teamName: user.username,
        totalCases: question.total_cases,
        difficulty: question.difficulty,
      };
      if (["easy", "medium"].includes(question.difficulty.toLowerCase())) {
        body.problemSet = question.set;
        body.currentTeamEasySet = user.easy_set;
        body.currentTeamMediumSet = user.medium_set;
      }
      const res = await fetch(`${baseURL}/uploadsubmission`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 200) setIsSubmissionSuccess(true);
      else setIsSubmissionError(true);
    } catch (error) {
      console.error("Error submitting code:", error);
    }
  };

  const handleRunCode = async () => {
    try {
      setIsRunning(true);
      setRunResult(null);
      
      // Fetch question details to get problem ID and test cases
      const { question } = await postFetch(`${baseURL}/viewquestioncontent`, { 
        problemId: id, 
        teamId: user._id 
      });
  
      // Fetch test cases for this problem
      const testCasesResponse = await getFetch(`${baseURL}/testcases/${question.display_id}`);
      
      if (!testCasesResponse.success) {
        throw new Error('Failed to fetch test cases');
      }
  
      // Find the first test case (display_id: 1)
      const firstTestCase = testCasesResponse.testCases.find(tc => tc.display_id === 1);
  
      if (!firstTestCase) {
        throw new Error('No first test case found');
      }
  
      // Get the language configuration
      const languageConfig = programmingLanguages.find(
        (lang) => lang.value === language.value
      );
  
      if (!languageConfig) {
        throw new Error('Unsupported language');
      }
  
      // Prepare the payload for backend
      const runPayload = {
        source_code: code,
        language_id: languageConfig.id,
        stdin: firstTestCase.input.replace(/\\n/g, "\n"),
        problem_id: question.display_id
      };
  
      // Run the code
      const response = await fetch(`${baseURL}/testcases/runcode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(runPayload)
      });
  
      const resultData = await response.json();
  
      if (!resultData.success) {
        throw new Error(resultData.message || 'Code execution failed');
      }
  
      // Determine if the test case passed
      const isPassed = 
        resultData.status === 'Accepted' && 
        resultData.stdout?.trim() === firstTestCase.expected_output.trim();
  
      setRunResult({
        status: isPassed ? 'Accepted' : 'Failed',
        testCaseResult: {
          testCase: firstTestCase,
          result: resultData,
          passed: isPassed
        }
      });
  
      setIsRunModalOpen(true);
    } catch (error) {
      console.error("Error running code:", error);
      setRunResult({
        status: 'Error',
        error: error.message || 'Failed to run code'
      });
      setIsRunModalOpen(true);
    } finally {
      setIsRunning(false);
    }
  };

  const CODE_EDITOR_HEIGHT = 550;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%", minHeight: `${CODE_EDITOR_HEIGHT}px` }}>
      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="selectPL" style={{ marginRight: "10px", color: "#fff", fontFamily: "Poppins" }}>
          Select Language:
        </label>
        <select id="selectPL" value={language.value} onChange={handleChangePL} style={{ padding: "5px", borderRadius: "10px", fontFamily: "Poppins" }}>
          {programmingLanguages.map((pl) => (
            <option value={pl.value} key={pl.value}>
              {pl.name}
            </option>
          ))}
        </select>
      </div>
      <div className="container_editor_area" style={{ height: `${CODE_EDITOR_HEIGHT - 200}px` }}>
        <Editor placeholder="Type your code here..." value={code} onValueChange={handleCodeChange} highlight={highlightCode} padding={10} className="container__editor" />
      </div>
      <Button style={{ alignSelf: "end" }} variant="contained" color="primary" size="large" onClick={handleSubmitCode} disabled={!code}>
        Submit
      </Button>
      <CustomModal isOpen={isSubmissionError} windowTitle="Submission Error">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "500px" }}>
          <p>
            The system encountered an error while processing your submission. Please try submitting again. If the error continues, contact an usher or watcher for assistance.
          </p>
          <Button style={{ alignSelf: "end" }} variant="contained" color="primary" size="large" onClick={() => setIsSubmissionError(false)}>
            OK
          </Button>
        </div>
      </CustomModal>
      <CustomModal isOpen={isSubmissionSuccess} windowTitle="Submission Success">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "500px" }}>
          <p>Your code has been successfully submitted!</p>
          <Button style={{ alignSelf: "center" }} variant="contained" color="primary" size="large" onClick={() => setIsSubmissionSuccess(false)}>
            OK
          </Button>
        </div>
      </CustomModal>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <Button 
          variant="contained" 
          color="secondary" 
          size="large" 
          onClick={handleRunCode} 
          disabled={!code || isRunning}
        >
          {isRunning ? 'Running...' : 'Run'}
        </Button>
      </div>

      {/* Run Result Modal */}
<CustomModal 
  isOpen={isRunModalOpen} 
  windowTitle={runResult?.status === 'Accepted' ? 'Run Successful' : 'Run Result'}
  setOpen={setIsRunModalOpen}
>
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "500px" }}>
    {runResult?.status === 'Accepted' ? (
      <>
        <p>Test Case #1 check</p>
        <p>Code ran successfully!</p>
      </>
    ) : (
      <>
        <p>Code execution failed.</p>
        <p><strong>Status:</strong> {runResult?.status}</p>
      </>
    )}
    
    {runResult?.testCaseResult && (
      <div>
        <Typography variant="body2">
          <strong>Input:</strong> {runResult.testCaseResult.testCase.input}
        </Typography>
        <Typography variant="body2">
          <strong>Expected Output:</strong> {runResult.testCaseResult.testCase.expected_output}
        </Typography>
        <Typography variant="body2">
          <strong>Actual Output:</strong> {runResult.testCaseResult.result.stdout?.trim()}
        </Typography>
      </div>
    )}

    {runResult?.error && (
      <Typography variant="body2" color="error">
        <strong>Error:</strong> {runResult.error}
      </Typography>
    )}

    <Button 
      style={{ alignSelf: "center", marginTop: "10px" }} 
      variant="contained" 
      color="primary" 
      size="large" 
      onClick={() => setIsRunModalOpen(false)}
    >
      Close
    </Button>
  </div>
</CustomModal>
    </div>
  );
}

export default CodeEditor;
