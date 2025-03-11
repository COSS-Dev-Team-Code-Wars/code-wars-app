/* eslint-disable */ 
import { io } from "socket.io-client";

import { get } from "lodash";

export const socketClient = io(get(process.env, "REACT_APP_SOCKET_URL", "http://localhost:8000"), {
  transports: ['polling', 'websocket'],
  forceNode: true,
  secure: false
});