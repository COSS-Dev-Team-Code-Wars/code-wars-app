import mongoose from 'mongoose';

const TestCaseSchema = new mongoose.Schema({
  problem_id: { type: String, required: true },
  display_id:  { type: Number, required: true },
  input: { type: String, required: true },
  expected_output: { type: String, required: true },
  output_type: { type: String, required: true}
});

mongoose.model("TestCase", TestCaseSchema);