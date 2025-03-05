import { Request, Response } from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import type { AxiosResponse } from 'axios';

const TestCase = mongoose.model("TestCase");

export const runCode = async (req: Request, res: Response) => {
  try {
    const { 
      source_code, 
      language_id, 
      stdin: inputStdin, 
      problem_id 
    } = req.body;

    // Validate input
    if (!source_code || !language_id) {
      return res.status(400).json({ 
        success: false,
        message: 'Source code and language ID are required' 
      });
    }

    // Declare a mutable variable for stdin
    let stdin = inputStdin;

    // Optional: Fetch the first test case for the problem if no stdin provided
    if (!stdin && problem_id) {
      const testCases = await TestCase.find({ problem_id }).sort({ display_id: 1 }).limit(1);
      if (testCases.length > 0) {
        stdin = testCases[0].input;
      }
    }

    try {
      // Submit to Judge0
      const judge0Response = await axios.post('http://localhost:2358/submissions', {
        source_code,
        language_id,
        stdin,
        base64_encoded: false
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Fetch submission result with a maximum number of attempts
      const submissionToken = judge0Response.data.token;
      const maxAttempts = 10;
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      // Use a separate function to get submission result
      const getSubmissionResult = async (): Promise<AxiosResponse | null> => {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            const resultResponse = await axios.get(`http://localhost:2358/submissions/${submissionToken}`, {
              params: {
                base64_encoded: false
              }
            });

            // Check if the submission processing is complete
            if (resultResponse.data.status.id !== 1) {  // Not "In Queue"
              return resultResponse;
            }

            // Wait before next attempt (exponential backoff)
            await delay(attempt * 500);  // Increases wait time between attempts
          } catch (pollError) {
            console.error(`Polling attempt ${attempt} failed:`, pollError);
            
            // If all attempts fail, return null
            if (attempt === maxAttempts) {
              return null;
            }
          }
        }
        return null;
      };

      // Get the result
      const resultResponse = await getSubmissionResult();

      // If no result was retrieved
      if (!resultResponse) {
        return res.status(500).json({
          success: false,
          message: 'Failed to retrieve submission result',
          token: submissionToken
        });
      }

      // If still in queue after max attempts
      if (resultResponse.data.status.id === 1) {
        return res.status(408).json({
          success: false,
          message: 'Code execution timed out',
          token: submissionToken
        });
      }

      // Determine overall status
      let overallStatus = 'Processing';
      if (resultResponse.data.status.id === 3) overallStatus = 'Accepted';
      else if ([4, 5, 6].includes(resultResponse.data.status.id)) overallStatus = 'Compilation Error';
      else if ([7, 8, 9, 10, 11, 12].includes(resultResponse.data.status.id)) overallStatus = 'Runtime Error';

      // Return the result
      return res.status(200).json({
        success: true,
        token: submissionToken,
        status: overallStatus,
        judge0Status: resultResponse.data.status,
        stdout: resultResponse.data.stdout || null,
        stderr: resultResponse.data.stderr || null,
        compile_output: resultResponse.data.compile_output || null,
        time: resultResponse.data.time || null,
        memory: resultResponse.data.memory || null
      });
    } catch (error: unknown) {
      // Axios error handling
      if (axios.isAxiosError(error)) {
        return res.status(500).json({
          success: false,
          message: 'Judge0 submission error',
          details: error.response?.data || error.message
        });
      }

      // Other error handling
      return res.status(500).json({
        success: false,
        message: 'Unexpected error during code execution',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  } catch (error: unknown) {
    // Outer catch block error handling
    console.error('Run code error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getTestCasesByProblem = async (req: Request, res: Response) => {
  try {
    const { problemId } = req.params;
    console.log("param: ", problemId);

    if (!problemId) {
      return res.status(400).json({ success: false, message: "Problem ID is required" });
    }

    const testCases = await TestCase.find({ problem_id: problemId });

    console.log(testCases);

    if (testCases.length === 0) {
      return res.status(404).json({ success: false, message: "No test cases found for this problem" });
    }

    res.status(200).json({ success: true, testCases });
  } catch (error) {
    console.error("Error fetching test cases:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};