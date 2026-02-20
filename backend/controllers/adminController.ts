import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { startRoundTimer, pauseRoundTimer, resumeRoundTimer, stopRoundTimer } from '../sockets/socket';
import { clearAllPowerups } from './powerupController';

const Team = mongoose.model("Team");

var command = "normal";
var buyImmunity = "disabled";
var round = "start";
var counter = 0;
var endTimer = false;
type Message = { message: string; timestamp: string };
let messages: Message[] = [];

const commandChannel = (req: Request, res: Response) => {
  console.log("Connected channel for admin commands.");
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-cache",
    Connection: "keep-alive", // allowing TCP connection to remain open for multiple HTTP requests/responses
    "Content-Type": "text/event-stream", // media type for Server Sent Events (SSE)
  });
  // res.flushHeaders();

  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({
      command,
      buyImmunity,
      messages,
      round
    })}\n\n`);

    if (command == "logout") {
      counter += 1;

      if (counter > 5) {
        command = "normal";
        counter = 0;
      }
    }
  }, 1000);

  res.on("close", () => {
    clearInterval(interval);
    res.end();
  });
}

const setAdminCommand = async (req: Request, res: Response) => {
  const newcommand = req.body.command;
  const newround: string = req.body.round;

  if (newround.toLowerCase() != round.toLowerCase()) {
    setEndTimer(true);
    stopRoundTimer();
    // Clean up all powerups from the previous round
    await clearAllPowerups();
    let duration: number;

    if (newround == 'EASY') {
      duration = 500;
      // duration = 1000;
    }
    else if (newround == 'MEDIUM') {
      duration = 60 * 45;
    }
    else if (newround == 'WAGER') {
      duration = 60 * 15;
    }
    else if (newround == 'HARD') {
      duration = 60 * 30;
    } else {
      duration = 0;
    }

    if (duration > 0) {
      setTimeout(() => {
        startRoundTimer(duration, async () => {
          round = "START";
          // Clean up all powerups when the round timer naturally expires
          await clearAllPowerups();
          console.log("Round timer ended, resetting round to START");
        });
      }, 1000);
    }
  }

  command = newcommand;
  round = newround;
  // handle freeze command: pause/resume the round timer when admin toggles freeze
  if (newcommand === 'freeze') {
    try { pauseRoundTimer(); } catch (err) { console.log(err); }
  } else if (newcommand === 'normal') {
    try { resumeRoundTimer(); } catch (err) { console.log(err); }
  }
  return res.send(
    { ok: true }
  );
}

const setBuyImmunity = (req: Request, res: Response) => {
  buyImmunity = req.body.value;
  return res.send(
    { ok: true }
  );
}

const setAnnouncement = (req: Request, res: Response) => {
  messages = req.body.messages;

  console.log("Real ba", messages);
  return res.send(
    { ok: true }
  );
}

const setEndTimer = (bool: boolean) => {
  endTimer = bool;
}



export { commandChannel, setAdminCommand, setAnnouncement, setBuyImmunity, messages, round, endTimer, buyImmunity, setEndTimer };