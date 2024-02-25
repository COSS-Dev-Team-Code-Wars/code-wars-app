import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { startRoundTimer } from '../sockets/socket';

var command = "normal";
var round = "start";
var counter = 0;
var endTimer = false;

const commandChannel = (req: Request, res: Response) => {
    console.log("Connected channel for admin commands.");
    res.set({
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
        Connection: "keep-alive", // allowing TCP connection to remain open for multiple HTTP requests/responses
        "Content-Type": "text/event-stream", // media type for Server Sent Events (SSE)
      });
      res.flushHeaders();
    
      const interval = setInterval(() => {
          res.write(`data: ${JSON.stringify({
            command,
            round
          })}\n\n`);

          if (command == "logout") {
            counter += 1;

            if (counter > 5) {
              command = "normal";
              counter = 0;
            }
          }
      }, 500);
    
      res.on("close", () => {
        clearInterval(interval);
        res.end();
      });
}

const setAdminCommand = (req: Request, res: Response) => {
    const newcommand = req.body.command;
    const newround = req.body.round;

    if (newround != round) {
      setEndTimer(true);
      console.log(newround);
      let duration: number;

      if (newround == 'EASY') {
        duration = 60 * 30;
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
        setTimeout(()=>{
          startRoundTimer(duration);
        },1000);
      }
    }

    command = newcommand;
    round = newround;
    return res.send(
      { ok: true }
    );
}

const setEndTimer = (bool: boolean) => {
  endTimer = bool;
}

export { commandChannel, setAdminCommand, round, endTimer, setEndTimer };