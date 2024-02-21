import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
    body: { type: String, required: true },
    types: { type: String, required: true},
    points: { type: Number, required: true }
});

const Question = mongoose.model("QuestionSchema");

const viewQuestions = (req : any, res : any) => {
    Question.find({types: req}, (err : any, question : any) => { 
        if(!err) {   
            return res.send({ success: true, posts: question });
        } else {
            return res.send({ success: false });
        }
    });
  }

export { viewQuestions }