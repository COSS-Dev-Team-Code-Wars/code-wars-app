/* eslint-disable */ 
import { useState, useEffect } from 'react';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import {
	Box,
	IconButton,
	Stack,
	Typography,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

import {
	CustomModal,
	ParticipantsLeaderboard,
	SponsorCarousel,
	RoundTimer,
	TopBar
} from 'components/';
import {
	columnsLeaderboard,
	rowsLeaderboard
} from 'utils/dummyData';
import getLeaderboard from 'components/widgets/leaderboard/getLeaderboard';

import SubmitModal from './modals/SubmitModal';
import Loading from 'components/widgets/screen-overlays/Loading';
import { Bounce, toast } from 'react-toastify';
import { socketClient } from 'socket/socket';
import 'react-toastify/dist/ReactToastify.css';
import { baseURL } from 'utils/constants';
import { postFetch } from 'utils/apiRequest';
import { getFetch } from 'utils/apiRequest';
import { clone, cloneDeep } from 'lodash';

/*
 * Purpose: Displays the Specific Problem Page for participants.
 * Params: None
 */
const ViewSpecificProblemPage = ({
	isLoggedIn,
	setIsLoggedIn,
	checkIfLoggedIn
}) => {
	// state for the opening and closing of submit modal window
	const [open, setOpen] = useState(false);

	// used for client-side routing to other pages
	const navigate = useNavigate();
	// used for client-side routing from view all problems page
	const location = useLocation();
	// used to retrieve values of datagrid row
	let params = new URLSearchParams(location.search);
	// page values
	const problemTitle = params.get('problemTitle');
	// dummy values
	const problemSubtitle = 'UPLB Computer Science Society';
	//const problemDescription = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mauris dolor, euismod nec commodo aliquam, porta vitae ante. Vivamus tincidunt egestas erat nec condimentum. Sed nec ex quis arcu lacinia laoreet. In interdum ipsum orci, ac gravida urna pharetra non. Etiam pretium, ipsum sed volutpat mollis, eros est hendrerit turpis, eget hendrerit libero dui ut eros. Donec sit amet dui sapien. Aliquam nec mi nec mauris placerat gravida. Cras egestas nisl semper semper mollis. Sed dictum augue congue porttitor ultricies. In accumsan, libero at suscipit aliquam, neque lorem eleifend velit, a vulputate lectus lorem in ante.\nMorbi non felis et lorem ultrices porttitor sit amet vitae est. Pellentesque magna urna, posuere a tincidunt a, vehicula sit amet ex. Vestibulum vehicula lectus eget consectetur imperdiet. Aenean interdum ante vel massa ultricies, a aliquet libero tempor. Mauris laoreet ipsum lacus, in iaculis nibh pharetra eget. Nunc eget purus egestas, elementum nulla eget, tincidunt nunc.';
	
	const [leaderboardRows, setLeaderboardRows] = useState([]);

	const [problem, setProblem] = useState();
	const [problemDescription, setProblemDescription] = useState();
	const [sampleInput, setSampleInput] = useState("");
	const [sampleOutput, setSampleOutput] = useState("");

	const [evaluation, setEvaluation] = useState();
	const [samples, setSampleInputOutput] = useState();
	
	/*
   * Purpose: Handles opening of the submit modal window
   * Params: None
   */ 
	const handleButton = () => {
		console.log(!["Correct", "Partially Correct", "Error", "Incorrect Solution"].includes(evaluation));
		setOpen(true);
	};

	/*
   * Purpose: Handles on click event of return button and navigates to View All Problems Page
   * Params: None
   */ 
	const handleReturn = () => {
		navigate('/participant/view-all-problems');
	};

	const getQuestionContent = async () => {
		const qResponse = await postFetch(`${baseURL}/viewquestioncontent`, {
			problemId: params.get("id"),
			teamId: JSON.parse(localStorage?.getItem("user"))._id
		});
		//console.log(qResponse.question);

		setProblem(qResponse.question);
		setProblemDescription(qResponse.question.body);
		setEvaluation(qResponse.evaluation);
		// setSampleInput(qResponse.question.sample_input);
		// setSampleOutput(qResponse.question.sample_output);
		setSampleInputOutput(qResponse.question.samples);
	}

	/**
	   * Fetch overall leaderboard data
	   */
	async function fetchLeaderboardData() {
		let currLeaderboard = await getLeaderboard()
		let copy = cloneDeep(currLeaderboard);
		setLeaderboardRows(copy);
	}

	useEffect(() => {
		let usertype = JSON.parse(localStorage?.getItem("user"))?.usertype;
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

		getQuestionContent();
		fetchLeaderboardData();
	}, []);

	// websocket listener for power-ups toast notifs
	useEffect(() => {
		if (!socketClient) return;

		const user = JSON.parse(localStorage?.getItem("user"));
		socketClient.emit("join", user);
		socketClient.emit("getActivePowerups");

		socketClient.on("powerupscorechange", ()=>{
			fetchLeaderboardData();
		});

		socketClient.on("fetchActivePowerups", async() => {
			const res = await getFetch(`${baseURL}/teams/${user._id}`);
			
			const active_buffs = res.team.active_buffs;
			const active_debuffs = res.team.debuffs_received;

			active_buffs.map((buff) => {
				if(buff.endTime){
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
					toast.info('🚀 New buff ' + debuff.name + ' applied on your team!', {
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
		});

		// listener for debuffs
		socketClient.on("newDebuff", (powerUp) => {
			const tierKey = Object.keys(powerUp.tier)[0];
			const duration = powerUp.tier[tierKey].duration;
			const powerUpName = powerUp.name;

			toast.warn('New debuff ' + powerUpName + ' has been applied to your team!', {
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

		socketClient.on('evalupdate', (arg)=>{
			var teamId = JSON.parse(localStorage?.getItem("user"))?._id;
			fetchLeaderboardData();
			
			if (teamId == arg.team_id) {
				getQuestionContent();
			}
		});

		socketClient.on("dismissToasts", () => {
			toast.dismiss();
		});

		return () => {
			socketClient.off("newBuff");
			socketClient.off("newDebuff");
			socketClient.off("dismissToasts");
			socketClient.off("fetchActivePowerups");
			socketClient.off("evalupdate");
			socketClient.off("powerupscorechange");
		};
	});

	return (
		<>
		{
			isLoggedIn ? 
		<Stack>
			{/* Topbar */}
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

			{/* Other components */}
			<Box
				// gap={7}
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
							xs: "flex", md: "none", xl: "flex"
						}
					}}
				>
					<RoundTimer />
					<ParticipantsLeaderboard rows={rowsLeaderboard} columns={columnsLeaderboard} />
					<SponsorCarousel />
				</Stack>

				{/* Right column is for the problem description and sample inputs/outputs */}
				<Stack
					spacing={5}
					sx={{
						mt: { xl: 8 },
						px: { xs: 7 },
						height: '100%',
						width: '100%',
						display: "flex"
					}}
				>
					{/* Problem Description */}
					<Box
						sx={{
							backgroundColor: '#fff',
							padding: 3,
							borderRadius: 4,
							// width: '100%'
						}}
					>
						<Typography paragraph>{problemDescription}</Typography>
						<a href={samples} target="_blank" rel="noopener noreferrer">
  							Click here for sample inputs and outputs
						</a>
					</Box>
					
					{/* Sample Inputs and Outputs */}
					{/* <Box
						sx={{
							display: 'flex',
							backgroundColor: '#fff',
							minHeight: {xs: 100, xl: 200},
							borderRadius: 4,
						}}
					> */}
						{/* <Box sx={{ width: '50%', borderRight: 2,}}>
							<Typography
								color="primary.contrastText"
								sx={{
									borderTopLeftRadius: 10,
									bgcolor: 'primary.main',
									fontFamily: 'Inter',
									fontWeight: 400,
									fontSize: '1.10rem',
									padding: 1,
								}}
							>
								Sample Inputs
							</Typography> */}

							{/* Sample inputs here */}
							{/* <div style={{padding: "10px"}}>
								{sampleInput}
							</div> */}
						{/* </Box> */}

						{/* <Box sx={{ width: '50%' }}> */}
							{/* <Typography
								color="primary.contrastText"
								sx={{
									borderTopRightRadius: 10,
									bgcolor: 'primary.main',
									fontFamily: 'Inter',
									fontWeight: 400,
									fontSize: '1.10rem',
									padding: 1,
								}}
							>
								Sample Outputs
							</Typography> */}

							{/* Sample outputs here */}
							{/* <div style={{padding: "10px"}}>
								{sampleOutput}
							</div> */}
						{/* </Box> */}
					{/* </Box> */}
				</Stack>
			</Box>
			
			{/* Submit Modal Window */}
			<>
			{
				problem ?
				<CustomModal isOpen={open} setOpen={setOpen} windowTitle="Upload your answer">
					<SubmitModal 
						setOpen={setOpen} 
						problemId={problem._id} 
						problemTitle={problem.title} 
						possiblePoints={problem.points} 
						totalCases={problem.total_cases}
					/>
				</CustomModal> : null
			}
			</>

		</Stack>
		: <Loading /> }
		</>
	);
};

export default ViewSpecificProblemPage;