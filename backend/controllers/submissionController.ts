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

    // ── Per-round scoring ────────────────────────────────────────────────────
    //
    // The team's credited score for a round is the MAXIMUM best-per-problem
    // score across all problems in that round (not the cumulative sum).
    //
    // Example:
    //   Q1 graded 80  → round max becomes 80,  delta = 80 − 0  = 80  (+80)
    //   Q2 graded 200 → round max becomes 200, delta = 200 − 80 = 120 (+120)
    //   Team total = 200  ✓  (not 280)
    //
    // For a single-problem re-submission:
    //   Q1 re-graded 300 → round max becomes 300, delta = 300 − 200 = 100 (+100)
    //   Q1 re-graded 50  → round max stays  300, delta = 0           (+0)
    // ─────────────────────────────────────────────────────────────────────────

    // 1. Get the difficulty (round) of the problem being graded.
    const questionDoc = await Question.findById(submission.problem_id);
    const problemDifficulty: string = questionDoc ? questionDoc.difficulty : "";

    // 2. Get all problems in the same round.
    const roundQuestions = await Question.find({ difficulty: problemDifficulty }).select("_id");
    const roundQuestionIds: string[] = roundQuestions.map((q: any) => q._id.toString());

    // 3. Helper: best credited score for a team+problem from all non-pending submissions.
    //    Excludes a specific submission ID when supplied (used to simulate "before" state).
    const getBestScoreForProblem = async (problemId: string, excludeId?: string): Promise<number> => {
      const subs = await Submission.find({
        team_id: submission.team_id,
        problem_id: problemId,
        status: { $ne: "Pending" },
      });
      const relevant = excludeId
        ? subs.filter((s: any) => s._id.toString() !== excludeId)
        : subs;
      if (relevant.length === 0) return 0;
      return Math.max(...relevant.map((s: any) => s.score || 0));
    };

    // 4. Old round credited score: best score per problem BEFORE this grading.
    //    The current submission is still "Pending" so it's automatically excluded
    //    from non-pending queries; no special exclusion needed for other problems.
    const oldPerProblemScores = await Promise.all(
      roundQuestionIds.map((qId) => getBestScoreForProblem(qId))
    );
    const oldCreditedScore = oldPerProblemScores.length > 0 ? Math.max(...oldPerProblemScores) : 0;

    // 5. New round credited score: same per-problem bests but with this submission
    //    now reflecting `score` for its problem.
    const newPerProblemScores = await Promise.all(
      roundQuestionIds.map(async (qId) => {
        if (qId === submission.problem_id.toString()) {
          // Take the max of the newly computed score and any prior best for this problem.
          const priorBest = await getBestScoreForProblem(qId);
          return Math.max(score, priorBest);
        }
        return getBestScoreForProblem(qId);
      })
    );
    const newCreditedScore = newPerProblemScores.length > 0 ? Math.max(...newPerProblemScores) : 0;

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
