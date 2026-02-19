require('dotenv').config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import TeamModel from '../models/team';

const TEAMS = [
    { team_name: 'test1', password: 'pw', members: '' },
    { team_name: 'test2', password: 'pw', members: '' },
    // { team_name: 'Stdio.h', password: 'TEAMCODEWARS2026', members: '' },
    // { team_name: 'Notepad', password: 'TEAMCODEWARS2026', members: '' },
    // { team_name: '400BadRequest', password: 'TEAMCODEWARS2026', members: '' },
    // { team_name: 'Ashlee Sollorano', password: 'TEAMCODEWARS2026', members: '' },
    // { team_name: 'George', password: 'TEAMCODEWARS2026', members: '' },
    // { team_name: 'AAA', password: 'TEAMCODEWARS2026', members: '' },
    // { team_name: 'Turks', password: 'TEAMCODEWARS2026', members: '' },
    // { team_name: 'Quennu and Friends', password: 'TEAMCODEWARS2026', members: '' },
    // { team_name: 'KeNaya Niño!', password: 'TEAMCODEWARS2026', members: '' },
    // { team_name: 'x67', password: 'TEAMCODEWARS2026', members: '' },
    // { team_name: 'rem_sleep', password: 'TEAMCODEWARS2026', members: '' },
    // { team_name: 'Loren Ipsum', password: 'TEAMCODEWARS2026', members: '' },
    // { team_name: 'XYZ', password: 'TEAMCODEWARS2026', members: '' },
    // { team_name: 'cs seven', password: 'TEAMCODEWARS2026', members: '' },
    // { team_name: 'Sharkbytes', password: 'TEAMCODEWARS2026', members: '' },
    // { team_name: "print('U+0D9E')", password: 'TEAMCODEWARS2026', members: '' },
    // { team_name: 'Error 226', password: 'TEAMCODEWARS2026', members: '' },
    // { team_name: 'BKS', password: 'TEAMCODEWARS2026', members: '' },
];

async function seedTeams(): Promise<void> {
    await connectDB();

    let created = 0;
    let skipped = 0;

    for (const data of TEAMS) {
        const existing = await TeamModel.findOne({ team_name: data.team_name });

        if (existing) {
            console.log(`[SKIP] Team already exists: "${data.team_name}"`);
            skipped++;
            continue;
        }

        const newTeam = new TeamModel({
            team_name: data.team_name,
            password: data.password,
            members: '',
            score: 100,
            total_points_used: 0,
            active_buffs: [],
            activated_powerups: [],
            debuffs_received: [],
            easy_set: 'c',
            medium_set: 'c'
        });

        await newTeam.save();
        console.log(`[OK]   Created team: "${data.team_name}"`);
        created++;
    }

    console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
    await mongoose.connection.close();
}

seedTeams();
