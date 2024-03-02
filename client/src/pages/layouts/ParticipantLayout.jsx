/* eslint-disable */
import { useState, useEffect } from 'react';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import {
	Box,
	Button,
	ClickAwayListener,
	IconButton,
	Stack
} from '@mui/material';
import SubmitModal from 'pages/participants/modals/SubmitModal';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bounce, toast } from 'react-toastify';

import GeneralBackground from 'assets/GeneralBackground.png';
import seal from 'assets/UPLB COSS.png';
import { 
	BuyPowerUpsPopover,
	CustomModal,
	FreezeOverlay,
	LoadingOverlay,
	ParticipantsLeaderboard,
	RoundTimer,
	SponsorCarousel,
	Table,
	TopBar
} from 'components';
import getLeaderboard from 'components/widgets/leaderboard/getLeaderboard';
import { socketClient } from 'socket/socket';
import { getFetch, postFetch } from 'utils/apiRequest';
import { baseURL } from 'utils/constants';
import { columnsLeaderboard, rowsLeaderboard } from 'utils/dummyData';
import 'react-toastify/dist/ReactToastify.css';



/**
 * Additional styling for overall leaderboard modal window.
 */
const additionalStyles = {
	'& .MuiDataGrid-columnHeader': {
		fontSize: 'h2',
		bgcolor: 'rgba(0, 0, 0, 0.1)',
	},
	bgcolor: 'transparent',
	border: 'none',
	padding: 2,
};


/**
 * Purpose: Layout for participants-related pages.
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
	const [openPopover, setOpenPopover] = useState(false);
	/**
   * State handler for the opening and closing of submit modal window 
   */
	const [openModal, setOpenModal] = useState(false);
		/**
	 * State handler for currrent round.
	 */
	const [currQuestions, setCurrQuestions] = useState([]);
	/**
	 * State handler for rows of overall leaderboard.
	 */
	const [leaderboardRows, setLeaderboardRows] = useState([]);
	/**
	 * State handler for overall leaderboard modal.
	 */
	const [openLeaderboard, setOpenLeaderboard] = useState(false);
	/**
	 * State handler for team details
	 * -- need na andito para sa buy power-ups
	 */
	const [teamDetails, setTeamDetails] = useState({
		teamName: '',
		score: 0
	});


	// used for client-side routing from view all problems page
	const location = useLocation();
	// for navigation
	const navigate = useNavigate();


	// used to retrieve values of datagrid row
	let params = new URLSearchParams(location.search);
  
	// array for round where buy power-ups button should be disabled
	const roundsDisablePowerUps = ['start', 'easy', 'wager'];

	const [showBuffs, setShowBuffs] = useState(false);
	const [showDebuffs, setShowDebuffs] = useState(false);
	const [seeDetails, setSeeDetails] = useState(false);
	const [selectedPowerUp, setSelectedPowerUp] = useState(null);
  
	// states to be passed to view specific problem page
	const [evaluation, setEvaluation] = useState();
	const [problem, setProblem] = useState();
	const [problemDescription, setProblemDescription] = useState();
	const [samplesInputOutput, setSampleInputOutput] = useState();


	// page values
	const problemTitle = params.get('problemTitle');
	// dummy values
	const problemSubtitle = 'UPLB Computer Science Society';


	useEffect(() => { 
		let usertype = JSON.parse(localStorage?.getItem('user'))?.usertype;
		if (usertype == 'judge') {
			navigate('/judge/submissions');
		}
		else if (usertype == 'admin') {
			navigate('/admin/general');
		}
		else if (usertype == 'team' || usertype == 'participant') {
			checkIfLoggedIn();	
		}
		else {
			setIsLoggedIn(false);
		}
    

		// fetch and set team details
		// team score is updated when:
				// a submission entry of the team is checked
				// points are used to buy power-ups
				// for wager round

		// setTeamDetails({
		// 	teamName: 'Team1',
		// 	score: 0
		// })
		getTeamScore();
		fetchLeaderboardData();
	}, []);


	useEffect(() => {
		setSeeDetails(false);
		setShowBuffs(false);
		setShowDebuffs(false);
		setSelectedPowerUp(null);
	}, [currRound]);


	/**
	 * Web sockets listener for power-ups toast notifs
	 */
	useEffect(() => {
		if (!socketClient) return;

		const user = JSON.parse(localStorage?.getItem('user'));
		socketClient.emit('join', user);
		socketClient.emit('getActivePowerups');

		socketClient.on('startRound', () => {
			socketClient.emit('activateImmunity', user._id);
		});

		socketClient.on('fetchActivePowerups', async() => {
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
						position: 'bottom-right',
						autoClose: duration,
						hideProgressBar: false,
						closeOnClick: false,
						pauseOnHover: false,
						draggable: false,
						progress: undefined,
						theme: 'dark',
						transition: Bounce,
					});
				}
			});
      
			active_debuffs.map((debuff) => {
				if(debuff.endTime){
					const duration = new Date(debuff.endTime) - new Date();

					toast.warn('New debuff ' + debuff.name + ' has been applied to your team!', {
						toastId: debuff.name,
						position: 'bottom-right',
						autoClose: duration,
						hideProgressBar: false,
						closeOnClick: false,
						pauseOnHover: false,
						draggable: false,
						progress: undefined,
						theme: 'dark',
						transition: Bounce,
					});
				}
			});

			getTeamScore();
		});

		// listener for buffs
		socketClient.on('newBuff', (arr) => {
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
				position: 'bottom-right',
				autoClose: duration,
				hideProgressBar: false,
				closeOnClick: false,
				pauseOnHover: false,
				draggable: false,
				progress: undefined,
				theme: 'dark',
				transition: Bounce,
			});

			getTeamScore();
		});

		// listener for debuffs
		socketClient.on('newDebuff', (powerUp) => {
			const tierKey = Object.keys(powerUp.tier)[0];
			const duration = powerUp.tier[tierKey].duration;
			const powerUpName = powerUp.name;

			toast.warn('New debuff ' + powerUpName + ' has been applied to your team!', {
				toastId: powerUp.name,
				position: 'bottom-right',
				autoClose: duration,
				hideProgressBar: false,
				closeOnClick: false,
				pauseOnHover: false,
				draggable: false,
				progress: undefined,
				theme: 'dark',
				transition: Bounce,
			});

			getTeamScore();
		});

		socketClient.on('updateScoreOnBuyDebuff', () => {
			getTeamScore();
		})

		socketClient.on('dismissToasts', () => {
			console.log('dismiss');
			toast.dismiss();
		});
		socketClient.on('evalupdate', (arg)=>{
			var teamId = JSON.parse(localStorage?.getItem('user'))?._id;
      
			if (teamId == arg.team_id) {
				getRoundQuestions();//

				if (location.pathname === '/participant/view-specific-problem') {
					getQuestionContent();
				}
			}
			getTeamScore();
		});


		return () => {
			socketClient.off('newBuff');
			socketClient.off('newDebuff');
			socketClient.off('dismissToasts');
			socketClient.off('fetchActivePowerups');
			socketClient.off('startRound');
			socketClient.off('evalupdate');
			socketClient.off('updateScoreOnBuyDebuff');
		};
	});
  
	/**
	 * Web sockets for real time update of leaderboard
	 */
	useEffect(() => { 
		if(!socketClient) return;

		socketClient.on('evalupdate', () => {
			fetchLeaderboardData();
		});

		socketClient.on('updateScoreOnBuyDebuff', () => {
			fetchLeaderboardData();
		});
		
		socketClient.on('newBuff', () => {
			fetchLeaderboardData();
		})

		return () => {
			socketClient.off('evalupdate');
			socketClient.off('updateScoreOnBuyDebuff');
			socketClient.off('newBuff');
		};
	});

	/**
	 * Fetching questions for the current round
	 */
	const getRoundQuestions = async () => {
		let user = JSON.parse(localStorage?.getItem('user'));

		const qResponse = await postFetch(`${baseURL}/viewquestionsdiff`, {
			difficulty: currRound.toLowerCase()
		});

		const tResponse = await postFetch(`${baseURL}/teamsets`, {
			id: user._id
		});

		let counter = 0;
		let questionsList = [];
		let set = 'c';
		if (currRound.toLowerCase() == 'easy') {
			set = tResponse.easy_set;
		}
		else if (currRound.toLowerCase() == 'medium') {
			set = tResponse.medium_set;
		}

		await Promise.all(
			qResponse.questions?.map( async (question)=>{
				let formattedQuestion = {};
				formattedQuestion.problemTitle = `(SET ${question.set.toUpperCase()}) ${question.title}`;
				formattedQuestion.id = question.display_id;
				counter += 1;
				formattedQuestion.dbId = question._id;
	
				const qeResponse = await postFetch(`${baseURL}/getlastsubmissionbyteam`, {
					problemId: question._id,
					teamId: user._id
				});
	
				formattedQuestion.status = qeResponse.evaluation;
				formattedQuestion.score = qeResponse.score;
				formattedQuestion.checkedBy = qeResponse.checkedby;
	
				console.log(set, question.set);
				if (set == 'c' || set == question.set) {
					questionsList.push(formattedQuestion);
				}
			})
		);
		//console.log(questionsList);
		const sortedList = [...questionsList].sort((a, b) => a.id - b.id);

		setCurrQuestions(sortedList);
	};

	/**
	 * Fetching problem description.
	 */
	const getQuestionContent = async () => {
		console.log(params.get('id'))
		const qResponse = await postFetch(`${baseURL}/viewquestioncontent`, {
			problemId: params.get('id'),
			teamId: JSON.parse(localStorage?.getItem('user'))._id
		});

		console.log("qResponse")
		console.log(qResponse);

		setProblem(qResponse.question);
		setProblemDescription(qResponse.question.body);
		setEvaluation(qResponse.evaluation);
		// setSampleInput(qResponse.question.sample_input);
		// setSampleOutput(qResponse.question.sample_output);
		setSampleInputOutput(qResponse.question.samples);
	};

	/**
	 * Fetch leaderboard data
	 */
	async function fetchLeaderboardData() {
		let currLeaderboard = await getLeaderboard();
		setLeaderboardRows(currLeaderboard);
	}
	
	/**
	 * Handles opening of power-up popover.
	 */
	const handleViewPowerUps = (e) => {
		e.stopPropagation();
		setOpenPopover(!openPopover);
	};
  
	/**
	 * Closes Buy Power-up Modal if user clicked outside the component.
	 */
	const handleClickAway = () => {
		setSeeDetails(false);
		setShowBuffs(false);
		setShowDebuffs(false);
		setSelectedPowerUp(null);
		setOpenPopover(false);
	};

	/**
   * Handles on click event of return button and navigates to View All Problems Page.
   */ 
	const handleReturn = () => {
		navigate('/participant/view-all-problems');
	};

	/**
   * Handles opening of the submit modal window.
   */ 
	const handleButton = () => {
		setOpenModal(true);
		//console.log(openModal)
	};

	/**
   * Handles opening of modal window for overall leaderboard.
   */
	const handleOpenLeaderboard = () => {
		setOpenLeaderboard(true);
	};

	/**
	 * Get the score of the team
	 */
	const getTeamScore = async () => {
		const user = JSON.parse(localStorage?.getItem('user'));
		try {
			const res = await postFetch(`${baseURL}/viewteamscore`, { teamId: user?._id });
			const uname = user?.username;
			if(res.success === true){
				setTeamDetails({
					teamName: uname,
					score: res.score.score,
				});
			} else {
				console.log(res.message);
			}
		} catch (err){
			console.log(err);
		}
	}
	

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
				<div className='fOverlayScreen' style={{ zIndex: '10000' }}>
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
									startIcon={<ShoppingBasketIcon />}
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
									disabledState={
										currRound.toLowerCase() == 'wager' ?
										evaluation != 'No Submission' :
										['Pending', 'Correct'].includes(evaluation)
									}
								/>
							}

							<Box
								gap={7}
								sx={{
									display: 'flex',
									flexDirection: {
										xs: 'column',
										xl: 'row'
									},
								}}
							>

								{/* Mobile View for laederboard, round timer, sponsor carousel */}
								<Box
									sx={{
										mt: 4,
										mx: 8,
										minWidth: 325,
										display: {
											xs: 'flex', xl: 'none'
										},
										flexDirection: 'row',
										gap: 7,
										alignItems: {
											xs: 'center',
										},
										justifyContent: {
											xs: 'center'
										},
									}}
								>
									{/* Round Timer and Leaderboard Button */}
									<Box
										sx={{
											gap: 5,
											display: 'flex',
											justifyContent: 'center',
											flexDirection: {
												xs: 'column',
												lg: 'column',
											},
										}}
									>
										<RoundTimer fontSize='1.4rem' minWidth='325px'/>
										<Button
											variant="contained"
											color="major"
											onClick={handleOpenLeaderboard}
											sx={{
												maxHeight: '5vh',
												minWidth: 30,
												'&:hover': {
													bgcolor: 'major.light',
													color: 'general.main',
												},
												'&:disabled': {
													bgcolor: 'major.light',
													color: 'major.contrastText'
												}
											}}
										>
											Overall Leaderboard
										</Button>
									</Box>
							
									{/* Sponsors Carousel */}
									<Box sx={{ width: '100%', display: { xs: 'none', md: 'initial' }}}>
										<SponsorCarousel />
									</Box>
								</Box>

								{/* Desktop View -- container for components on the left */}
								<Stack
									spacing={3}
									sx={{
										mt: 4,
										mx: 8,
										minWidth: 325,
										display: {
											xs: 'none', xl: 'flex'
										}
									}}
								>
									<RoundTimer fontSize='1.4rem' minWidth='325px'/>
									<ParticipantsLeaderboard rows={rowsLeaderboard} columns={columnsLeaderboard} />
									<SponsorCarousel />
								</Stack>
								
								{/* Other components */}
								<Outlet
									context={{
										teamInfo: teamDetails,
										setTeamInfo: setTeamDetails,
										problemDesc: problemDescription,
										samp: samplesInputOutput,
										fetchContent: getQuestionContent,
										currQuestions: currQuestions,
										setCurrQuestions: setCurrQuestions,
										getRoundQuestions: getRoundQuestions,
										problem: problem
									}}	
								/>
							</Box>
						</Stack>

						{/* Buy Power-ups Popover */}
						{ location.pathname === '/participant/view-all-problems' ?
							<ClickAwayListener mouseEvent="onMouseUp" onClickAway={handleClickAway}>
								{/* Wrapping button and popover in Box for clickaway ref */}
								<Box>
									<BuyPowerUpsPopover
										isOpen={openPopover}
										setOpen={setOpenPopover}
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

						{/* Overall Leaderboard Modal Window */}
						<CustomModal isOpen={openLeaderboard} setOpen={setOpenLeaderboard} windowTitle="Leaderboard">
							<Table
								rows={leaderboardRows}
								columns={columnsLeaderboard}
								hideFields={['id', 'totalSpent', 'score']}
								additionalStyles={additionalStyles}
								pageSize={5}
								pageSizeOptions={[5, 10]}
								initialState={{
									pagination: { paginationModel: { pageSize: 5 } },
								}}
								// if there are no entries yet
								slots={{
									noRowsOverlay: () => (
										<Stack height="100%" alignItems="center" justifyContent="center">
											<Typography><em>No records to display.</em></Typography>
										</Stack>
									)
								}}
							/>
						</CustomModal>

						{/* Submit Modal Window */}
						{ location.pathname === '/participant/view-specific-problem' ?
							<>
								{problem ?
									<CustomModal isOpen={openModal} setOpen={setOpenModal} windowTitle="Upload your answer">
										<SubmitModal
											setOpen={setOpenModal}
											problemId={problem._id}
											problemTitle={problem.title}
											possiblePoints={problem.points}
											totalCases={problem.total_cases}
											problemSet={problem.set}
											difficulty={problem.difficulty}
											currRound={currRound}
											setEvaluation={setEvaluation}
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
	);
};

export default ParticipantLayout;