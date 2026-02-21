/* eslint-disable */ 
import { useState, useEffect } from 'react';

import {
	Box,
	Button,
	Chip,
	Container,
	Divider,
	Paper,
	Stack,
	Switch,
	Toolbar,
	Typography,
	useTheme
} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import {
	DropdownSelect,
	ErrorWindow,
	SuccessWindow,
	Table
} from 'components/';
import getLeaderboard from 'components/widgets/leaderboard/getLeaderboard';
import { socketClient } from 'socket/socket';
import { postFetch } from 'utils/apiRequest';
import { baseURL } from 'utils/constants';
import {
	optionsRounds,
	columnsLeaderboard,
} from 'utils/dummyData';
import { enterAdminPassword } from 'utils/enterAdminPassword';
import { RoundTimer } from 'components';
import { columnsLeaderboardAdmin } from 'utils/dummyData';




// styling for leaderboard table
const additionalStyles = {
	backgroundColor: '#fff',
	borderRadius: 2,
	overflow: 'hidden',
	boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
	'& .MuiDataGrid-row': {
		transition: 'all 0.2s ease-in-out',
		'&:hover': {
			backgroundColor: 'rgba(0, 0, 0, 0.02)',
			transform: 'scale(1.005)',
		}
	},
	'& .MuiDataGrid-columnHeaders': {
		backgroundColor: 'rgba(0, 0, 0, 0.05)',
		fontSize: '1rem',
		fontWeight: 600,
	}
};

// Get color based on round
const getRoundColor = (round) => {
	const colors = {
		'START': '#9E9E9E',
		'EASY': '#4CAF50',
		'MEDIUM': '#FF9800',
		'HARD': '#F44336',
		'WAGER': '#9C27B0',
		'BONUS': '#2196F3'
	};
	return colors[round?.toUpperCase()] || colors['START'];
};


/**
 * Purpose: Displays round timer and leaderboard page for admin.
 */
const TimerPage = ({ currRound }) => {

	/**
	 * State handler for rows of overall leaderboard.
	 */
	const [leaderboardRows, setLeaderboardRows] = useState([]);
	const theme = useTheme();
	const roundColor = getRoundColor(currRound);

	/**
	 * Fetch overall leaderboard data
	 */
	useEffect(() => { 
		fetchData();
	}, []);
	
	/**
	 * Web sockets for real time update
	 */
	useEffect(() => { 
		if(!socketClient) return;

		socketClient.on('evalupdate', () => {
			fetchData();
		});

		socketClient.on('updateScoreOnBuyBuff', () => {
			fetchData();
		});

		socketClient.on('updateScoreOnBuyDebuff', () => {
			fetchData();
		});


		return () => {
			socketClient.off('evalupdate');
			socketClient.off('updateScoreOnBuyBuff');
			socketClient.off('updateScoreOnBuyDebuff');
		};
	});

	/**
	* Handles opening of modal window for overall leaderboard.
	*/
	const handleButton = () => {
		setOpen(true);
	};

	/**
	 * Fetch leaderboard data
	 */
	async function fetchData() {
		let currLeaderboard = await getLeaderboard();
		setLeaderboardRows(currLeaderboard);
	}	return (
		<Container maxWidth="xl" sx={{ py: 3, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
			<Stack spacing={3} sx={{ width: '70%' }}>

				{/* Round Timer Section */}
				<Paper 
					elevation={12}
					sx={{ 
						p: { xs: 2, md: 3 },
						background: `linear-gradient(135deg, ${roundColor}15 0%, ${roundColor}08 100%)`,
						backdropFilter: 'blur(10px)',
						borderRadius: 4,
						border: `2px solid ${roundColor}40`,
						boxShadow: `0 8px 32px ${roundColor}30, 0 0 60px ${roundColor}20`,
						position: 'relative',
						overflow: 'hidden',
						transition: 'all 0.3s ease-in-out',
						'&:hover': {
							transform: 'translateY(-4px)',
							boxShadow: `0 12px 40px ${roundColor}40, 0 0 80px ${roundColor}30`,
						},
						'&::before': {
							content: '""',
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							height: '4px',
							background: `linear-gradient(90deg, ${roundColor} 0%, transparent 100%)`,
						}
					}}
				>
					<Stack spacing={2.5} alignItems="center">
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
							<Box 
								sx={{ 
									background: `linear-gradient(135deg, ${roundColor} 0%, ${roundColor}CC 100%)`,
									borderRadius: '50%',
									p: 2,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									boxShadow: `0 4px 20px ${roundColor}40`,
									animation: 'pulse 2s ease-in-out infinite',
									'@keyframes pulse': {
										'0%, 100%': {
											transform: 'scale(1)',
											boxShadow: `0 4px 20px ${roundColor}40`,
										},
										'50%': {
											transform: 'scale(1.05)',
											boxShadow: `0 6px 30px ${roundColor}60`,
										}
									}
								}}
							>
								<TimerIcon sx={{ fontSize: '2.5rem', color: '#fff' }} />
							</Box>							<Stack alignItems={{ xs: 'center', sm: 'flex-start' }} spacing={0.5}>
								<Typography
									variant="h3"
									sx={{
										fontWeight: 700,
										fontFamily: 'Poppins',
										background: `linear-gradient(135deg, ${roundColor} 0%, ${roundColor}DD 100%)`,
										WebkitBackgroundClip: 'text',
										WebkitTextFillColor: 'transparent',
										backgroundClip: 'text',
										letterSpacing: '1px',
										textTransform: 'uppercase',
										textAlign: { xs: 'center', sm: 'left' }
									}}
								>
									{currRound || 'START'} Round
								</Typography>
								<Chip 
									label="LIVE"
									size="small"
									sx={{ 
										bgcolor: roundColor,
										color: '#fff',
										fontWeight: 600,
										fontSize: '0.75rem',
										animation: 'blink 1.5s ease-in-out infinite',
										'@keyframes blink': {
											'0%, 100%': { opacity: 1 },
											'50%': { opacity: 0.6 }
										}
									}}
								/>
							</Stack>
						</Box>
						
						<Divider 
							sx={{ 
								width: '100%', 
								bgcolor: `${roundColor}30`,
								height: 2,
								borderRadius: 1
							}} 
						/>
						
						<Box sx={{ 
							width: '30%', 
							display: 'flex', 
							justifyContent: 'center',
							p: 2,
							background: 'rgba(255,255,255,0.05)',
							borderRadius: 3,
							border: '1px solid rgba(255,255,255,0.15)'
						}}>
							<RoundTimer fontSize='2rem' fontWeight='bold' minWidth='600px' />
						</Box>
					</Stack>
				</Paper>

				{/* Leaderboard Section */}
				<Paper
					elevation={12}
					sx={{ 
						p: { xs: 3, md: 4 },
						background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
						backdropFilter: 'blur(10px)',
						borderRadius: 4,
						border: '2px solid rgba(255,255,255,0.2)',
						boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 60px rgba(255,255,255,0.1)',
						position: 'relative',
						overflow: 'hidden',
						transition: 'all 0.3s ease-in-out',
						'&:hover': {
							transform: 'translateY(-4px)',
							boxShadow: '0 12px 40px rgba(0,0,0,0.4), 0 0 80px rgba(255,255,255,0.15)',
						},
						'&::before': {
							content: '""',
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							height: '4px',
							background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
						}
					}}
				>
					<Stack spacing={2.5} alignItems="center">
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
							<Box 
								sx={{ 
									background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
									borderRadius: '50%',
									p: 1.5,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)',
								}}
							>
								<EmojiEventsIcon sx={{ fontSize: '2.5rem', color: '#fff' }} />
							</Box>							<Typography
								variant="h4"
								sx={{
									fontWeight: 700,
									fontFamily: 'Poppins',
									background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
									WebkitBackgroundClip: 'text',
									WebkitTextFillColor: 'transparent',
									backgroundClip: 'text',
									letterSpacing: '1px',
									textAlign: { xs: 'center', sm: 'left' }
								}}
							>
								Leaderboard
							</Typography>
						</Box>
						
						<Divider 
							sx={{ 
								width: '100%', 
								bgcolor: 'rgba(255,215,0,0.3)',
								height: 2,
								borderRadius: 1
							}} 
						/>
						
						<Box sx={{ width: '100%', maxWidth: '1000px' }}>
							<Table
								rows={leaderboardRows}
								columns={columnsLeaderboardAdmin}
								hideFields={['id', 'total_points_used']}
								additionalStyles={additionalStyles}
								pageSizeOptions={[5, 10, 15, 20]}
								pageSize={10}
								autoHeight
								initialState={{
									pagination: { paginationModel: { pageSize: 10 } },
								}}
								slots={{
									noRowsOverlay: () => (
										<Stack height="100%" alignItems="center" justifyContent="center" py={6}>
											<Box
												sx={{
													position: 'relative',
													mb: 3
												}}
											>
												<LeaderboardIcon 
													sx={{ 
														fontSize: '5rem', 
														color: 'rgba(0,0,0,0.1)',
														animation: 'float 3s ease-in-out infinite',
														'@keyframes float': {
															'0%, 100%': { transform: 'translateY(0px)' },
															'50%': { transform: 'translateY(-10px)' }
														}
													}} 
												/>
											</Box>
											<Typography variant="h5" fontWeight={600} color="text.secondary" mb={1}>
												No Rankings Yet
											</Typography>
											<Typography variant="body1" color="text.secondary">
												Leaderboard will populate when submissions are evaluated
											</Typography>
											<Chip 
												label="Waiting for submissions..."
												sx={{ 
													mt: 2,
													bgcolor: 'rgba(0,0,0,0.05)',
													color: 'text.secondary',
													fontWeight: 500
												}}
											/>
										</Stack>
									)
								}}
							/>
						</Box>
					</Stack>
				</Paper>

			</Stack>
		</Container>
	);
};


export default TimerPage;