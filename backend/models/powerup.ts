import { Schema, model, Document } from 'mongoose';

export interface Powerup extends Document {
  name: string;
  type: number;
  code: string;
  tier: {
    [tier_no: string]: {
      description: string;
      duration: number;
      cost: number;
    };
  };
}

export interface PowerupInfo {
  _id: string;
  name: string;
  code: string;
  type: number;
  tier: string;
  duration: number;
  cost: number;
  from?: string;
  target?: string;
  startTime: Date;
  endTime?: Date;
}

const PowerupSchema = new Schema<Powerup>({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: Number,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  tier: {
    type: Object,
    required: true,
  }
});

const PowerupModel = model<Powerup>('Powerup', PowerupSchema);

export default PowerupModel;
