import { Request, Response } from 'express';
import PowerupModel, { Powerup, PowerupInfo } from '../models/powerup';
import TeamModel, { Team } from '../models/team';

/*
 * Purpose: Fetches all powerups
 * Params: None
 * Returns: An Array<Powerup> of all powerups and its information
 */
export const get_all_powerups = async (req: Request, res: Response) => {
  try {
    const powerups: Powerup[] = await PowerupModel.find();
    return res.send({
      success: true,
      message: powerups,
    });
  } catch (error) {
    // Handle errors here
    console.error('Error fetching powerups:', error);
    return res.send({
      success: false,
      message: error,
    });
  }
};

/*
 * Purpose: Fetches powerups by type
 * Params: type - buff or debuff [0 - debuff, 1 - buff]
 * Returns: An Array<Powerup> of all powerups and its information
 */
export const get_powerups_by_type = async (req: Request, res: Response) => {
  try {
    const powerups: Powerup[] = await PowerupModel.find({ type: req.params.type });
    return res.send({
      success: true,
      message: powerups
    });
  } catch (error) {
    // Handle errors here
    console.error('Error fetching powerups:', error);
    return res.send({
      success: false,
      message: error,
    });
  }
};

/*
 * Purpose: Fetches powerups by id
 * Params: Powerup id
 * Returns: A Powerup object
 */
export const get_powerup_by_id = async (req: Request, res: Response) => {
  try {
    const powerup: Powerup | null = await PowerupModel.findById(req.params.id);

    if (powerup) {
      return res.send({
        success: true,
        message: powerup,
      });
    } else {
      return res.send({
        success: false,
        message: 'Powerup not found',
      });
    }
  } catch (error) {
    // Handle errors here
    console.error('Error fetching powerup:', error);
    return res.send({
      success: false,
      message: error,
    });
  }
};

/*
 * Purpose: Fetches powerups afforded by the team/user
 * Params: None
 * Request Body: {
 *                  team_id: String (required)
 *               }
 * Returns: An Array<Powerup> of all powerups afforded by the team/user
 */
export const get_available_powerups = async (req: Request, res: Response) => {
  try {
    const team: Team | null = await TeamModel.findById(req.body.team_id);

    if (team) {
      const powerups: Powerup[] = await PowerupModel.find();

      // Get a list of powerups that can be afforded by the team
      let availablePowerups: Powerup[] = powerups.filter((powerup: Powerup) => {
        // Check all tiers
        for (const tierNo in powerup.tier) {
          if (powerup.tier.hasOwnProperty(tierNo)) {
            // If the team cannot afford the tier of the powerup, remove from the available tiers
            if (team.score < powerup.tier[tierNo].cost) {
              delete powerup.tier[tierNo];
            };
          }
        }
        // If powerup.tier has at least an element, the team affords the powerup and return true.
        if (Object.keys(powerup.tier).length > 0) {
          return true;
        } else {
          return false;
        }
      });

      // Check availability of Dispel and Immunity 4 (due to % costs)
      for (const powerup of availablePowerups) {
        if (powerup.code === 'dispel') {
          const index = availablePowerups.indexOf(powerup);
          // Check if there are debuffs that can be dispelled
          if (team.debuffs_received.length === 0) {
            availablePowerups.splice(index, 1);
          } else {
            let isScoreEnough = false;

            // Check if the points of the team is sufficient to buy Dispel (120% of the debuff's cost)
            for (const debuffId of team.debuffs_received) {
              const debuff = await PowerupModel.findById(debuffId);
              // NOTE: Currently, all debuffs available only have 1 tier. Update this when debuffs have multiple tiers
              if (debuff && (1.2 * debuff.tier["1"].cost < team.score)) {
                isScoreEnough = true;
                break;
              }
            }

            // If the team cannot afford to dispel atleast one of the debuffs applied, remove from available powerups list
            if (!isScoreEnough) {
              availablePowerups.splice(index, 1);
            }
          }
        } else if (powerup.code === 'immune' && powerup.tier["4"] !== undefined) { // If immunity 4 is in available powerups
          // Check if the points of the team is sufficient to buy Immunity IV (1000 + 10% team's score)
          if (powerup.tier["4"].cost + 0.1 * team.score > team.score) {
            delete powerup.tier["4"];
          }
        }
      }
      return res.send({
        success: true,
        message: availablePowerups,
      });
    } else {
      return res.send({
        success: false,
        message: 'Team not found',
      });
    }
  } catch (error) {
    // Handle errors here
    console.error('Error fetching powerup:', error);
    return res.send({
      success: false,
      message: error,
    });
  }
};

/*
 * Purpose: Buys and activates a powerup
 *          Note: timed powerup is not yet implemented
 * Params: None
 * Request body fields: {
 *                          team_id: String   (required)
 *                          powerup: Powerup  (required)
 *                          tier_no: String (required)
 *                          target_id: String (if debuff)
 *                          debuff_to_dispel_id: String (if buff is dispel)
 *                      }
 * Returns: An object that contains a message (string) and the success (boolean)
 */
export const buy_powerup = async (req: Request, res: Response) => {
  try {
    const {
      team_id,
      powerup,
      tier_no,
      target_id,
      debuff_to_dispel_id
    } = req.body;

    const team: Team | null = await TeamModel.findById(team_id);

    if (team) {
      console.log(powerup.code);
      if (powerup.type == 0) { // DEBUFF    
        // TO DO: Create constants for the arrays (buffs & debuffs) used in includes()
        // Check if it is really a debuff
        if (['stun', 'editor', 'frosty'].includes(powerup.code)) {
          const target: Team | null = await TeamModel.findById(target_id);

          if (target) {
            // Checker if target does not have the powerup in their debuffs afflicted
            if (target.debuffs_received.some(debuff => debuff._id == powerup._id)) {
              return res.send({
                success: false,
                message: `Your target team is still debuffed with ${powerup.name}. Debuffs cannot be stacked.`
              });
            }
            // Checker if target team has immunity
            let isTargetImmune: Boolean = false;
            for (const targetBuff of target.active_buffs) {
              // const targetBuff = await PowerupModel.findById(targetBuffId).select('code');
              if (targetBuff.code === 'immune') {
                isTargetImmune = true;
                break;
              }
            }

            const startTime: Date = new Date();
            const endTime: Date = new Date(startTime.getTime() + powerup.tier[tier_no].duration);

            // Adjust total points used and score accordingly
            await TeamModel.updateOne({ _id: team_id }, {
              $inc: {
                score: -powerup.tier[tier_no].cost,
                total_points_used: powerup.tier[tier_no].cost
              },
              $push: {
                "activated_powerups": {
                  _id: powerup._id,
                  name: powerup.name,
                  code: powerup.code,
                  type: powerup.type,
                  tier: tier_no,
                  duration: powerup.tier[tier_no].duration,
                  cost: powerup.tier[tier_no].cost,
                  target: target_id,
                  startTime: startTime,
                  endTime: endTime
                }
              }
            });

            if (!isTargetImmune) { // Only add to target's debuffs_received if target is not immune
              await TeamModel.updateOne({ _id: target_id }, {
                $push: {
                  "debuffs_received": {
                    _id: powerup._id,
                    name: powerup.name,
                    code: powerup.code,
                    type: powerup.type,
                    tier: tier_no,
                    duration: powerup.tier[tier_no].duration,
                    cost: powerup.tier[tier_no].cost,
                    from: team_id,
                    startTime: startTime,
                    endTime: endTime
                  }
                }
              });

              return res.send({
                success: true,
                message: 'Debuff successfully applied to the other team'
              });
            } else { // Do not apply debuff if target is immune
              return res.send({
                success: true,
                message: 'The other team has an active immunity'
              });
            }
          } else {
            return res.send({
              success: false,
              message: 'Target team not found',
            });
          }
        } else {
          return res.send({
            success: false,
            message: 'Unknown powerup',
          });
        }
      } else if (powerup.type == 1) { // BUFF
        if (powerup.code == 'dispel') { // DISPEL
          // Retrieve the cost of the debuff to be dispelled
          const debuffToDispel = await PowerupModel.findById(debuff_to_dispel_id);

          if (debuffToDispel && team.debuffs_received.some(debuff => debuff._id == debuff_to_dispel_id)) {
            // Adjust total points used and score accordingly
            await TeamModel.updateOne({ _id: team_id }, {
              $inc: {
                score: -1.2 * debuffToDispel.tier["1"].cost,    // currently, all debuffs have 1 tier only, adjust this if debuff tiers are increased
                total_points_used: 1.2 * debuffToDispel.tier["1"].cost
              },
              $push: {
                "activated_powerups": {
                  _id: powerup._id,
                  name: powerup.name,
                  code: powerup.code,
                  type: powerup.type,
                  tier: tier_no,
                  duration: powerup.tier[tier_no].duration,
                  cost: powerup.tier[tier_no].cost,
                  target: target_id,
                  startTime: new Date()
                }
              },
              $pull: {
                "debuffs_received": {
                  _id: debuff_to_dispel_id
                }
              }
            });

            return res.send({
              success: true,
              message: 'Dispel successfully activated'
            });
          } else {
            return res.send({
              success: false,
              message: 'Debuff to dispel not found',
            });
          }
        } else if (['immune', 'unchain'].includes(powerup.code)) { // Check if it is really a buff aside from dispel
          if (powerup.code == 'immune' && tier_no == '4') {
            var cost: number = powerup.tier[tier_no].cost + (0.1 * team.score);
          } else {
            var cost: number = powerup.tier[tier_no].cost;
          }

          const startTime: Date = new Date();
          const endTime: Date = new Date(startTime.getTime() + powerup.tier[tier_no].duration);

          const info: PowerupInfo = {
            _id: powerup._id,
            name: powerup.name,
            code: powerup.code,
            type: powerup.type,
            tier: tier_no,
            duration: powerup.tier[tier_no].duration,
            cost: powerup.tier[tier_no].cost,
            startTime: startTime,
            endTime: endTime,
          }

          await TeamModel.updateOne({ _id: team_id }, {
            $inc: {
              score: -cost,
              total_points_used: cost
            },
            $push: {
              "activated_powerups": info,
              "active_buffs": info
            },
            $pull: {
              "debuffs_received": {
                _id: debuff_to_dispel_id
              }
            }
          });

          return res.send({
            success: true,
            message: `${powerup.name} successfully activated`
          });
        } else {
          return res.send({
            success: false,
            message: 'Unknown powerup',
          });
        }
      } else {
        return res.send({
          success: false,
          message: 'Invalid powerup type',
        });
      }
    } else {
      return res.send({
        success: false,
        message: 'Team not found',
      });
    }
  } catch (error) {
    // Handle errors here
    console.error('Error fetching powerup:', error);
    return res.send({
      success: false,
      message: error,
    });
  }
};

/*
 * Purpose: Removes expired powerups from a team's actuve_buffs and debuffs_received
 * Params: None
 * Returns: None
 */
const remove_active_powerup = async (team_id: String) => {
  try {
    let team = await TeamModel.findById(team_id);
    if (team) {
      const currentTime = new Date();
      // NOTE: ENSURE THAT active_buffs AND debuffs_received OF ALL TEAMS ARE CLEARED WHEN STARTING A ROUND

      //Filter out expired buffs
      team.active_buffs = team.active_buffs.filter((buff) => {
        if (buff.endTime) {
          return buff.endTime > currentTime;
        }
      });

      //Filter out expired debuffs
      team.debuffs_received = team.debuffs_received.filter((debuff) => {
        if (debuff.endTime) {
          return debuff.endTime > currentTime;
        }
      });

      await team.save();
    } else {
      console.log("Team not found.");
    }
  } catch (error) {
    // Handle errors here
    console.error('Error removing expired powerups:', error);
  }
}

// Run every 1 second
setInterval(async () => {
  try {
    const teams = await TeamModel.find({});
    for (const team of teams) {
      await remove_active_powerup(team._id.toString());
    }
  } catch (error) {
    console.error('Error checking for expired elements:', error);
  }
}, 1000);