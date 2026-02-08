/* eslint-disable */ 
import { Box } from '@mui/material';


/**
 * Purpose: Overlay Component for screens
 * Params: 
 * 	<Component>		icon - receives icon to be displayed
 * 	<String>			text - receives text to be displayed
 */
const Overlay = ({ icon, text, body }) => {
	return(
		<Box  
			sx={{
				display: 'flex', 
				height: '100vh',
				alignItems: 'center',
				justifyContent: 'center',
				bgcolor: 'rgba(255, 255, 255, 0.1)',
				boxShadow: '0px 0px 10px 5px rgba(0, 0, 0, 0.5)',
				backdropFilter: 'blur(10px)',
			}}
		>
			<Box 
				sx={{
					display: 'flex',
					flexDirection: 'column',
					color: '#FFF',
				}}	
			>		
				{icon}
				<br />
				{text}
				<br />
				{body}
			</Box>
		</Box>

	);
};

export default Overlay;
//test