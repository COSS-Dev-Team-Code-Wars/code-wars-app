import { Request, Response } from 'express';
import mongoose from 'mongoose';


const Question = mongoose.model("Question");
const Submission = mongoose.model("Submission");

const viewQuestions = async (req : any, res : any) => {
    try {
        const questions = await Question.find({});
        return res.send({ success: true, questions });
    }catch(err) {
        console.error(err);
        return res.send({ success: false, error: err });
    }
  }

const getQuestionsBasedOnDifficulty = async (req : any, res : any) => {
    const difficulty = req.body.difficulty.trim();

    try {
        const questions = await Question.find({ difficulty: difficulty }).sort({ points: 1 });
        return res.send({ success: true, questions });
    }catch(err) {
        console.error(err);
        return res.send({ success: false, error: err });
    }
  } 

const getQuestionContent = async (req : any, res : any) => {
    const problemId = req.body.problemId.trim();
    const teamId = req.body.teamId;

    try {
        const question = await Question.findById(problemId);

        const submission = await Submission.find({ team_id: teamId, problem_id: problemId });

        let lastSubmission = null;
        let score = 0;
        let status;
        let evaluation;
        let checkedby;
        if (submission.length > 0) {
            lastSubmission = submission[submission.length - 1];
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

        return res.send({ success: true, question, evaluation });
    }catch(err) {
        console.error(err);
        return res.send({ success: false, error: err });
    }
  }

const generateQuestion = async (req : any, res : any) => {
    const title = req.body.title.trim();
    const body = req.body.body.trim();
    const difficulty = req.body.difficulty.trim();
    const points = parseInt(req.body.points);
    const total_cases = parseInt(req.body.total_cases);
    //const sample_input = req.body.sample_input?.trim();
    //const sample_output = req.body.sample_output?.trim();
    const samples = req.body.samples.trim();
    const set = req.body.set.trim();

    var actualSet = ["easy", "medium"].includes(difficulty) ? set : "a";

    const totalQuestions = await Question.find({});

    const newQuestion = new Question({
        title,
        body,
        difficulty,
        points,
        total_cases,
        display_id: totalQuestions.length,
        samples,
        set: actualSet
        //sample_input: sample_input?.length == 0? "-" : sample_input,
        //sample_output: sample_output?.length == 0? "-" : sample_output
    })

    let results;
    try {
        results = await newQuestion.save();

        return res.send({
            success: true,
            results: results
        });
    } catch (error) {
        return res.send({
            success: false,
            results: error
        });
    }
}

export { viewQuestions, getQuestionsBasedOnDifficulty, getQuestionContent, generateQuestion }