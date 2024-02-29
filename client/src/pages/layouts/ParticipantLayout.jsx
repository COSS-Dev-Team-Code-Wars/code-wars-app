/* eslint-disable */
import { useEffect } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { FreezeOverlay, LoadingOverlay, Sidebar } from "components";
import GeneralBackground from 'assets/GeneralBackground.png';



const ParticipantLayout = ({
  freezeOverlay,
  isLoggedIn,
  setIsLoggedIn,
  checkIfLoggedIn,
}) => {

  useEffect(() => { 
		let usertype = JSON.parse(localStorage?.getItem("user"))?.usertype;
		if (usertype == "judge") {
			navigate('/judge/submissions');
		}
		else if (usertype == "admin") {
			navigate('/admin/general');
		}
		else if (usertype == "participant") {
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

        // if user is logged in as admin
        : isLoggedIn ?
          <Stack>
            <TopBar
              isImg={true}
              icon={seal}
              title="Code Wars"
              subtitle="UPLB Computer Science Society"
              buttonText="BUY POWER-UP"
              disabledState={roundsDisablePowerUps.includes(currRound.toLowerCase()) && !isBuyImmunityChecked}
              handleButton={handleViewPowerUps}
            />
            <Outlet />
          </Stack>

          // replace with protected page sana
          : <LoadingOverlay />
      }
    </Box>
  )
};

export default ParticipantLayout;