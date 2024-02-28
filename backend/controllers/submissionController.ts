import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { newUpload, evalUpdate } from '../sockets/socket';

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

    const prevSubmissions = await Submission.find({ team_id: teamId, problem_id: problemId })?.sort({ timestamp: 1 });
    let prevMaxScore;

    const totalSubmissions = await Submission.find({});

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
        judge_id: "Unassigned",//judgeId
        judge_name: "Unassigned",//judgeName
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
        display_id: totalSubmissions.length
    })
    // status : checked, error, pending
    // evaluation: correct, partially correct, incorrect solution, error, pending

    let results;
    try {
        results = await newSubmission.save();
    } catch (error) {
        return res.send({
            success: false,
            results: error
        });
    }

    newUpload(results);
    
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
            status = "error"
        } else {
            status = "checked"
        }

        score = Math.floor(possiblePoints * correctCases / submission.total_test_cases);
        console.log("--", score);
        
        let pointsToAdd = score - submission.prev_max_score;
        if (pointsToAdd > 0) {
            
            const team = await Team.findById(submission.team_id);
            team.score = team.score + pointsToAdd;

            try {
                team.save()

            } catch (error) {
                return ({
                    success: false,
                    results: "Failed updating team score"
                });
            }
        }
        console.log(score);
        submission.status = status;
        submission.score = score;

        try {
            submission.save();

            evalUpdate(submission);

            return ({
                success: true,
                status: status,
                pointsToAdd: pointsToAdd,
                results: submission
            });

        } catch (error) {
            return ({
                success: false,
                results: "Failed checking submission"
            });
        }

    } else {
        return ({
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

const getLastSubmissionByTeamOfProblem = async (req: Request, res: Response) => {
    const problemId = req.body.problemId;
    const teamId = req.body.teamId;

    const result = await Submission.find({ team_id: teamId, problem_id: problemId });

    let lastSubmission = null;
    let score = 0;
    let status;
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
    } else {
        status = "Pending";
        checkedby = "Unassigned";
    }

    return res.send({
        score,
        status,
        checkedby
    });
}

const getAllSubmissions = async (req: Request, res: Response) => {
    const results = await Submission.find().sort({ timestamp: 1 });

    return res.send({
        results: results
    });
}

export { uploadSubmission, downloadSubmission, checkSubmission, viewSubmissionsTP, getAllSubmissions, getLastSubmissionByTeamOfProblem };