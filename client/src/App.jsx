
/* eslint-disable */ 
import { useState, useEffect, useRef } from 'react';

import { ThemeProvider } from '@emotion/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Cookies from 'universal-cookie';

import { ToastContainerConfig } from 'components';
import {
	AdminLayout,
	JudgeLayout,
	LoginPage,
	GeneralOptionsPage,
	ParticipantLayout,
	PowerUpLogs,
	TopTeamsPage,
	ViewAllProblemsPage,
	ViewSpecificProblemPage,
	ViewSubmissionsPage,
} from 'pages/';
import { theme } from 'theme.js';
import { postFetch } from 'utils/apiRequest';
import { baseURL } from 'utils/constants';
import TimerPage from 'pages/admin/TimerPage';
import ViewSubmissionLogPage from 'pages/participants/ViewSubmissionLogPage';



var immortalHTML = '<div class="MuiBox-root css-1ato3wx"><div class="MuiBox-root css-1xpmd5v"><svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium fOverlay css-i4bv87-MuiSvgIcon-root" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="HourglassFullTwoToneIcon" style="font-size: 10rem; align-self: center;"><path d="m8 7.5 4 4 4-4V4H8zm0 9V20h8v-3.5l-4-4z" opacity=".3"></path><path d="M18 2H6v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18zm-2 14.5V20H8v-3.5l4-4zm0-9-4 4-4-4V4h8z"></path></svg><br><h4 class="MuiTypography-root MuiTypography-h4 fOverlay css-1cvibvw-MuiTypography-root">Your screen has been frozen. <br>Please Wait.</h4></div></div>';



function App() {
	const [freezeOverlay, setFreezeOverlay] = useState(false);

	const [isLoggedIn, setIsLoggedIn] = useState(false);
	/**
	 * State handler for current round.
	 */
	const [currRound, setCurrRound] = useState('START');
	/**
	 * State handler for toggle switch state of freeze screens.
	 */
	const [freezeChecked, setFreezeChecked] = useState(false);
	/**
	 * State handler for toggle switch state of buying immunity.
	 */
	const [buyImmunityChecked, setBuyImmunityChecked] = useState(false);
	/**
	 * State handler for announcements.
	 */
	const [announcementList, setAnnouncementList] = useState([]);

	const roundRef = useRef('START');
	const freezeRef = useRef(false); 
	const immunityRef = useRef(false); 
	const overlayFreezeLoad = useRef(false);
	const announcementRef = useRef([]);


	const checkIfLoggedIn = async () => {
		let response = await postFetch(`${baseURL}/checkifloggedin`, { authToken: localStorage.getItem('authToken') });
		
		setIsLoggedIn(response.isLoggedIn);
	};


	useEffect(() => {
		const eventSource = new EventSource(`${baseURL}/admincommand`);
		eventSource.onmessage = (e) => {
			// getting admin message
			let adminMessage = JSON.parse(e.data);

			// for participants
			if (JSON.parse(localStorage?.getItem('user'))?.usertype == 'team' ||
			JSON.parse(localStorage?.getItem('user'))?.usertype == 'participant' ) {
				
				if (adminMessage.command == 'freeze') {
					setFreezeOverlay(true);

					// if hindi pa naka-display yung freeze overlay, set to true
					if (document.querySelectorAll('.fOverlayScreen')[0] != null && overlayFreezeLoad.current == false) {
						overlayFreezeLoad.current = true;
					}

					// // checks if present yung elements na may fOverlay
					// let checker = document.getElementsByClassName('fOverlay').length;

					// setTimeout(() => {
					// 	// if hindi pa naka-display yung component pero naka-true na yung overlay, i-display na
					// 	if (checker < 2 && overlayFreezeLoad.current == true) {

					// 		try {
					// 			document.getElementsByClassName('fOverlayScreen')[0].remove();
					// 		} catch (error) {
								
					// 		}
							
					// 		const immortalDiv = document.createElement('div');
					// 		immortalDiv.className = 'fOverlayScreen';
					// 		immortalDiv.style.zIndex = '10000';
					// 		immortalDiv.innerHTML = immortalHTML;

					// 		let commonBox = document.getElementById('commonBox');
					// 		commonBox.insertBefore(immortalDiv, commonBox.firstChild);
					// 	}
					// }, 1000);
				} 
				else if (adminMessage.command == 'logout') {
					console.log('Should log out');

					setFreezeOverlay(false);
					localStorage.removeItem('user');
					//setUserDetails(null);
					window.location.replace(window.location.origin);

					// Delete cookie with authToken
					const cookies = new Cookies();
					cookies.remove('authToken');
				} 
				else if (adminMessage.command == 'normal') {
					setFreezeOverlay(false);	
				} 
			}
			if (adminMessage.command == 'freeze') {
				setFreezeChecked(true);
				freezeRef.current = true;
			} else if (adminMessage.command == 'normal') {
				setFreezeChecked(false);
				freezeRef.current = false;
			}

			if (adminMessage.buyImmunity == 'enabled'){
				setBuyImmunityChecked(true);
				immunityRef.current = true; 
			} else if (adminMessage.buyImmunity == 'disabled'){
				setBuyImmunityChecked(false);
				immunityRef.current = false; 
			}

			if (adminMessage.messages && announcementRef.current && adminMessage.messages.length > announcementRef.current.length) {
				setAnnouncementList(adminMessage.messages);
				announcementRef.current = adminMessage.messages;
			}

			if (adminMessage.round.toUpperCase() != roundRef.current) {
				setCurrRound(adminMessage.round.toUpperCase());
				roundRef.current = adminMessage.round.toUpperCase();
				//console.log(adminMessage.round.toUpperCase(), currRound, roundRef);
			}
		};
		
		//console.log(roundRef, freezeRef);
	  }, []);

	
	return (
		<ThemeProvider theme={theme}>
			<Router>
				<Routes>
					{/* Login page */}
					<Route index element={<LoginPage />} />

					{/* Participant Pages */}
					<Route
						element={
							<ParticipantLayout
								freezeOverlay={freezeOverlay}
								isLoggedIn={isLoggedIn} 
								setIsLoggedIn={setIsLoggedIn} 
								checkIfLoggedIn={checkIfLoggedIn}
								currRound={currRound}
								isBuyImmunityChecked={buyImmunityChecked}
								currAnnouncements={announcementList}
							/>
						}
					>
						<Route path="participant/view-all-problems" element={<ViewAllProblemsPage currRound={currRound} />} />
						<Route path="participant/view-specific-problem" element={<ViewSpecificProblemPage />} />
						<Route path="participant/view-submission-log" element={<ViewSubmissionLogPage/>}/>
					</Route>

					{/* Judge Pages */}
					<Route
						element={
							<JudgeLayout
								freezeOverlay={freezeOverlay}
								isLoggedIn={isLoggedIn}
								setIsLoggedIn={setIsLoggedIn} 
								checkIfLoggedIn={checkIfLoggedIn} 
								currAnnouncements={announcementList}
							/>
						}
					>
						<Route path="judge/submissions" element={<ViewSubmissionsPage isLoggedIn={isLoggedIn} />} />
					</Route>
					
					{/* Admin Pages */}
					<Route
						element={
							<AdminLayout
								freezeOverlay={freezeOverlay}
								isLoggedIn={isLoggedIn}
								setIsLoggedIn={setIsLoggedIn} 
								checkIfLoggedIn={checkIfLoggedIn} 
							/>
						}
					>
						<Route path="admin/general" 
							element={
								<GeneralOptionsPage 
									setCurrRound={setCurrRound}
									roundRef={roundRef}
									freezeRef={freezeRef}
									immunityRef={immunityRef}
									announcementRef={announcementRef}
									setFreezeChecked={setFreezeChecked}
									setBuyImmunityChecked={setBuyImmunityChecked}
									setAnnouncementList={setAnnouncementList}
								/>
							}
						/>
						<Route path="admin/logs" element={ <PowerUpLogs /> } />
						<Route path="admin/podium" element={<TopTeamsPage />} />
						<Route path="admin/timer" element={<TimerPage />} />
					</Route>
				</Routes>
				<ToastContainerConfig />
			</Router>
		</ThemeProvider>
	);
}

export default App;