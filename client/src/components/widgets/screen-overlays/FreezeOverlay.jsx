/* eslint-disable */ 
import HourglassFullTwoToneIcon from '@mui/icons-material/HourglassFullTwoTone';
import { Typography } from '@mui/material';

import Overlay from './Overlay';


/**
 * Purpose: Displays frozen screen overlay
 * Params: None
 */
const FreezeOverlay = () => {
	return (
		<Overlay
			icon={<HourglassFullTwoToneIcon
				style={{
					fontSize: '10rem',
					alignSelf: 'center',
				}}
				// sx={{
				// 	"@keyframes spin": {
				// 		"0%": {
				// 			transform: "rotate(360deg)",
				// 		},
				// 		"100%": {
				// 			transform: "rotate(0deg)",
				// 		},
				// 	},
				// 	animation: "spin 2.5s linear infinite",
				// }}
				className="fOverlay"
			/>}
			text={<Typography 
				variant="h4"
				sx={{
					whiteSpace: 'pre-wrap',
					textAlign: 'center',
					fontWeight: 'bold',
					textShadow: '0px 0px 20px rgba(0, 0, 0, 0.9), 0px 0px 40px rgba(0, 0, 0, 0.7), 2px 2px 4px rgba(0, 0, 0, 1)',
					letterSpacing: '0.5px'
				}}
				className="fOverlay"
			>
				
				Your screen has been frozen. <br/>
				Please Wait.
			</Typography>}
		/> 
	);
};

export default FreezeOverlay;