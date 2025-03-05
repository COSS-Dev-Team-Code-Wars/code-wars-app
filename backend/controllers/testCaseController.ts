import { Request, Response } from 'express';
import mongoose from 'mongoose';
import axios from 'axios';

const TestCase = mongoose.model("TestCase");

export const runCode = async (req: Request, res: Response) => {
  try {
    const { 
      source_code, 
      language_id, 
      stdin: inputStdin, // Rename to avoid const reassignment
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

      // Fetch submission result
      const submissionToken = judge0Response.data.token;
      const resultResponse = await axios.get(`http://localhost:2358/submissions/${submissionToken}`, {
        params: {
          base64_encoded: false
        }
      });
      
      // Return the result
      return res.status(200).json({
        success: true,
        token: submissionToken,
        status: resultResponse.data.status,
        stdout: resultResponse.data.stdout,
        stderr: resultResponse.data.stderr,
        compile_output: resultResponse.data.compile_output
      });
    } catch (error: unknown) {
      // Properly type the error
      if (axios.isAxiosError(error)) {
        // Handle Axios-specific errors
        return res.status(500).json({
          success: false,
          message: 'Judge0 submission error',
          details: error.response?.data || error.message
        });
      }

      // Handle other types of errors
      return res.status(500).json({
        success: false,
        message: 'Unexpected error during code execution',
        details: error instanceof Error ? error.message : String(error)
      });
    }

  } catch (error: unknown) {
    // Handle any errors in the outer try-catch
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