import { Request, Response } from 'express';
import mongoose from 'mongoose';

// get user model registered in Mongoose
const Submission = mongoose.model("Submission");
const Team = mongoose.model("Team");

// SAMPLE FLOW UPON UPLOADING AND CHECKING SUBMISSIONS
// For a problem with a total of 500 points:
// 1st submission: prevMaxScore=0,		score=200	[+200 team points]
// 2nd submission: prevMaxScore=200,	score=100
// 3rd submission: prevMaxScore=200,	score=200
// 4th submission: prevMaxScore=200,	score=400	[+200]
// 5th submission: prevMaxScore=400,	score=0
// 6th submission: prevMaxScore=400,	score=500	[+100]
/*
 * Purpose: Check or grade  (changes fields status, evaluation, and score)
 * Params (in the Request): submissionId, evaluation (correct, partially correct, incorrect solution, error, pending), judgeId, judgeName, correctCases, possiblePoints
 * Returns (in the Response): 
 *      Object with fields success and the corresponding results
 */
// NOTE: Did not use. See submissionController.ts
const checkSubmission = async (arg: any) => {
    const submissionId = arg.submissionId;
    const evaluation = arg.evaluation;
    const judgeId = arg.judgeId;
    const judgeName = arg.judgeName;
    const correctCases = arg.correctCases;
    const possiblePoints = arg.possiblePoints;

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
        
        // When re-evaluating, calculate the difference from the current score, not prev_max_score
        let oldScore = submission.score;
        let pointsToAdd = score - oldScore;
        
        if (pointsToAdd !== 0) {
            
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

export { checkSubmission };