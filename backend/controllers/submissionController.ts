import { Request, Response } from "express";
import mongoose from "mongoose";
import { evalUpdate, newUpload } from "../sockets/socket";
import { round as currentRound } from "./adminController";

// get user model registered in Mongoose
const Submission = mongoose.model("Submission");
const Team = mongoose.model("Team");
const Question = mongoose.model("Question");

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
  let evaluation = req.body.evaluation;
  const judgeId = req.body.judgeId;
  const judgeName = req.body.judgeName;
  const correctCases = req.body.correctCases;
  const possiblePoints = req.body.possiblePoints;
  console.log(req.body);

  // status : checked, error, pending
  // evaluation: correct, partially correct, incorrect solution, error, pending
  let submission = await Submission.findById(submissionId);

  if (submission) {
    // If logic determines partial, we might override the passed evaluation string
    // But we respect "error" or explicit "Correct" if logic allows. 
    // For now, we allow the logic below to refine "Partially Correct"
    submission.evaluation = evaluation;
    submission.judge_id = judgeId;
    submission.judge_name = judgeName;
    submission.curr_correct_cases = correctCases;

    console.log(correctCases, submission.total_test_cases, possiblePoints);
    let status: string;
    let score = 0;

    if (evaluation == "error") {
      status = "error";
    } else {
      status = "checked";
    }

    // Calculate percentage of correct test cases
    const percentage = (correctCases / submission.total_test_cases) * 100;

    let multiplier = 0;
    if (percentage === 100) {
      multiplier = 1;
      status = "checked"; // Fully correct
    } else if (percentage >= 41 && percentage <= 80) {
      multiplier = 0.4;
      if (evaluation !== "Correct") evaluation = "Partially Correct"; // Overwrite unless marked Correct manually
    } else if (percentage >= 20 && percentage <= 40) {
      multiplier = 0.2;
      if (evaluation !== "Correct") evaluation = "Partially Correct";
    } else {
      multiplier = 0;
      // If < 20%, it remains "Incorrect" or whatever was passed, but score is 0
    }

    score = Math.floor(possiblePoints * multiplier);

    // Update logic to ensure correct status for partial
    if (score > 0 && percentage < 100) {
      status = "checked"; // It is evaluated, even if partial
    } else if (score === 0 && evaluation !== "error") {
      status = "checked"; // Evaluated as incorrect/0 points
    }

    console.log(`-- Score Calc: ${correctCases}/${submission.total_test_cases} (${percentage}%) -> Multiplier: ${multiplier} -> Score: ${score}`);
    console.log("--", score);

    // ── Per-question scoring ──────────────────────────────────────────────────
    //
    // Scores are additive across different questions in the same round.
    // For the same question, only the delta vs the last graded score applies
    // (retrying replaces the prior score for that question, even if lower).
    //
    // Examples:
    //   Q1 graded 200           → old=0,   new=200, delta=+200 → total=200
    //   Q2 graded 60  (new Q)   → old=0,   new=60,  delta=+60  → total=260
    //   Q2 re-graded 80         → old=60,  new=80,  delta=+20  → total=280
    //   Q1 re-graded 80         → old=200, new=80,  delta=−120 → total=160
    // ─────────────────────────────────────────────────────────────────────────

    // 1. Old credited score: score of the most recently graded submission for
    //    THIS specific problem by THIS team. The current submission is still
    //    "Pending" so it is automatically excluded.
    const prevGradedSubsForProblem = await Submission.find({
      team_id: submission.team_id,
      problem_id: submission.problem_id,
      status: { $ne: "Pending" },
    }).sort({ timestamp: -1 });

    const oldCreditedScore: number = prevGradedSubsForProblem.length > 0
      ? (prevGradedSubsForProblem[0].score || 0)
      : 0;

    // 2. New credited score: strictly the score from this (now-last) submission.
    const newCreditedScore: number = score;

    let pointsToAdd = newCreditedScore - oldCreditedScore;

    if (pointsToAdd !== 0) {
      let team = await Team.findById(submission.team_id);
      team.score = team.score + pointsToAdd;

      try {
        await team.save();
      } catch (error) {
        return res.send({
          success: false,
          results: "Failed updating team score",
        });
      }
    }
    console.log(score);
    submission.status = status;
    submission.score = score;

    try {
      await submission.save();

      evalUpdate(submission);

      return res.send({
        success: true,
        status: status,
        pointsToAdd: pointsToAdd,
        results: submission,
      });
    } catch (error) {
      return res.send({
        success: false,
        results: "Failed checking submission",
      });
    }
  } else {
    return res.send({
      success: false,
      results: "Submission not found",
    });
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

    score = 0;
    for (let i = result.length - 1; i >= 0; i--) {
      if (result[i].status !== "Pending") {
        score = result[i].score || 0;
        break;
      }
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
      // Convert problem_id string to ObjectId for join
      {
        $addFields: {
          problem_obj_id: { $toObjectId: "$problem_id" }
        }
      },
      {
        $lookup: {
          from: "questions",
          localField: "problem_obj_id",
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
