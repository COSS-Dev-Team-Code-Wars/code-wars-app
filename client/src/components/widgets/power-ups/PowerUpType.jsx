/* eslint-disable */ 
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Box, Toolbar } from '@mui/material';


/**
 * Purpose: This component displays the collapsible ui element for one type of power-up.
 * Params:
 *    <Boolean>   seePowerups - tells whether to expand the collapsible ui element
 *    <String>    label - text for power-up type
 *    <Function>  handleClick - handle click event for collapsible
 */
const PowerUpType = ({ seePowerups, label, handleClick }) => {
	return (
		<Box
			sx={{
				display: 'flex',
				justifyContent: 'center',
				cursor: 'pointer',
				color: 'white.main',

				'&:hover': {
					bgcolor: 'rgba(255, 255, 255, 0.05)',
					color: 'major.main',
				},
			}}
			onClick={handleClick}
		>
			{/* Subcontainer for the Buff title and arrow icon */}
			<Toolbar
				sx={{
					width: {
						xs: '70%',
						xl: '80%'
					},
					justifyContent: 'space-between',
					fontFamily: 'Inter',
					fontWeight: '500',
					fontSize: {
						xs: '0.95rem',
						lg: '1rem',
					}
				}}
			>
				{/* Buff title */}
				{label}

				{/* Arrow Icons
          - points upwards if not showing the list of buffs
          - points downwards if showing the list of buffs
        */}
				{ seePowerups ? (
					<KeyboardArrowUpIcon sx={{ width: '1em', height: '1em' }} />
				) : (
					<KeyboardArrowUpIcon sx={{ width: '1em', height: '1em', transform: 'rotate(180deg)' }} />
				)}
			</Toolbar>
		</Box>
	);
};

export default PowerUpType;