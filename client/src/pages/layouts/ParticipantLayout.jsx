/* eslint-disable */
import { useState, useEffect } from "react";
import { Box, ClickAwayListener, IconButton, Stack } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bounce, toast } from 'react-toastify';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileUploadIcon from '@mui/icons-material/FileUpload';

import { 
  BuyPowerUpsPopover,
  CustomModal,
  FreezeOverlay,
  LoadingOverlay,
  ParticipantsLeaderboard,
  RoundTimer,
  SponsorCarousel,
  TopBar
} from "components";
import GeneralBackground from 'assets/GeneralBackground.png';
import { getFetch } from "utils/apiRequest";
import { baseURL } from "utils/constants";
import { columnsLeaderboard, rowsLeaderboard } from "utils/dummyData";
import { socketClient } from "socket/socket";
import seal from 'assets/UPLB COSS.png';

import SubmitModal from "pages/participants/modals/SubmitModal";


/**
 * 
 */
const ParticipantLayout = ({
  freezeOverlay,
  isLoggedIn,
	setIsLoggedIn,
	checkIfLoggedIn,
	currRound,
	isBuyImmunityChecked
}) => {

  /**
	 * State handler for viewing buy power-up popover
	 */
  const [open, setOpen] = useState(false);
  
  // used for client-side routing from view all problems page
  const location = useLocation();
  // for navigation
  const navigate = useNavigate();

	// used to retrieve values of datagrid row
  let params = new URLSearchParams(location.search);
  

  // array for round where buy power-ups button should be disabled
	const roundsDisablePowerUps = ['start', 'easy', 'wager']

	const [showBuffs, setShowBuffs] = useState(false);
	const [showDebuffs, setShowDebuffs] = useState(false);
	const [seeDetails, setSeeDetails] = useState(false);
  const [selectedPowerUp, setSelectedPowerUp] = useState(null);
  
  const [problem, setProblem] = useState();

  const [evaluation, setEvaluation] = useState();


  // page values
	const problemTitle = params.get('problemTitle');
	// dummy values
  const problemSubtitle = 'UPLB Computer Science Society';
  


  useEffect(() => { 
    let usertype = JSON.parse(localStorage?.getItem("user"))?.usertype;
    // console.log(JSON.parse(localStorage?.getItem("user")))
    // console.log(usertype)
		if (usertype == "judge") {
			navigate('/judge/submissions');
		}
		else if (usertype == "admin") {
			navigate('/admin/general');
		}
    else if (usertype == "team") {
      console.log("hereee");
      checkIfLoggedIn();	
      // console.log(checkIfLoggedIn());
		}
		else {
			setIsLoggedIn(false);
    }
    
  }, []);

  useEffect(() => {
		setSeeDetails(false);
		setShowBuffs(false);
		setShowDebuffs(false);
		setSelectedPowerUp(null);
	}, [currRound]);


	// websocket listener for power-ups toast notifs
	useEffect(() => {
		if (!socketClient) return;

		const user = JSON.parse(localStorage?.getItem("user"));
		socketClient.emit("join", user);
		socketClient.emit("getActivePowerups");

		socketClient.on("startRound", () => {
			socketClient.emit("activateImmunity", user._id);
		});

		socketClient.on("fetchActivePowerups", async() => {
			const res = await getFetch(`${baseURL}/teams/${user._id}`);
			
			const active_buffs = res.team.active_buffs;
			const active_debuffs = res.team.debuffs_received;

			active_buffs.map((buff) => {
				const startTime = new Date(buff.startTime);
				const endTime = new Date(buff.endTime);

				if(new Date(startTime.getTime() + buff.duration).getTime() == endTime.getTime()){
					const duration = new Date(buff.endTime) - new Date();
					
					toast.info('🚀 New buff ' + buff.name + ' applied on your team!', {
						toastId: buff._id,
						position: "bottom-right",
						autoClose: duration,
						hideProgressBar: false,
						closeOnClick: false,
						pauseOnHover: false,
						draggable: false,
						progress: undefined,
						theme: "dark",
						transition: Bounce,
					});
				}
			});
			
			active_debuffs.map((debuff) => {
				if(debuff.endTime){
					const duration = new Date(debuff.endTime) - new Date();

					toast.warn('New debuff ' + debuff.name + ' has been applied to your team!', {
						toastId: debuff._id,
						position: "bottom-right",
						autoClose: duration,
						hideProgressBar: false,
						closeOnClick: false,
						pauseOnHover: false,
						draggable: false,
						progress: undefined,
						theme: "dark",
						transition: Bounce,
					});
				}
			});
		});

		// listener for buffs
		socketClient.on("newBuff", (powerUp) => {
			let duration = powerUp.duration;
			const powerUpName = powerUp.name;
			
			if(duration === undefined){
				const tierKey = Object.keys(powerUp.tier)[0];
				duration = powerUp.tier[tierKey].duration;
			}

			toast.info('🚀 New buff ' + powerUpName + ' applied on your team!', {
				toastId: powerUp._id,
				position: "bottom-right",
				autoClose: duration,
				hideProgressBar: false,
				closeOnClick: false,
				pauseOnHover: false,
				draggable: false,
				progress: undefined,
				theme: "dark",
				transition: Bounce,
			});
		});

		// listener for debuffs
		socketClient.on("newDebuff", (powerUp) => {
			const tierKey = Object.keys(powerUp.tier)[0];
			const duration = powerUp.tier[tierKey].duration;
			const powerUpName = powerUp.name;

			toast.warn('New debuff ' + powerUpName + ' has been applied to your team!', {
				toastId: powerUp._id,
				position: "bottom-right",
				autoClose: duration,
				hideProgressBar: false,
				closeOnClick: false,
				pauseOnHover: false,
				draggable: false,
				progress: undefined,
				theme: "dark",
				transition: Bounce,
			});
		});

		socketClient.on("dismissToasts", () => {
			console.log("dismiss")
			toast.dismiss();
    });
    
		socketClient.on('evalupdate', (arg)=>{
			var teamId = JSON.parse(localStorage?.getItem("user"))?._id;
			
			if (teamId == arg.team_id) {
				getRoundQuestions();
			}
		});


		return () => {
			socketClient.off("newBuff");
			socketClient.off("newDebuff");
			socketClient.off("dismissToasts");
			socketClient.off("fetchActivePowerups");
			socketClient.off("startRound");
			socketClient.off("evalupdate");
		};
  });
  

	/**
	 * Purpose: Handles opening of power-up popover.
	 */
	const handleViewPowerUps = (e) => {
		e.stopPropagation();
		setOpen(!open);
  };
  
  /**
	 * Closes Buy Power-up Modal if user clicked outside the component.
	 */
	const handleClickAway = () => {
		setSeeDetails(false);
		setShowBuffs(false);
		setShowDebuffs(false);
		setSelectedPowerUp(null);
		setOpen(false);
  };

  /**
   * Handles on click event of return button and navigates to View All Problems Page
   */ 
	const handleReturn = () => {
		navigate('/participant/view-all-problems');
  };

	/**
   * Handles opening of the submit modal window
   */ 
	const handleButton = () => {
		setOpen(true);
	};
  

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

        // if user is logged in as participant
        : isLoggedIn ?
          
          <>
            <Stack>
              { location.pathname === '/participant/view-all-problems' ?
                <TopBar
                  isImg={true}
                  icon={seal}
                  title="Code Wars"
                  subtitle="UPLB Computer Science Society"
                  buttonText="BUY POWER-UP"
                  disabledState={roundsDisablePowerUps.includes(currRound.toLowerCase()) && !isBuyImmunityChecked}
                  handleButton={handleViewPowerUps}
                /> 
                :
                <TopBar
                  isImg={false}
                  icon={
                    <IconButton sx={{ color: '#fff' }} onClick={handleReturn}>
                      <ArrowBackIcon
                        sx={{
                          fontSize: '2rem',
                          cursor: 'pointer',
                          padding: 1.5,
                          borderRadius: 2,
                          '&:hover': {
                            backgroundColor: 'rgba(201, 209, 231, 0.1)',
                            color: 'major.main',
                          }
                        }}
                      />
                    </IconButton>
                  }
                  title={problemTitle}
                  subtitle={problemSubtitle}
                  buttonText="UPLOAD SUBMISSION"
                  startIcon={<FileUploadIcon />}
                  handleButton={handleButton}
                  disabledState={["Pending", "Correct"].includes(evaluation)}
                />
              }

              <Box
                gap={7}
                sx={{
                  display: "flex",
                  flexDirection: {
                    xs: "column",
                    xl: "row"
                  },
                }}
              >
                {/* Mobile view for left column */}
                {/* <Box
                  gap={10}
                  sx={{
                    mt: '3rem',
                    mx: {
                      xl: 8
                    },
                    width: '100%',
                    display: {
                      xs: "none", md: "flex", xl: "none"
                    },
                    justifyContent: "center"
                  }}
                >
                  <ParticipantsLeaderboard rows={rowsLeaderboard} columns={columnsLeaderboard} />
                  <Box
                    gap={7}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: "center",
                    }}
                  >
                    <RoundTimer />
                    <SponsorCarousel />
                  </Box>
                </Box> */}
                
                {/* Desktop view */}
                {/* Timer, Participants Leaderboard and Sponsor's Carousel */}
                <Stack
                  spacing={3}
                  sx={{
                    mt: 4,
                    mx: 8,
                    minWidth: 325,
                    display: {
                      xs: "flex", md: "none", xl: "flex"
                    }
                    // display: 'flex'
                  }}
                >
                  <RoundTimer />
                  <ParticipantsLeaderboard rows={rowsLeaderboard} columns={columnsLeaderboard} />
                  <SponsorCarousel />
                </Stack>

                {/* Other components */}
                <Outlet context={[problem, setProblem]} />
              </Box>
            </Stack>

            {/* Buy Power-ups Popover */}
            { location.pathname === '/participant/view-all-problems' ?
              <ClickAwayListener mouseEvent="onMouseUp" onClickAway={handleClickAway}>
                {/* Wrapping button and popover in Box for clickaway ref */}
                <Box>
                  <BuyPowerUpsPopover
                    isOpen={open}
                    setOpen={setOpen}
                    isBuyImmunityChecked={isBuyImmunityChecked}
                    buffsState={[showBuffs, setShowBuffs]}
                    debuffsState={[showDebuffs, setShowDebuffs]}
                    detailsState={[seeDetails, setSeeDetails]}
                    powerUpState={[selectedPowerUp, setSelectedPowerUp]}
                  />
                </Box>
              </ClickAwayListener>
              : null
            }

            {/* Submit Modal Window */}
            { location.pathname === '/participant/view-specific-problem' ?
              <>
                { problem ?
                  <CustomModal isOpen={open} setOpen={setOpen} windowTitle="Upload your answer">
                    <SubmitModal 
                      setOpen={setOpen} 
                      problemId={problem._id} 
                      problemTitle={problem.title} 
                      possiblePoints={problem.points} 
                      totalCases={problem.total_cases}
                    />
                  </CustomModal>
                  : null
                }
              </>
              : null
            }
          </>
          
          // replace with protected page sana
          : <LoadingOverlay />
      }
    </Box>
  )
};

export default ParticipantLayout;