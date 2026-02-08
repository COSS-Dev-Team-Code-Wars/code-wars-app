/* eslint-disable */
import { ConfirmWindow } from "components/";
import { socketClient } from "socket/socket";
import { postFetch } from "./apiRequest";
import { baseURL } from "./constants";

/*
 * Purpose: Handles termination of user session.
 * Params: None
 */
const handleLogout = (navigate) => {
  // fire success window
  ConfirmWindow.fire({
    text: "Are you sure you want to log out?",
  }).then(async (res) => {
    if (res["isConfirmed"]) {
      // Call backend logout endpoint to clear HTTP-only cookie
      await postFetch(`${baseURL}/logout`, {});
      
      localStorage.removeItem("user");
      navigate("/");

      socketClient.emit("logout");
    } else {
      return;
    }
  });
};

export { handleLogout };
