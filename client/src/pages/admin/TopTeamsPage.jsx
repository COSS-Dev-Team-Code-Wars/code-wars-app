/* eslint-disable */
import Looks3Icon from '@mui/icons-material/Looks3';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Box, Typography, alpha } from '@mui/material';
import getLeaderboard from 'components/widgets/leaderboard/getLeaderboard';
import { useEffect, useState } from 'react';


/**
 * @returns component for admin - podium page
 */
const TopTeamsPage = () => {
	const [leaderboard, setLeaderboard] = useState([]);
	
	// websocket.on for leaderboard update then get top 3 teams
  useEffect(() => {
		fetchData();
	}, [leaderboard]);

	const fetchData = async () => {
		let currLeaderboard = await getLeaderboard();

		setLeaderboard(currLeaderboard);
	}
	return (
		<Box
			sx={{
				position: 'absolute',
				top: '50%',
				left: '55%',
				transform: 'translate(-50%, -50%)',
			}}
		>
			{/* Header */}
			<Box
				sx={{
					mb: 6,
					textAlign: 'center',
				}}
			>
				<Box
					sx={{
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						mb: 2,
					}}
				>
					<EmojiEventsIcon
						sx={{
							fontSize: 80,
							color: '#ffd700',
							filter: 'drop-shadow(0 4px 8px rgba(255, 215, 0, 0.5))',
							animation: 'pulse 2s ease-in-out infinite',
							'@keyframes pulse': {
								'0%, 100%': { transform: 'scale(1)' },
								'50%': { transform: 'scale(1.1)' },
							},
						}}
					/>
				</Box>
				<Typography
					variant="h2"
					sx={{
						fontWeight: 900,
						color: '#fff',
						textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
						letterSpacing: '2px',
						fontFamily: 'Poppins, sans-serif',
					}}
				>
					TOP TEAMS
				</Typography>
				<Typography
					variant="h5"
					sx={{
						color: alpha('#fff', 0.9),
						fontWeight: 300,
						mt: 1,
						fontFamily: 'Poppins, sans-serif',
					}}
				>
					Leaderboard
				</Typography>
			</Box>

			{/* Podium Container */}
			<Box
				sx={{
					position: 'relative',
					width: 650,
					height: 550,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'flex-end',
					alignItems: 'center',
					background: alpha('#fff', 0.1),
					backdropFilter: 'blur(10px)',
					WebkitBackdropFilter: 'blur(10px)',
					borderRadius: 6,
					boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
					border: `2px solid ${alpha('#fff', 0.2)}`,
					padding: 4,
					overflow: 'hidden',
					'&::before': {
						content: '""',
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						height: '4px',
					},
				}}
			>
				{/* 1st Place */}
				<Box
					sx={{
						position: 'absolute',
						bottom: 80,
						left: '50%',
						transform: 'translateX(-50%)',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						zIndex: 3,
					}}
				>
					<Box
						sx={{
							position: 'relative',
							mb: 2,
						}}
					>
						<LooksOneIcon
							sx={{
								fontSize: 90,
								color: '#FFD41D',
								filter: 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3))',
							}}
						/>
					</Box>
					<Typography
						sx={{
							color: '#fff',
							fontFamily: 'Poppins, sans-serif',
							fontWeight: 700,
							fontSize: '1.25rem',
							textAlign: 'center',
							maxWidth: 150,
							textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
							mb: 1,
						}}
					>
						{leaderboard[0] !== undefined ? leaderboard[0].team_name : 'TBD'}
					</Typography>
					<Box
						sx={{
							width: 150,
							height: 280,
							borderRadius: 3,
							background: 'linear-gradient(135deg, #ef5555 0%, #d63031 100%)',
							boxShadow: '0 8px 24px rgba(239, 85, 85, 0.4)',
							border: '3px solid',
							borderColor: alpha('#fff', 0.3),
							position: 'relative',
							overflow: 'hidden',
						}}
					/>
				</Box>

				{/* 2nd Place */}
				<Box
					sx={{
						position: 'absolute',
						bottom: 80,
						left: 80,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						zIndex: 2,
					}}
				>
					<Box
						sx={{
							position: 'relative',
							mb: 2,
						}}
					>
						<LooksTwoIcon
							sx={{
								fontSize: 80,
								color: '#c0c0c0',
								filter: 'drop-shadow(0 4px 12px rgba(192, 192, 192, 0.6))',
							}}
						/>
					</Box>
					<Typography
						sx={{
							color: '#fff',
							fontFamily: 'Poppins, sans-serif',
							fontWeight: 600,
							fontSize: '1.1rem',
							textAlign: 'center',
							maxWidth: 130,
							textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
							mb: 1,
						}}
					>
						{leaderboard[1] !== undefined ? leaderboard[1].team_name : 'TBD'}
					</Typography>
					<Box
						sx={{
							width: 130,
							height: 210,
							borderRadius: 3,
							background: 'linear-gradient(135deg, #4a81c2 0%, #3867a6 100%)',
							boxShadow: '0 8px 24px rgba(74, 129, 194, 0.4)',
							border: '3px solid',
							borderColor: alpha('#fff', 0.3),
							position: 'relative',
							overflow: 'hidden',
						}}
					/>
				</Box>

				{/* 3rd Place */}
				<Box
					sx={{
						position: 'absolute',
						bottom: 80,
						right: 80,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						zIndex: 1,
					}}
				>
					<Box
						sx={{
							position: 'relative',
							mb: 2,
						}}
					>
						<Looks3Icon
							sx={{
								fontSize: 70,
								color: '#cd7f32',
								filter: 'drop-shadow(0 4px 12px rgba(205, 127, 50, 0.6))',
							}}
						/>
					</Box>
					<Typography
						sx={{
							color: '#fff',
							fontFamily: 'Poppins, sans-serif',
							fontWeight: 600,
							fontSize: '1rem',
							textAlign: 'center',
							maxWidth: 120,
							textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
							mb: 1,
						}}
					>
						{leaderboard[2] !== undefined ? leaderboard[2].team_name : 'TBD'}
					</Typography>
					<Box
						sx={{
							width: 120,
							height: 150,
							borderRadius: 3,
							background: 'linear-gradient(135deg, #44b86d 0%, #36925a 100%)',
							boxShadow: '0 8px 24px rgba(68, 184, 109, 0.4)',
							border: '3px solid',
							borderColor: alpha('#fff', 0.3),
							position: 'relative',
							overflow: 'hidden',
						}}
					/>
				</Box>

				{/* Base Line */}
				<Box
					sx={{
						position: 'absolute',
						bottom: 80,
						left: 0,
						right: 0,
						height: 4,
						background: alpha('#fff', 0.3),
						zIndex: 0,
					}}
				/>
			</Box>
		</Box>
	);
};

export default TopTeamsPage;