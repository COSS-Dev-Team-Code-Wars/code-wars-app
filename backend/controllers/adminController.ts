import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { startRoundTimer } from '../sockets/socket';

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
      res.flushHeaders();
    
      const interval = setInterval(() => {
          res.write(`data: ${JSON.stringify({
            command,
            buyImmunity,
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

const setAnnouncement = (req: Request, res: Response) => {
    messages = req.body.messages;

    return res.send(
      { ok: true }
    );
}

const setAdminCommand = (req: Request, res: Response) => {
    const newcommand = req.body.command;
    const newround: string = req.body.round;

    if (newround.toLowerCase() != round.toLowerCase()) {
      setEndTimer(true);;
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

const setBuyImmunity = (req: Request, res: Response) => {
  buyImmunity = req.body.value;
  return res.send(
      { ok: true }
    );
}

const setEndTimer = (bool: boolean) => {
  endTimer = bool;
}

export { commandChannel, setAdminCommand, setAnnouncement, setBuyImmunity, messages, round, endTimer, buyImmunity, setEndTimer };