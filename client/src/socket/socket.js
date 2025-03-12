/* eslint-disable */ 
import { io } from "socket.io-client";

import { get } from "lodash";

export const socketClient = io("wss://staging-api-codewars.masalese.com", {
  transports: ['polling', 'websocket'],
  forceNode: true,
  secure: true
});