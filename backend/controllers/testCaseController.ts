import { Request, Response } from 'express';
import mongoose from 'mongoose';

const TestCase = mongoose.model("TestCase");

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