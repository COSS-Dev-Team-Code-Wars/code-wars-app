require('dotenv').config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import '../models/judge';

const Judge = mongoose.model('Judge');

// ito edit niyo pag magsseed kayo ng judge
const JUDGE_DATA = {
    judge_name: 'judge1',
    password: 'judgepass1'
};


async function seedJudge(): Promise<void> {
    await connectDB();

    // Check if judge already exists
    const existingJudge = await Judge.findOne({ judge_name: JUDGE_DATA.judge_name });

    if (existingJudge) {
        console.log(`Judge "${JUDGE_DATA.judge_name}" already exists`);
        await mongoose.connection.close();
        return;
    }

    // Create judge
    const newJudge = new Judge({
        judge_name: JUDGE_DATA.judge_name,
        password: JUDGE_DATA.password
    });

    await newJudge.save();
    console.log(`Created judge: "${JUDGE_DATA.judge_name}"`);

    await mongoose.connection.close();
}

seedJudge();
