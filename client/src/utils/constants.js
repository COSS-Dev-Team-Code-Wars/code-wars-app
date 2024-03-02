/* eslint-disable */
import { get } from "lodash";
import { serverIP } from "../../../ipaddress";

//const baseURL = get(process.env, "REACT_APP_SERVER_URL", "http://localhost:5000");
const baseURL = get(
  process.env,
  "REACT_APP_SERVER_URL",
  `http://${serverIP}:5000`
);

export { baseURL };
