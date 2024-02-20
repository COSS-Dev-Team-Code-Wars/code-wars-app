import { Request, Response } from 'express';
import mongoose from 'mongoose';

// get user model registered in Mongoose
const Submission = mongoose.model("Submission");
const Team = mongoose.model("Team");

/*
    ENDPOINTS:
    - uploadSubmission
    - downloadSubmission
    - checkSubmission
    - viewSubmissionsTP (based on Team and current Problem)
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
    const problemId = req.body.problemId;
    const teamId = req.body.teamId;
    const teamName = req.body.teamName;
    // const judgeId = req.body.judgeId;
    // const judgeName = req.body.judgeName; // Judge set when submission is checked
    const possiblePoints = req.body.possiblePoints;
    const content = req.body.content;
    const totalCases = req.body.totalCases;

    const prevSubmissions = await Submission.find({ team_id: teamId, problem_id: problemId })?.sort({ timestamp: 1 });
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

    const newSubmission = new Submission({
        team_id: teamId,
        team_name: teamName,
        judge_id: "pending",//judgeId
        judge_name: "pending",//judgeName
        problem_id: problemId,
        possible_points: possiblePoints,
        status: "pending",
        score: 0,
        evaluation: "pending",
        timestamp: new Date(),
        content: content,
        prev_max_score: prevMaxScore,
        total_test_cases: totalCases,
        curr_correct_cases: 0
    })
    // status : checked, error, pending
    // evaluation: correct, partial, wrong, error, pending

    let results;
    try {
        results = await newSubmission.save();
    } catch (error) {
        return res.send({
            success: false,
            results: error
        });
    }
    
    return res.send({
        success: true,
        results: results
    });
}

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
            results: submission.content
        });
    } else {
        return res.send({
            success: false,
            results: "Submission not found"
        });
    }
}

/*
 * Purpose: Check or grade  (changes fields status, evaluation, and score)
 * Params (in the Request): submissionId, evaluation (correct, partial, wrong, error), judgeId, judgeName, correctCases, possiblePoints
 * Returns (in the Response): 
 *      Object with fields success and the corresponding results
 */
const checkSubmission = async (req: Request, res: Response) => {
    const submissionId = req.body.submissionId;
    const evaluation = req.body.evaluation;
    const judgeId = req.body.judgeId;
    const judgeName = req.body.judgeName;
    const correctCases = parseInt(req.body.currentCases);
    const possiblePoints = parseInt(req.body.possiblePoints);

    // status : checked, error, pending
    // evaluation: correct, partial, wrong, error, pending
    let submission = await Submission.findById(submissionId);

    if (submission) {
        submission.evaluation = evaluation;
        submission.judge_id = judgeId;
        submission.judge_name = judgeName;
        submission.curr_correct_cases = correctCases;
        
        let status;
        let score = 0;

        if (evaluation == "error") {
            status = "error"
        } else {
            status = "checked"
        }

        score = Math.floor(possiblePoints * correctCases / submission.total_test_cases);
        
        let pointsToAdd = score - submission.prev_max_score;
        if (pointsToAdd > 0) {
            const team = await Team.findById(submission.team_id);

            team.score = team.score + pointsToAdd;

            try {
                team.save()

            } catch (error) {
                return res.send({
                    success: false,
                    results: "Failed updating team score"
                });
            }
        }

        submission.status = status;
        submission.score = score;

        try {
            submission.save();

            return res.send({
                success: true,
                results: submission
            });

        } catch (error) {
            return res.send({
                success: false,
                results: "Failed checking submission"
            });
        }

    } else {
        return res.send({
            success: false,
            results: "Submission not found"
        });
    }
}

/*
 * Purpose: View submissions based on team and on problem
 * Params (in the Request): problemId, teamId
 * Returns (in the Response): 
 *      Object with field results containing the appropriate submissions
 */
const viewSubmissionsTP = async (req: Request, res: Response) => {
    const problemId = req.body.problemId;
    const teamId = req.body.teamId;

    const results = await Submission.find({ team_id: teamId, problem_id: problemId }).sort({ timestamp: 1 });

    return res.send({
        results: results
    });
}

export { uploadSubmission, downloadSubmission, checkSubmission, viewSubmissionsTP };