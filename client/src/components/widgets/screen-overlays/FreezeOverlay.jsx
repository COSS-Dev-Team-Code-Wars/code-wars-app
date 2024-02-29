/* eslint-disable */ 
import Overlay from "./Overlay";
import { Typography } from "@mui/material";
import HourglassFullTwoToneIcon from '@mui/icons-material/HourglassFullTwoTone';

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
					alignSelf: 'center'
				}}
				className="fOverlay"
				sx={{
					animation: "spin 2s linear infinite",
					"@keyframes spin": {
						"0%": {
							transform: "rotate(360deg)",
						},
						"100%": {
							transform: "rotate(0deg)",
						},
					},
				}}
			/>}
			text={<Typography 
				variant="h4"
				sx={{
					whiteSpace: 'pre-wrap',
					textAlign: 'center'
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