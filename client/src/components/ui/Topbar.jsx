/* eslint-disable */ 
import { useState, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
	AppBar,
	Box,
	Button,
	Toolbar,
	Typography,
} from '@mui/material';


/*
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
	handleButton
}) => {
	// state for the element to be displayed before the title and subtitle.
	const [image, setImage] = useState(true);

	// sets image upon component mount
	useEffect(() => { 
		setImage(isImg);	
	}, []);


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
			<Toolbar sx={{ justifyContent: 'space-between' }}>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'row',
						py: 1,
						gap: 3,
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
						{image ? 
							<img
								src={icon}
								style={{
									maxWidth: '75px',
									maxHeight: '75px',
								}}
							/> :
							<div style={{ fontSize:'1em', color: 'white' }}>{icon}</div>
						}
					</figure>
					
					{/* Title and subtitle */}
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
						}}
					>
						<Typography noWrap variant="h4">
							<span>{title}</span>
						</Typography>
						<Typography noWrap variant="h5">
							<span>{subtitle}</span>
						</Typography>
					</Box>
				</Box>

				{/* Button */}
				<Button
					variant="contained"
					color="major"
					size="large"
					startIcon={ startIcon? <>{startIcon}</> : <></> }
					sx={{
						minWidth: 30,
						'&:hover': {
							bgcolor: 'major.light',
							color: 'general.main',
						}
					}}
				>
					{buttonText}
				</Button>
			</Toolbar>
		</AppBar>
	);
};

export default TopBar;