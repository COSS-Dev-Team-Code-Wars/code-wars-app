/* eslint-disable */ 
import { useState, useEffect, useRef } from 'react';

import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import {
	Button,
	Box,
	Stack,
	Tooltip,
	Typography
} from '@mui/material';
import { useNavigate, createSearchParams } from 'react-router-dom';

import seal from 'assets/UPLB COSS.png';
import {
	BuyPowerUpsPopover,
	ParticipantsLeaderboard,
	SponsorCarousel,
	Table,
	RoundTimer,
	TopBar
} from 'components/';
import {
	columnsLeaderboard,
	columnsProblems,
	rowsLeaderboard,
	rowsProblems
} from 'utils/dummyData';
import Loading from 'components/widgets/screen-overlays/Loading';
import getLeaderboard from 'components/widgets/leaderboard/getLeaderboard';

import { baseURL } from 'utils/constants';
import { postFetch } from 'utils/apiRequest';
import { Bounce, toast } from 'react-toastify';
import { socketClient } from 'socket/socket';
import 'react-toastify/dist/ReactToastify.css';
import { cloneDeep } from 'lodash';
import { getFetch } from 'utils/apiRequest';


/*
 * Purpose: Displays the View All Problems Page for participants.
 * Params: None
 */
const ViewAllProblemsPage = ({
	isLoggedIn,
	setIsLoggedIn,
	checkIfLoggedIn,
	currRound,
	setCurrRound,
	isBuyImmunityChecked
}) => {
	
	/**
	 * State handler for viewing buy power-up popover
	 */
	const [open, setOpen] = useState(false);

	const [currQuestions, setCurrQuestions] = useState([]);
	const questionsRef = useRef();

	const [leaderboardRows, setLeaderboardRows] = useState([]);
	
	// options for round labels
	const rounds = ['EASY', 'MEDIUM', 'WAGER', 'HARD'];

	// array for round where buy power-ups button should be disabled
	const roundsDisablePowerUps = ['start', 'easy', 'wager']

	const [showBuffs, setShowBuffs] = useState(false);
	const [showDebuffs, setShowDebuffs] = useState(false);
	const [seeDetails, setSeeDetails] = useState(false);
	const [selectedPowerUp, setSelectedPowerUp] = useState(null);

	const getRoundQuestions = async () => {
		const qResponse = await postFetch(`${baseURL}/viewquestionsdiff`, {
			difficulty: currRound.toLowerCase()
		});

		let counter = 0
		let questionsList = []

		await Promise.all(
			qResponse.questions?.map( async (question)=>{
				let formattedQuestion = {};
				formattedQuestion.problemTitle = question.title;
				formattedQuestion.id = question.display_id;;
				counter += 1;
				formattedQuestion.dbId = question._id;
	
				const qeResponse = await postFetch(`${baseURL}/getlastsubmissionbyteam`, {
					problemId: question._id,
					teamId: JSON.parse(localStorage?.getItem("user"))._id
				});
	
				formattedQuestion.status = qeResponse.evaluation;
				formattedQuestion.score = qeResponse.score;
				formattedQuestion.checkedBy = qeResponse.checkedby;
	
				questionsList.push(formattedQuestion);
			})
		);
		//console.log(questionsList);
		const sortedList = [...questionsList].sort((a, b) => a.id - b.id);

		setCurrQuestions(sortedList);
	}

	/**
	   * Fetch overall leaderboard data
	   */
	const fetchLeaderboardData = async () => {
		//console.log("fetchLeaderboard");
		let currLeaderboard = await getLeaderboard();
		let copy = cloneDeep(currLeaderboard);
		//console.log(copy);
		setLeaderboardRows(copy);
	}

	useEffect(() => {
		setSeeDetails(false);
		setShowBuffs(false);
		setShowDebuffs(false);
		setSelectedPowerUp(null);

		let user = JSON.parse(localStorage?.getItem("user"));
		let usertype = user?.usertype;
		//console.log(user);
		if (usertype == "judge") {
			navigate('/judge/submissions');
		}
		else if (usertype == "admin") {
			navigate('/admin/general');
		}
		else if (usertype == "team" || usertype == "participant") {
			checkIfLoggedIn();	
		}
		else {
			setIsLoggedIn(false);
		}
		
		getRoundQuestions();
		fetchLeaderboardData();
	}, [currRound]);


	// websocket listener for power-ups toast notifs
	useEffect(() => {
		if (!socketClient) return;

		const user = JSON.parse(localStorage?.getItem("user"));
		socketClient.emit("join", user);
		socketClient.emit("getActivePowerups");

		socketClient.on("powerupscorechange", ()=>{
			fetchLeaderboardData();
		})


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
						toastId: buff.name,
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
						toastId: debuff.name,
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
		socketClient.on("newBuff", (arr) => {
			const powerUp = arr[0];
			let duration = powerUp.duration;
			const powerUpName = powerUp.name;
			
			if(duration === undefined){
				const tierKey = Object.keys(powerUp.tier)[0];
				duration = powerUp.tier[tierKey].duration;
			}

			if(arr.length > 1){
				toast.dismiss(arr[1]);
			}

			toast.info('🚀 New buff ' + powerUpName + ' applied on your team!', {
				toastId: powerUp.name,
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

			fetchLeaderboardData();
		});

		// listener for debuffs
		socketClient.on("newDebuff", (powerUp) => {
			const tierKey = Object.keys(powerUp.tier)[0];
			const duration = powerUp.tier[tierKey].duration;
			const powerUpName = powerUp.name;

			toast.warn('New debuff ' + powerUpName + ' has been applied to your team!', {
				toastId: powerUp.name,
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
			fetchLeaderboardData();
			
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
			socketClient.off("powerupscorechange");
		};
	});

	// Styling for the problem list table
	const additionalStyles = {
		backgroundColor: '#fff',
		overflow: 'auto',
	};

	// used for client-side routing to other pages
	const navigate = useNavigate();

	/**
   * Purpose: Handles opening of leaderboard modal window upon clicking the ellipsis button.
   * Params: <Object> receives information of selected problem in the Problem List Table.
   */
	const handleRowClick = (params) => {
		//console.log(params);
		let customParams = {
			checkedBy: params.row.checkedBy,
			id: params.row.dbId,
			problemTitle: params.row.problemTitle,
			score: params.row.score,
			status: params.row.status
		}

		navigate({
			pathname: '/participant/view-specific-problem',
			search: createSearchParams(customParams).toString()
		});
	};

	/**
	 * Purpose: Handles opening of power-up popover.
	 */
	const handleViewPowerUps = (e) => {
		e.stopPropagation();
		setOpen(!open);
	};

	/**
	 * Purpose: Closes Buy Power-up Modal if user clicked outside the component.
	 */
	const handleClickAway = () => {
		setSeeDetails(false);
		setShowBuffs(false);
		setShowDebuffs(false);
		setSelectedPowerUp(null);
		setOpen(false);
	};


	return (
		<>
			{
				isLoggedIn ?
				<>
					<Stack>
						{/* Topbar */}
						<TopBar
							isImg={true}
							icon={seal}
							title="Code Wars"
							subtitle="UPLB Computer Science Society"
							buttonText="BUY POWER-UP"
							disabledState={roundsDisablePowerUps.includes(currRound.toLowerCase()) && !isBuyImmunityChecked}
							handleButton={handleViewPowerUps}
						/>

						{/* Other components */}
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
							<Box
								gap={10}
								sx={{
									mt: '3rem',
									mx: {
										xl: 8
									},
									width: '100%',
									display: {
										xs: "flex", xl: "none"
									},
									justifyContent: "center"
								}}
							>
								<ParticipantsLeaderboard rows={leaderboardRows} columns={columnsLeaderboard} />
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
							</Box>
									
							{/* Desktop view for left column */}
							{/* Left column is for timer, leaderboard, sponsors' carousel */}
							<Stack
								spacing={3}
								sx={{
									mt: 4,
									mx: 8,
									minWidth: 325,
									display: {
										xs: "none", xl: "flex"
									}
								}}
							>
								<RoundTimer  />
								<ParticipantsLeaderboard rows={leaderboardRows} columns={columnsLeaderboard} />
								<SponsorCarousel />
							</Stack>

							{/* Full Desktop View for round buttons and problem table */}
							{/* Right column is for the round buttons and problem list table */}
							<Stack
								spacing={5}
								sx={{
									mt: { xl: 8 },
									mx: { xs: 5, xl: 0},
									width: {xl: '68%'},
									height: '100%',
									display: "flex"
								}}
							>
								
								{/* Container for round buttons */}
								<Box sx={{ display: 'flex', gap: 3, justifyContent: {xs: 'center', xl: 'initial'} }}>
									{rounds.map((round, idx) => 
										<Button
											key={idx}
											variant="contained"
											startIcon={currRound === round ? <LockOpenIcon/> : <LockIcon />}
											disabled={currRound === round ? false : true}
											size="large"
											sx={{
												fontFamily: 'Poppins',
												fontWeight: '600',
												minWidth: 125,
												gap: 0.5,
												bgcolor: 'major.main',
												'&:hover': {
													bgcolor: 'major.light',
													color: 'general.main',
												},
												'&:disabled': {
													bgcolor: 'major.light',
													color: '#fff'
												}
											}}
										>
											{round}
										</Button>
									)}
								</Box>

								{/* Problem List Table for the round */}
								<Table
									rows={currQuestions} //rowsProblems
									columns={columnsProblems}
									hideFields={[]}
									additionalStyles={additionalStyles}
									onRowClick={handleRowClick}
									pageSizeOptions={[5, 10]}
									autoHeight={true}
									pageSize={10}
									initialState={{
										pagination: { paginationModel: { pageSize: 10 } },
									}}
								/>
							</Stack>
						</Box>
					</Stack>
				
					{/* Buy Power-ups Popover */}
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
								fetchLeaderboardData={fetchLeaderboardData}
							/>
						</Box>
					</ClickAwayListener>
				</> : <Loading />
			}
		</>
	);
};

export default ViewAllProblemsPage;