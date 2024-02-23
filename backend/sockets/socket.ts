// ADD YOUR FILE EXPORTS HERE
import { uploadSubmission } from './submissionSocket'

let io = require("socket.io")(8000, {
  cors: {
    origin: ["http://localhost:3000", process.env.FRONTEND_URL || "", process.env.DEV_FRONTEND_URL || "", process.env.PROD_FRONTEND_URL || ""],
  }
  // if ever there will be cors errors from the web-sockets, create .env files to store the frontend urls that you're using to connect to this socket server. (populate the FRONTEND_URL, DEV_FRONTEND_URL, PROD_FRONTEND_URL with the urls of the frontend that you're using.)
});

io.on("connection", (socket: any) => {
  //ADD SOCKET EVENTS HERE
  socket.emit("hello", "world");

  socket.on("newupload",  (arg: any)=>{
    let response = "huhu"//await uploadSubmission(arg);

    
    socket.emit("newitemtojudge", response);
    
  });
});