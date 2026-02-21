/* eslint-disable */
import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { socketClient } from 'socket/socket';


/**
 * Purpose: Displays the round timer.
 * Params: None
 */
const RoundTimer = ({
	fontSize,
	minWidth,
	...props
}) => {

	/**
	 * State handler for the round timer.
	 */
	const [seconds, setSec] = useState('00:00');

	useEffect(()=>{
		socketClient.on('update',(arg)=>{
			var formattedSec = new Date(arg.remainingTime * 1000).toISOString().slice(14, 19);

			setSec(formattedSec);
		});

		return () => {
			socketClient.off('update');
		};
	  },[]);

	
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				minWidth: {minWidth},
				alignItems: 'center',
			}}
		>			<Typography
				noWrap
				color="primary.contrastText"
				sx={{
					fontFamily: 'Poppins',
					fontWeight: 600,
					fontSize: {fontSize},
					alignItems: 'center',
					alignContent: 'center',
					justifyContent: 'center',
				}}
			>
				<span>ROUND TIMER</span>
			</Typography>

			<Typography 
				noWrap 
				variant="h3" 
				sx={{
					fontWeight: 900,
					fontSize: '4.5rem',
					color: 'primary.contrastText',
					letterSpacing: '0.1em',
				}}
				{...props}
			>
				{seconds}
			</Typography>
		</Box>
	);
};

export default RoundTimer;