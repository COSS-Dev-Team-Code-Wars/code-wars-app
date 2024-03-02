/* eslint-disable */
import { io } from "socket.io-client";

import { get } from "lodash";
import { serverIP } from "../../../ipaddress";

// export const socketClient = io(get(process.env, "REACT_APP_SOCKET_URL", "http://localhost:8000"), {
//   transports: ['polling', 'websocket'],
//   forceNode: true,
// });
export const socketClient = io(
  get(process.env, "REACT_APP_SOCKET_URL", `http://${serverIP}:8000`),
  {
    transports: ["polling", "websocket"],
    forceNode: true,
  }
);
