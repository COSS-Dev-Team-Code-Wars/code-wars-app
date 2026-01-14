require('dotenv').config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import TeamModel from '../models/team';

// ito edit niyo pag magsseed kayo ng team
const TEAM_DATA = {
    team_name: 'Coss Team1',
    password: 'coss123',
    members: 'Ron, Kyro, Cody'
};


async function seedTeam(): Promise<void> {
    await connectDB();

    // Check if team already exists
    const existingTeam = await TeamModel.findOne({ team_name: TEAM_DATA.team_name });

    if (existingTeam) {
        console.log(`Team "${TEAM_DATA.team_name}" already exists`);
        await mongoose.connection.close();
        return;
    }

    // Create team
    const newTeam = new TeamModel({
        team_name: TEAM_DATA.team_name,
        password: TEAM_DATA.password,
        members: TEAM_DATA.members,
        score: 0,
        total_points_used: 0,
        active_buffs: [],
        activated_powerups: [],
        debuffs_received: [],
        easy_set: 'c',
        medium_set: 'c'
    });

    await newTeam.save();
    console.log(`Created team: "${TEAM_DATA.team_name}"`);

    await mongoose.connection.close();
}

seedTeam();
