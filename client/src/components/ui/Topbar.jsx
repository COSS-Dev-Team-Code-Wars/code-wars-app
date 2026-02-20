/* eslint-disable */ 
import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import {
	AppBar,
	Box,
	Button,
	Badge,
	Toolbar,
	Typography,
	useMediaQuery,
	useTheme
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CampaignIcon from '@mui/icons-material/Campaign';

import { handleLogout } from 'utils/commonFunctions';



/**
 * Purpose: Displays the topbar component for the participant and judge-related pages.
 * Params:
 *    <Boolean> 	isImg - tells whether 'icon' parameter is an image or not.
 *    <Component> icon - receives the icon to be displayed on the leftmost part of the topbar.
 *    <String>  	title - title to be displayed
 *    <String>  	subtitle - subtitle to be displayed
 *    <String>  	buttonText - text to display on the button at the right part of the topbar.
 *    <Component>	startIcon - icon to display in the button at the right part of the topbar.
 *    <Func>  		handleButton - function to handle the button at the right part of the topbar.
 */
const TopBar = ({
	isImg,
	icon,
	title,
	subtitle,
	buttonText,
	startIcon,
	handleButton,
	handleClick,
	hasNewUpdate,
	disabledState,
	additionalButtonText,
  additionalButtonIcon,
  additionalButtonDisabled,
  handleAdditionalButton
}) => {
	/** 
   * State handler for the element to be displayed before the title and subtitle.
   */
	const [image, setImage] = useState(true);

	// used for client-side routing to other pages
	const navigate = useNavigate();

	/**
   * Sets image upon component mount
   */
	useEffect(() => {
		setImage(isImg);
	}, []);


	const theme = useTheme();
	const onlySmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
	const onlyMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
	const onlyLargeScreen = useMediaQuery(theme.breakpoints.down("lg"));




	return (
		<AppBar
			color="glass"
			sx={{
				backgroundColor: 'rgba(179,179,179,0.25)',
				boxShadow: '0px 0px 10px 5px rgba(0, 0, 0, 0.5)',
				backdropFilter: 'blur(4px)',
				position: 'static',
			}}
		>
			<Toolbar sx={{ justifyContent: 'space-between', height: '10px' }}>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'row',
						py: 1,
						gap: 2,
					}}
				>
					{/* Override default attributes of figure tag */}
					<figure
						style={{
							padding: 0,
							margin: 0,
							border: 0,
							margin: 'auto',
						}}
					>
						{/* Displays either an image or an icon */}
						{isImg ? (
							<img
								src={icon}
								style={{
									maxWidth: '50px',
									maxHeight: '50px',
									marginRight: 12,
									marginLeft: 10,
								}}
							/>
						) : (
							<div>{icon}</div>
						)}
					</figure>

					{/* Title and subtitle */}
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
						}}
					>
						<Typography noWrap variant="h5">
							<span>{title}</span>
						</Typography>
						<Typography noWrap variant="h6">
							<span>{subtitle}</span>
						</Typography>
					</Box>
				</Box>				<div>
					{/* Button */}					{additionalButtonText && (
						<Button
						variant="contained"
						color="major"
						size="large"
						disabled={additionalButtonDisabled}
						onClick={handleAdditionalButton}
						startIcon={additionalButtonIcon ? <>{additionalButtonIcon}</> : <></>}
						sx={{
							minWidth: 30,
							'&:hover': {
								bgcolor: 'major.light',
								color: 'general.main',
							},
							'&:disabled': {
								bgcolor: 'major.light',
								color: 'major.contrastText'
							}
						}}
					>
						{
							onlyLargeScreen ? null : <>{additionalButtonText}</>
						}
						</Button>
					)}

					{buttonText && (
						<Button
						variant="contained"
						color="major"
						size="large"
						disabled={disabledState}
						onClick={handleButton}
						startIcon={startIcon ? <>{startIcon}</> : <></>}
						sx={{
							minWidth: 30,
							'&:hover': {
								bgcolor: 'major.light',
								color: 'general.main',
							},
							'&:disabled': {
								bgcolor: 'major.light',
								color: 'major.contrastText'
							},
							marginLeft: "10px"

						}}
					>
						{
							onlyLargeScreen ? null : <>{buttonText}</>
						}
						</Button>
					)}

					{/* Temporary Announcement Button for participants */}
					<Button
						variant="contained"
						color="major"
						size="large"
						onClick={handleClick}
						sx={{
							minWidth: 10,
							'&:hover': {
								bgcolor: 'major.light',
								color: 'general.main',
							},
							marginLeft: "10px"
						}}
					>
						{/* Red dot appears when there's a new update & button hasn't been clicked yet */}
						<Badge 
							color="error" 
							variant="dot" 
							invisible={!hasNewUpdate}
						>
							<CampaignIcon />
						</Badge>
					</Button>

					{/* Temporary Logout Button for participants */}
					<Button
						variant="contained"
						color="major"
						size="large"
						onClick={()=>{handleLogout(navigate)}}
						sx={{
							minWidth: 10,
							'&:hover': {
								bgcolor: 'major.light',
								color: 'general.main',
							},
							marginLeft: "10px"
						}}
					>
						<LogoutIcon />
					</Button>
				</div>
			</Toolbar>
		</AppBar>
	);
};

export default TopBar;
