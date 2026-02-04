/* eslint-disable */ 
import BoltIcon from '@mui/icons-material/Bolt';
import LogoutIcon from '@mui/icons-material/Logout';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import SettingsIcon from '@mui/icons-material/Settings';
import TimerIcon from '@mui/icons-material/Timer';
import {
	Box,
	Button,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Toolbar,
	Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { handleLogout } from 'utils/commonFunctions';

const DRAWER_WIDTH = 250;

/**
 * Purpose: Sidebar navigation for admin user.
 * Params: None
 */
const Sidebar = () => {
	// used for client-side routing to other pages
	const navigate = useNavigate();
	
	return (
		<Box>
			<Box
				anchor="left"
				sx={{
					width: DRAWER_WIDTH,
					flexShrink: 0,
					height: '100vh',

					// modify background styling
					boxSizing: 'border-box',
					backgroundColor: 'rgba(179,179,179,0.25)',
					boxShadow: '0px 0px 10px 5px rgba(0, 0, 0, 0.5)',
					backdropFilter: 'blur(10px)',
				}}
			>
				{/* Sidebar Header */}
				<Toolbar />
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center '}}>
					<Typography variant="h4">CODE WARS</Typography>
					<Typography variant="h5">Admin</Typography>
				</Box>
				<Toolbar />

				{/* Sidebar Buttons */}
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

					{/* General Options */}
					<Button
						variant="contained"
						color="major"
						size="large"
						onClick={() => { navigate('/admin/general'); }}
						startIcon={<SettingsIcon />}
						sx={{
							width: '85%',
							'&:hover': {
								bgcolor: 'major.light',
								color: 'general.main',
							}
						}}
					>
            General Options
					</Button>
          
					{/* Power-up Logs */}
					<Button
						variant="contained"
						color="major"
						size="large"
						onClick={() => { navigate('/admin/logs'); }}
						startIcon={<BoltIcon />}
						sx={{
							marginTop: '2em',
							width: '85%',
							'&:hover': {
								bgcolor: 'major.light',
								color: 'general.main',
							}
						}}
					>
            Power-up Logs
					</Button>

					{/* Podium Page */}
					<Button
						variant="contained"
						color="major"
						size="large"
						onClick={() => { navigate('/admin/podium'); }}
						startIcon={<MilitaryTechIcon />}
						sx={{
							marginTop: '2em',
							width: '85%',
							'&:hover': {
								bgcolor: 'major.light',
								color: 'general.main',
							}
						}}
					>
							Podium
					</Button>

					{/* Podium Page */}
					<Button
						variant="contained"
						color="major"
						size="large"
						onClick={() => { navigate('/admin/timer'); }}
						startIcon={<TimerIcon/>}
						sx={{
							marginTop: '2em',
							width: '85%',
							'&:hover': {
								bgcolor: 'major.light',
								color: 'general.main',
							}
						}}
					>
							Round Timer
					</Button>

					{/* Create Team */}
					<Button
						variant="contained"
						color="major"
						size="large"
						onClick={() => { navigate('/admin/create-team'); }}
						sx={{
							marginTop: '2em',
							width: '85%',
							'&:hover': {
								bgcolor: 'major.light',
								color: 'general.main',
							}
						}}
					>
						Create Team
					</Button>

					{/* Create Question */}
					<Button
						variant="contained"
						color="major"
						size="large"
						onClick={() => { navigate('/admin/create-question'); }}
						sx={{
							marginTop: '2em',
							width: '85%',
							'&:hover': {
								bgcolor: 'major.light',
								color: 'general.main',
							}
						}}
					>
						Create Question
					</Button>
					
				</Box>

				{/* Logout Button */}
				<List
					onClick={()=>{handleLogout(navigate);}}
					sx={{
						position: 'absolute',
						bottom: '0',
						width: '100%',
						marginBottom: '2em',
					}}>
					<ListItem disablePadding>
						<ListItemButton sx={{ '&:hover': { backgroundColor: 'rgba(111,111,111,.75)'} }}>
							<ListItemIcon>
								<LogoutIcon sx={{ transform: 'scaleX(-1)', color: '#fff', marginLeft: '.25em' }} />
							</ListItemIcon>
							<ListItemText
								primary="Logout"
								sx={{
									'& .MuiListItemText-primary': {
										color: '#fff',
									},
								}}
							/>
						</ListItemButton>
					</ListItem>
				</List>
			</Box>
		</Box>
	);
};

export default Sidebar;