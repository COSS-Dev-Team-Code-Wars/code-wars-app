/* eslint-disable */
import { useState, useEffect } from "react";

import { Box, ClickAwayListener } from "@mui/material";
import { Outlet } from "react-router-dom";
import ViewListIcon from '@mui/icons-material/ViewList';

import {
  CustomModal,
  FreezeOverlay,
  LoadingOverlay,
  Table,
  TopBar
} from "components";
import getLeaderboard from "components/widgets/leaderboard/getLeaderboard";
import { columnsLeaderboard } from "utils/dummyData";

import seal from 'assets/UPLB COSS.png';
import GeneralBackground from 'assets/GeneralBackground.png';



// Styling for Leaderboard table
const additionalStylesLeaderboard = {
	// modify column header typography
	'& .MuiDataGrid-columnHeader': {
		bgcolor: "rgba(0, 0, 0, 0.1)",
	},
	bgcolor: 'transparent',
	border: 'none',
	padding: 2,
}


const JudgeLayout = ({
  freezeOverlay,
  isLoggedIn,
  setIsLoggedIn,
  checkIfLoggedIn,
}) => {
  /**
   * For logging in
   */
  useEffect(() => { 
		let usertype = JSON.parse(localStorage?.getItem("user"))?.usertype;
		if (usertype == "participant") {
			navigate('/participant/view-all-problems');
		}
		else if (usertype == "admin") {
			navigate('/admin/general');
		}
		else if (usertype == "judge") {
			checkIfLoggedIn();
		}
		else {
			setIsLoggedIn(false);
		}

  }, []);
  
  return (
    <Box
      sx={{
        height: '100vh',
        overflow: 'hidden',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundImage: `url(${GeneralBackground})`,
      }}
      id="commonBox"
    >
      { freezeOverlay ?
        <div className='fOverlayScreen' style={{ zIndex: "10000" }}>
          <FreezeOverlay />
        </div>

        // if user is logged in as judge
        : isLoggedIn ?
            <Outlet />

          // replace with protected page sana
          : <LoadingOverlay />
      }
    </Box>
  )
};

export default JudgeLayout;