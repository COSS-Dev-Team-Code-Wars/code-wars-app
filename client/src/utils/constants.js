/* eslint-disable */
import { get } from "lodash";

// const baseURL = get(process.env, "REACT_APP_SERVER_URL", "http://localhost:5000");
const baseURL = process.env.REACT_APP_SERVER_URL;

export { baseURL };