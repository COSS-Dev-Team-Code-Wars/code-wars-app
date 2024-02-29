/* eslint-disable */ 
import Overlay from "./Overlay";
import { Box, CircularProgress, Typography } from "@mui/material";


/**
 * Purpose: Displays overlay for loading screen.
 * Params: None
 */
const LoadingOverlay =() =>{
	return (
		<Box sx={{ zIndex: 1650 }}>
			<Overlay
				icon={
					<CircularProgress color="white" />
				}
				text={
					<Typography 
						variant="body1"
						sx={{
							whiteSpace: 'pre-wrap',
							textAlign: 'center'
						}}
					>
						Loading...
					</Typography>
				}
			/> 
		</Box>
	)
}

export default LoadingOverlay;