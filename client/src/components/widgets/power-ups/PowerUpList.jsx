/* eslint-disable */ 
import { useEffect, useState } from 'react';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import LaptopChromebookIcon from '@mui/icons-material/LaptopChromebook';
import Looks3Icon from '@mui/icons-material/Looks3';
import Looks4Icon from '@mui/icons-material/Looks4';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import NoEncryptionIcon from '@mui/icons-material/NoEncryption';
import PanToolIcon from '@mui/icons-material/PanTool';
import { Box } from '@mui/material';


import { getFetch } from 'utils/apiRequest';
import { baseURL } from 'utils/constants';

import PowerUpDetails from './PowerUpDetails';
import PowerUpItem from './PowerUpItem';


  
/**
 * Purpose: This component displays the collapsible ui element after the buy power-up popover is clicked on the view all problems page.
 * Params:
 *    <String>    type - receives the type of power-up clicked.
 *    <Boolean>   openDetails - tells whether to display the list of power-ups or the details of a selected power-up.
 *    <Function>  handleReturn - used to get back to the list of buffs or debuffs from specific powerup description.
 *    <Function>  handleClick - handler for event when a power-up has been selected.
 *    <Object>    selectedPowerUp - state containing the details of the power-up selected.
 */
const PowerUpList = ({
	// type,
	powerups,
	openDetails,
	handleReturn,
	handleClick,
	selectedPowerUp,
	isBuyImmunityChecked
}) => {
	/**
	 * State handlers for list of buffs and debuffs
	 */
	const [buffs, setBuffs] = useState([]);
	const [debuffs, setDebuffs] = useState([]);

	useEffect(() => {
		getAllPowerups();
	}, []);

	/**
	 * Fetches all powerups from the database then separates it by type. 
	 */
	const getAllPowerups = async () => {
		const res = await getFetch(`${baseURL}/powerups/`);
		
		if(res.success === true) {
			const powerups = res.message;
			const transformedArray = [];

			let filteredDebuffs = powerups.filter((powerup) => powerup.type == 0);
			setDebuffs(filteredDebuffs);
			
			const filteredBuffs = powerups.filter(powerup => {
				if (powerup.type !== 1) {
					return false;
				}
				
				if (isBuyImmunityChecked && powerup.code === 'immune') {
					return true;
				}

				if (!isBuyImmunityChecked && powerup.code !== 'immune') {
					return true;
				}

				return false;
			});

			
			/* 
				Spread the buff tiers for each buff.
				Filtered buffs: [{"name": "immunity", "tier": { 1: "some info", 2: "some info" }}]
				Transformed array: [{"name": "immunity", "tier": { 1: "some info"}}, {"name": "immunity", "tier": { 2: "some info" }}] 				
			*/
			filteredBuffs.forEach(item => {
				Object.keys(item.tier).forEach(key => {
					transformedArray.push({
						...item,
						tier: {
							[key]: item.tier[key]
						}
					});
				});
			});

			setBuffs(transformedArray);
		} else {
			console.log(message);
			return [];
		}
	};
	
	/**
   * Displays the icons for each power-up
   */
	const itemIcons = ({ code, tier }) => {
		if (code == 'dispel') {
			return <AutoAwesomeIcon
				sx={{
					fontSize: '1.25rem',
					marginLeft: '20px',
					marginRight: '10px',
					color: '#85eeff',
				}}
			/>;
		} else if (code === 'immune' && Object.keys(tier)[0] == 1) {
			return <LooksOneIcon
				sx={{
					fontSize: '1.25rem',
					marginLeft: '20px',
					marginRight: '10px',
					color: '#ff9cee',
				}}
			/>;
		} else if (code === 'immune' && Object.keys(tier)[0] == 2) {
			return <LooksTwoIcon
				sx={{
					fontSize: '1.25rem',
					marginLeft: '20px',
					marginRight: '10px',
					color: '#b28dff',
				}}
			/>;
		} else if (code === 'immune' && Object.keys(tier)[0] == 3) {
			return <Looks3Icon
				sx={{
					fontSize: '1.25rem',
					marginLeft: '20px',
					marginRight: '10px',
					color: '#e7ffac',
				}}
			/>;
		} else if (code === 'immune' && Object.keys(tier)[0] == 4) {
			return <Looks4Icon
				sx={{
					fontSize: '1.25rem',
					marginLeft: '20px',
					marginRight: '10px',
					color: '#97a2ff',
				}}
			/>;
		} else if (code === 'unchain') {
			return <NoEncryptionIcon
				sx={{
					fontSize: '1.25rem',
					marginLeft: '20px',
					marginRight: '10px',
					color: '#bffcc6',
				}}
			/>;
		} else if (code === 'stun') {
			return <ElectricBoltIcon
				sx={{
					fontSize: '1.25rem',
					marginLeft: '20px',
					marginRight: '10px',
					color: '#85eeff',
				}}
			/>;
		} else if (code === 'editor') {
			return <LaptopChromebookIcon
				sx={{
					fontSize: '1.25rem',
					marginLeft: '20px',
					marginRight: '10px',
					color: '#ff9cee',
				}}
			/>;
		} else if (code === 'frosty') {
			return <PanToolIcon
				sx={{
					fontSize: '1.25rem',
					marginLeft: '20px',
					marginRight: '10px',
					color: '#e7ffac',
				}}
			/>;
		}
	};


	return (
		<Box
			sx={{
				width: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				bgcolor: 'rgba(0, 10, 30, 3)',
				gap: 2,
				paddingY: 3,
			}}
		>
			{!openDetails ?
				<>
					{/* Showing the list of buffs */}
					{powerups.map((powerup, ind) => (
						<PowerUpItem key={ind} icon={itemIcons(powerup)} item={powerup} handleClick={handleClick}/>
					))}
					{/* { type == 'buff' ? */}
						<>
							{/* Show the list of buffs */}
							{/* { buffs.map((item, index) => (
								<PowerUpItem
									key={index}
									icon={itemIcons(item)}
									item={item}
									handleClick={handleClick}
								/>
							))}
						</> :
						<> */}
							{/* Show the list of debuffs */}
							{/* { debuffs.map((item, index) => (
								<PowerUpItem
									key={index}
									icon={itemIcons(item)}
									item={item}
									handleClick={handleClick}
								/>
							))} */}
						</>
					{/* } */}
				</> :
				<>
					{/* Show details of selected power-up */}
					<PowerUpDetails
						type={selectedPowerUp.type}
						handleReturn={handleReturn}
						powerUp={selectedPowerUp}
					/>
				</>
			}
		</Box>
	);
};

export default PowerUpList;