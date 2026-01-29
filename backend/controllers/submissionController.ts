import { Request, Response } from "express";
import mongoose from "mongoose";
import { evalUpdate, newUpload } from "../sockets/socket";
import { round as currentRound } from "./adminController";

// get user model registered in Mongoose
const Submission = mongoose.model("Submission");
const Team = mongoose.model("Team");

/*
    ENDPOINTS:
    - uploadSubmission
    - downloadSubmission
    - checkSubmission
    - viewSubmissionsTP (based on Team and current Problem)
    - getAllSubmissions
*/

// SAMPLE FLOW UPON UPLOADING AND CHECKING SUBMISSIONS
// For a problem with a total of 500 points:
// 1st submission: prevMaxScore=0,		score=200	[+200 team points]
// 2nd submission: prevMaxScore=200,	score=100
// 3rd submission: prevMaxScore=200,	score=200
// 4th submission: prevMaxScore=200,	score=400	[+200]
// 5th submission: prevMaxScore=400,	score=0
// 6th submission: prevMaxScore=400,	score=500	[+100]

/*
 * Purpose: Upload submission
 * Params (in the Request): problemId, teamId, teamName, judgeId, judgeName, (max)possiblePoints, (file)content
 * Returns (in the Response):
 *      Object with fields success and the corresponding results
 */

const uploadSubmission = async (req: Request, res: Response) => {
  const filename = req.body.filename;
  const content = req.body.content;
  const problemId = req.body.problemId;
  const problemTitle = req.body.problemTitle;
  const possiblePoints = req.body.possiblePoints;
  const teamId = req.body.teamId;
  const teamName = req.body.teamName;
  const totalCases = req.body.totalCases;
  const difficulty = req.body.difficulty.toLowerCase();

  if (["easy", "medium"].includes(difficulty)) {
    const problemSet = req.body.problemSet;
    const currentTeamEasySet = req.body.currentTeamEasySet;
    const currentTeamMediumSet = req.body.currentTeamMediumSet;

    let team;
    if (difficulty == "easy" && currentTeamEasySet == "c") {
      team = await Team.findById(teamId);
      team.easy_set = problemSet;

      try {
        team.save();
      } catch (error) {
        console.log(error);
      }
    }
    if (difficulty == "medium" && currentTeamMediumSet == "c") {
      team = await Team.findById(teamId);
      team.medium_set = problemSet;

      try {
        team.save();
      } catch (error) {
        console.log(error);
      }
    }
  }

  const prevSubmissions = await Submission.find({
    team_id: teamId,
    problem_id: problemId,
  }).sort({ timestamp: 1 });
  let prevMaxScore;

  if (prevSubmissions.length == 0) {
    prevMaxScore = 0;
  } else {
    let lastSubmission = prevSubmissions[prevSubmissions.length - 1];
    if (lastSubmission.prev_max_score >= lastSubmission.score) {
      prevMaxScore = lastSubmission.prev_max_score;
    } else {
      prevMaxScore = lastSubmission.score;
    }
  }

  const totalSubmissions = await Submission.find({});
  let newDisplayId;

  if (totalSubmissions.length == 0) {
    newDisplayId = 0;
  } else {
    let lastSubmission = totalSubmissions[totalSubmissions.length - 1];
    newDisplayId = lastSubmission.display_id + 1;
  }

  const newSubmission = new Submission({
    team_id: teamId,
    team_name: teamName,
    judge_id: "Unassigned", //judgeId
    judge_name: "Unassigned", //judgeName
    problem_id: problemId,
    problem_title: problemTitle,
    possible_points: possiblePoints,
    status: "Pending",
    score: 0,
    evaluation: "Pending",
    timestamp: new Date(),
    content: content,
    prev_max_score: prevMaxScore,
    total_test_cases: totalCases,
    curr_correct_cases: 0,
    filename,
    display_id: newDisplayId,
  });
  // status : checked, error, pending
  // evaluation: correct, partially correct, incorrect solution, error, pending

  let results;
  try {
    results = await newSubmission.save();
  } catch (error) {
    return res.send({
      success: false,
      results: error,
    });
  }

  newUpload(results);

  return res.send({
    success: true,
    results: results,
  });
};

/*
 * Purpose: Download submission
 * Params (in the Request): submissionId
 * Returns (in the Response):
 *      Object with fields success and the corresponding results
 */
const downloadSubmission = async (req: Request, res: Response) => {
  const submissionId = req.body.submissionId;

  const submission = await Submission.findById(submissionId).select("content");

  if (submission) {
    return res.send({
      success: true,
      results: submission.content,
    });
  } else {
    return res.send({
      success: false,
      results: "Submission not found",
    });
  }
};

/*
 * Purpose: Check or grade  (changes fields status, evaluation, and score)
 * Params (in the Request): submissionId, evaluation (correct, partially correct, incorrect solution, error, pending), judgeId, judgeName, correctCases, possiblePoints
 * Returns (in the Response):
 *      Object with fields success and the corresponding results
 */
const checkSubmission = async (req: Request, res: Response) => {
  const submissionId = req.body.submissionId;
  const evaluation = req.body.evaluation;
  const judgeId = req.body.judgeId;
  const judgeName = req.body.judgeName;
  const correctCases = req.body.correctCases;
  const possiblePoints = req.body.possiblePoints;
  console.log(req.body);

  // status : checked, error, pending
  // evaluation: correct, partially correct, incorrect solution, error, pending
  let submission = await Submission.findById(submissionId);

  if (submission) {
    submission.evaluation = evaluation;
    submission.judge_id = judgeId;
    submission.judge_name = judgeName;
    submission.curr_correct_cases = correctCases;

    console.log(correctCases, submission.total_test_cases, possiblePoints);
    let status;
    let score = 0;

    if (evaluation == "error") {
      status = "error";
    } else {
      status = "checked";
    }

    score = Math.floor(
      (possiblePoints * correctCases) / submission.total_test_cases
    );
    console.log("--", score);

    let pointsToAdd = score - submission.prev_max_score;
    if (pointsToAdd > 0) {
      let team = await Team.findById(submission.team_id);
      team.score = team.score + pointsToAdd;

      try {
        team.save();
      } catch (error) {
        return {
          success: false,
          results: "Failed updating team score",
        };
      }
    }
    console.log(score);
    submission.status = status;
    submission.score = score;

    try {
      submission.save();

      evalUpdate(submission);

      return {
        success: true,
        status: status,
        pointsToAdd: pointsToAdd,
        results: submission,
      };
    } catch (error) {
      return {
        success: false,
        results: "Failed checking submission",
      };
    }
  } else {
    return {
      success: false,
      results: "Submission not found",
    };
  }
};

/*
 * Purpose: View submissions based on team and on problem
 * Params (in the Request): problemId, teamId
 * Returns (in the Response):
 *      Object with field results containing the appropriate submissions
 */
const viewSubmissionsTP = async (req: Request, res: Response) => {
  const problemId = req.body.problemId;
  const teamId = req.body.teamId;

  const results = await Submission.find({
    team_id: teamId,
    problem_id: problemId,
  }).sort({ timestamp: 1 });

  return res.send({
    results: results,
  });
};

const getLastSubmissionByTeamOfProblem = async (
  req: Request,
  res: Response
) => {
  const problemId = req.body.problemId;
  const teamId = req.body.teamId;

  const result = await Submission.find({
    team_id: teamId,
    problem_id: problemId,
  });

  let lastSubmission = null;
  let score = 0;
  let status;
  let evaluation;
  let checkedby;
  if (result.length > 0) {
    lastSubmission = result[result.length - 1];
    //console.log(lastSubmission);
    if (lastSubmission.prev_max_score >= lastSubmission.score) {
      score = lastSubmission.prev_max_score;
    } else {
      score = lastSubmission.score;
    }

    status = lastSubmission.status;
    checkedby = lastSubmission.judge_name;
    evaluation = lastSubmission.evaluation;
  } else {
    status = "Pending";
    checkedby = "Unassigned";
    evaluation = "No Submission";
  }

  return res.send({
    score,
    status,
    checkedby,
    evaluation,
  });
};

const getAllSubmissions = async (req: Request, res: Response) => {
  try {
    // Map admin round to question difficulty (assumes question.difficulty stored lowercase)
    const desiredDifficulty = (currentRound || "").toLowerCase();

    // If round is not a difficulty (e.g., 'start'), return empty list
    if (!["easy", "medium", "hard", "wager"].includes(desiredDifficulty)) {
      return res.send({ results: [] });
    }

    // Aggregate submissions joined with questions and filter by difficulty
    const results = await Submission.aggregate([
      {
        $lookup: {
          from: "questions",
          localField: "problem_id",
          foreignField: "_id",
          as: "question",
        },
      },
      { $unwind: "$question" },
      { $match: { "question.difficulty": desiredDifficulty } },
      { $sort: { timestamp: -1 } },
    ]);

    return res.send({ results });
  } catch (error) {
    return res.send({ results: [], error });
  }
};

/*
 * Purpose: Retrieve submissions of a specific team and arrange them by recency
 * Params (in the Request): teamId
 * Returns (in the Response):
 *      Object with fields success and the corresponding results
 */
const getTeamSubmissions = async (req: Request, res: Response) => {
  const teamId = req.query.teamId;

  try {
    const submissions = await Submission.find({ team_id: teamId })
      .sort({ timestamp: -1 })
      .select("display_id team_name problem_title timestamp filename");
    return res.send({
      success: true,
      results: submissions,
    });
  } catch (error) {
    return res.send({
      success: false,
      message: "Failed to retrieve submissions",
    });
  }
};

export {
  uploadSubmission,
  downloadSubmission,
  checkSubmission,
  viewSubmissionsTP,
  getAllSubmissions,
  getLastSubmissionByTeamOfProblem,
  getTeamSubmissions,
};
