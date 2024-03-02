// ADD YOUR FILE EXPORTS HERE
import TeamModel, { Team } from '../models/team';
import { checkSubmission } from './submissionSocket'
import { endTimer, setEndTimer } from '../controllers/adminController';
import { PowerupInfo } from '../models/powerup';
import { activateImmunity } from './powerupSocket';
import { serverIP } from '../../ipaddress';

var roundStartTime: any;

let io = require("socket.io")(8000, {
  cors: {
    origin: [`http://${serverIP}:3000`, process.env.FRONTEND_URL || "", process.env.DEV_FRONTEND_URL || "", process.env.PROD_FRONTEND_URL || ""],
  }
  // if ever there will be cors errors from the web-sockets, create .env files to store the frontend urls that you're using to connect to this socket server. (populate the FRONTEND_URL, DEV_FRONTEND_URL, PROD_FRONTEND_URL with the urls of the frontend that you're using.)
});

io.on("connection", (socket: any) => {
  //ADD SOCKET EVENTS HERE
  socket.on("join", (user:any) => {
    socket.join("user:" + user._id);
    console.log("joined user:" + user._id);
  });

  socket.on("logout", () => {
    socket.emit("dismissToasts");
  });

  socket.on("getActivePowerups", () => {
    socket.emit("fetchActivePowerups");
  })
  // socket.on("newupload", (arg: any)=>{
  //   setTimeout( async ()=>{
  //     try {
  //       let response = await uploadSubmission(arg);
  //       console.log(response.submission)
  //       if (response.success) {
  //         console.log("||||||");
  //         socket.emit("newitemtojudge", response.submission);
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }, 20000);

  // });
  socket.on("moveRound", () => {
    socket.broadcast.emit("startRound");
  });

  socket.on("activateImmunity", (id: string) => {
    activateImmunity(id).then((res) => {
      if (res.success && res.powerup){
        socket.emit("newBuff", [res.powerup]);
      }
    });
  })

  socket.on("buyBuff", async (data: any) => {
    let powerUp = data.powerUp;
    let userTeam = data.userTeam;
    let debuffToDispel = data.debuff_to_dispel;

    const team : Team | null = await TeamModel.findById(userTeam._id);
    const tier_no = Object.keys(powerUp.tier)[0]; 

    if(team){
      // check if buff is existing to prevent stacking of buffs
      if(team.active_buffs.some((buff: any) => buff._id == powerUp._id)) {
        socket.emit("scenarioCheckerBuff", 'existing');
      } else if ((powerUp.code === 'immune' && tier_no == '4' && team.score < 0.1*team.score + powerUp.tier[tier_no].cost)){ // check if it affords immunity tier 4
        socket.emit("scenarioCheckerBuff", 'insufficient_funds');
      } else if (team.score < powerUp.tier[tier_no].cost) { // check if it affords other buffs
        socket.emit("scenarioCheckerBuff", 'insufficient_funds');
      } else {
        const startTime: Date = new Date();
        let endTime: Date = new Date(startTime.getTime() + powerUp.tier[tier_no].duration);
        
        let cost = powerUp.tier[tier_no].cost;
        
        if(powerUp.code == 'dispel'){ // For Dispel
          socket.emit("scenarioCheckerBuff", 'success');
         
          if(debuffToDispel === 'Stun'){
            cost = 1.2*100;
          } else if(debuffToDispel === 'Editor'){
            cost = 1.2*150;
          } else if(debuffToDispel === 'Frosty Hands'){
            cost = 1.2*100;
          }

          const info: PowerupInfo = {
            _id: powerUp._id,
            name: powerUp.name,
            code: powerUp.code,
            type: powerUp.type,
            tier: tier_no,
            duration: powerUp.tier[tier_no].duration,
            cost: powerUp.tier[tier_no].cost,
            startTime: startTime,
            endTime: endTime,
          }

          // Update team, remove the dispelled debuff from debuffs received
          await TeamModel.updateOne({ _id: userTeam._id }, { 
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
                "name": debuffToDispel
              }
            }
          });

          // for toast notif
          socket.emit("newBuff", [powerUp, debuffToDispel]);
          console.log("Team " + userTeam + " has bought a buff.");
        } else { // Other buffs aside from dispel
          socket.emit("scenarioCheckerBuff", 'success');
          // change end time to null for immunity since it should not start right away 
          if (powerUp.code === 'immune'){
            // cost of immunity tier 4
            if(tier_no === '4'){
              cost = 0.1*team.score + powerUp.tier[tier_no].cost;
            }
          
            const info: PowerupInfo = {
              _id: powerUp._id,
              name: powerUp.name,
              code: powerUp.code,
              type: powerUp.type,
              tier: tier_no,
              duration: powerUp.tier[tier_no].duration,
              cost: cost,
              startTime: startTime,
              endTime: new Date(startTime.getTime() + 1000000000000000)
            }
            // Add the debuff 
            await TeamModel.updateOne({ _id: userTeam._id }, { 
              $inc: { 
                score: -cost,    
                total_points_used: cost
              }, 
              $push: { 
                "activated_powerups": info, 
                "active_buffs": info,
              },
            });
            
          } else{

            socket.emit("scenarioCheckerBuff", 'success');
            
            const info: PowerupInfo = {
              _id: powerUp._id,
              name: powerUp.name,
              code: powerUp.code,
              type: powerUp.type,
              tier: tier_no,
              duration: powerUp.tier[tier_no].duration,
              cost: cost,
              startTime: startTime,
              endTime: endTime
            }
            // Add the debuff 
            await TeamModel.updateOne({ _id: userTeam._id }, { 
              $inc: { 
                score: -cost,    
                total_points_used: cost
              }, 
              $push: { 
                "activated_powerups": info, 
                "active_buffs": info,
              },
            });
  
            // Dont show toast notif right away if immunity is bought
            // Its toast must show when the medium/hard timer starts
            // for toast notif
            socket.emit("newBuff", [powerUp]);
            console.log("Team " + userTeam.username + " has bought a buff.");
          }

        }
      }
    } else {
      console.log("Team not found! Error on buy buff.");
    }


  })

  socket.on("applyDebuff", async (data: any) => {
    try{
      const powerUp = data.powerUp;
      const userTeam = data.userTeam;
      const recipientTeam = data.recipientTeam;

      // Check if recipient/target has the same debuff active
      if (
        recipientTeam.debuffs_received.some((debuff:any) => debuff._id == powerUp._id)
      ) {
        socket.emit("scenarioCheckerDebuff", 'existing');
      } else {
        const team : Team | null = await TeamModel.findById(userTeam._id);
        const tier_no = Object.keys(powerUp.tier)[0]; 
        
        if(team && team.score < powerUp.tier[tier_no].cost){
          socket.emit("scenarioCheckerDebuff", 'insufficient_funds');
        } else {
          socket.emit("scenarioCheckerDebuff", 'success');
          socket.emit("updateScoreOnBuyDebuff");
          const startTime: Date = new Date();
          const endTime: Date = new Date(startTime.getTime() + powerUp.tier[tier_no].duration);
          
          // Adjust total points used and score accordingly
          await TeamModel.updateOne({ _id: userTeam._id }, { 
            $inc: { 
              score: -powerUp.tier[tier_no].cost, 
              total_points_used: powerUp.tier[tier_no].cost 
            }, 
            $push: { "activated_powerups": {
              _id: powerUp._id,
              name: powerUp.name,
              code: powerUp.code,
              type: powerUp.type,
              tier: tier_no,
              duration: powerUp.tier[tier_no].duration,
              cost: powerUp.tier[tier_no].cost,
              target: recipientTeam.team_name,
              startTime: startTime,
              endTime: endTime
            }}
          });
  
          //  apply debuffs_received and show toast if there is no immunity active
          if(!recipientTeam.active_buffs.find((buff: any) => buff.code === 'immune')){
            socket.to("user:" + recipientTeam._id).emit("newDebuff", powerUp);
            await TeamModel.updateOne({ _id: recipientTeam._id }, {
              $push: { "debuffs_received": {
                _id: powerUp._id,
                name: powerUp.name,
                code: powerUp.code,
                type: powerUp.type,
                tier: tier_no,
                duration: powerUp.tier[tier_no].duration,
                cost: powerUp.tier[tier_no].cost,
                from: recipientTeam._id,
                startTime: startTime,
                endTime: endTime
              }}
            });
          }
  
          console.log(
            userTeam.username +
              " has bought a debuff to be used against " +
              recipientTeam.team_name
          );
        }
      }
    } catch(err){
      console.log(err);
    }
  });

  // for judge evaluation
  // if evaluation values ay correct, error or incorrect:
      // emit("submitEval") ay galing sa client/src/pages/judges/submission-entries/EvalEditInputCell.jsx 
  
  // if evaluation value ay partially correct:
      // emit("submitEval") ay galing sa client/src/pages/judges/modals/EvaluationModal.jsx
  // socket.on("submitEval", async (arg: any) => {
  //   try {
  //     let response = await checkSubmission(arg);

  //     if (response.success) {
  //       console.log(response.results)

  //       // table entries sa submission table should be reverse chronological, so unshift dapat yung method na gagamitin hindi push if magdadagdag ng new submission entry

  //       // update details sa db na need maupdate based sa nareceive na submission entry details from judge
  //       // update details din na dinidisplay sa view all problems page na table.
  //           // 'status' column depends on latest submission entry
  //           // 'score' column initially depends sa prev_max_score. once checked na yung latest submission entry, iccheck ulit if score > prev_max_score para sa 'score' column
        
  //       // need na may socket emit din siguro (?) na ipapasa yung evaluation value sa pages/judges/submission-entries/EvalViewInputCell
  //       // para maupdate yung displayed value since mahirap ipasa yung state na makukuha from EvalEditInputCell

  //       // check submission entry fields if score > prev_max_score.
  //           // if yes, then mag-emit ng "updateLeaderboard" para malaman ng client na updated yung overall team scores ng leaderboard
  //           // if no, then no need na mag-emit
        
  //       // share to other judges
  //       socket.emit("evalUpdate", response.results); 
  //     }

  //   } catch (error) {
  //     console.log(error);
  //   }
  // })
});

const startRoundTimer = (seconds: number) => {
  console.log("Started round timer");
  roundStartTime = new Date().getTime();
  var doAfterDuration: any;
  var interval: any;

  function getRemainingTime() {
    if (roundStartTime && !endTimer) {
      const elapsedTime = (new Date().getTime() - roundStartTime) / 1000;
      const remainingTime = Math.max(seconds - elapsedTime, 0);
      return { remainingTime: Math.round(remainingTime) };
    } else {
      setEndTimer(false);
      try {
        clearTimeout(doAfterDuration);
        clearInterval(interval);
      } catch (error) {
        console.log(error);
      }
      return { remainingTime: 0 };
    }
  }

  io.emit('update', getRemainingTime());
  console.log(getRemainingTime());

  interval = setInterval(() => {
    if (roundStartTime) {
      io.emit('update', getRemainingTime());
      console.log(getRemainingTime());
    }
  }, 1000);

  // Set a timeout to end the round after the specified duration
  doAfterDuration = setTimeout(() => {
    roundStartTime = null;
    io.emit('update', getRemainingTime());
    console.log(getRemainingTime());
  }, seconds * 1000);
}

const newUpload = (upload: any) => {
  console.log("Emit:NEWUPLOAD");
  io.emit('newupload', upload);
}

const evalUpdate = (update: any) => {
  console.log("Emit:NEW_EVALUPDATE");
  io.emit('evalupdate', update);
}

export { startRoundTimer, newUpload, evalUpdate };
