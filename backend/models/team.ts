import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { PowerupInfo } from './powerup';

export interface Team extends Document {
  team_name: string;
  password: string;
  members?: string;
  score: number;
  total_points_used: number;

  active_buffs: PowerupInfo[];
  activated_powerups: PowerupInfo[];
  debuffs_received: PowerupInfo[];

  easy_set: string;
  medium_set: string;
}

const TeamSchema = new mongoose.Schema<Team>({
  team_name: { type: String, required: true },
  password: { type: String, required: true },
  members: { type: String, required: false, default: '' },
  score: { type: Number, required: true },
  total_points_used: { type: Number, required: true },

  active_buffs: { type: [Object], required: true },
  activated_powerups: { type: [Object], required: true },
  debuffs_received: { type: [Object], required: true },

  easy_set: { type: String, required: true },
  medium_set: { type: String, required: true },
});

/*
 * Purpose: Pre middleware function for hashing the password of a newly created instance
 */
TeamSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) return next();

  return bcrypt.genSalt((saltError: any, salt: any) => {
    if (saltError) { return next(saltError); }

    return bcrypt.hash(user.password, salt, (hashError: any, hash: any) => {
      if (hashError) { return next(hashError); }

      user.password = hash;
      return next();
    });
  });
});

/*
 * Purpose: Function for checking if input password corresponds to the user's hashed password
 */
TeamSchema.methods.comparePassword = function (password: any, callback: any) {
  bcrypt.compare(password, this.password, callback);
}

const TeamModel = mongoose.model<Team>("Team", TeamSchema);

export default TeamModel;