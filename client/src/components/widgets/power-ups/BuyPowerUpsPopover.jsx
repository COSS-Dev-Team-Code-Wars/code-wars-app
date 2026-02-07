/* eslint-disable */
import { useEffect, useState } from 'react';

import { Box } from '@mui/material';

import { PowerUpList, PowerUpType } from 'components';
import { baseURL } from 'utils/constants';


/**
 * Purpose: This component displays all the collapsible ui elements based on the types of
 *          power-ups after the buy power-up popover is clicked on the view all problems page.
 * Params:
 *    <Boolean> isOpen - tells whether to open the popover or not.
 *    <Array>   buffsState - contains state handlers for showing list of buffs.
 *    <Array>   debuffsState - contains state handlers for showing list of debuffs.
 *    <Array>   detailsState - contains state handlers for showing details of selected power-up.
 *    <Array>   powerUpState - contains state handlers for selected power-up.
 */
const BuyPowerUpsPopover = ({
	isOpen,
	buffsState,
	debuffsState,
	detailsState,
	powerUpState,
	isBuyImmunityChecked
}) => {

	const [showBuffs, setShowBuffs] = buffsState;
	const [showDebuffs, setShowDebuffs] = debuffsState;
	const [seeDetails, setSeeDetails] = detailsState;
	const [selectedPowerUp, setSelectedPowerUp] = powerUpState;

	const [buffs, setBuffs] = useState([]);
	const [debuffs, setDebuffs] = useState([]);

	/**
   * Reset the view of buffs and debuffs when powerup modal is closed
   */
	useEffect(() => {
		if (isOpen) loadPowerUps()
		// if (isOpen) return;
		// else if (!isOpen) {
		// 	setShowBuffs(false);
		// 	setShowDebuffs(false);
		// 	setSeeDetails(false);
		// 	setSelectedPowerUp(null);
		// }
	}, [isOpen]);

	const loadPowerUps = async () => {
		const res = await fetch(`${baseURL}/powerups`)
		const data = await res.json();

		// Filter buffs (type === 1)
		const rawBuffs = data.message.filter((powerup => powerup.type === 1));

		// Spread the buff tiers for each buff so each tier becomes a separate selectable item
		// Example: Immunity with tiers 1,2,3,4 becomes 4 separate entries
		const transformedBuffs = [];
		rawBuffs.forEach(item => {
			Object.keys(item.tier).forEach(key => {
				transformedBuffs.push({
					...item,
					tier: {
						[key]: item.tier[key]
					}
				});
			});
		});

		setBuffs(transformedBuffs);
		setDebuffs(data.message.filter((powerup => powerup.type === 0)));
	}

	/**
   * For viewing the details of selected power-up.
   */
	useEffect(() => {
		if (selectedPowerUp == null) return;
		setSeeDetails(true);
	}, [selectedPowerUp]);

	/**
   * Shows the buff list when buff container is clicked.
   */
	const handleClickBuff = () => {
		if (!showBuffs && showDebuffs) setShowDebuffs(!showDebuffs);
		setShowBuffs(!showBuffs);
		setSelectedPowerUp(null);
		setSeeDetails(false);
	};

	/**
   * Shows the debuff list when debuff container is clicked.
   */
	const handleClickDebuff = () => {
		if (showBuffs && !showDebuffs) setShowBuffs(!showBuffs);
		setShowDebuffs(!showDebuffs);
		setSelectedPowerUp(null);
		setSeeDetails(false);
	};

	/**
   * Get back to the list of buffs or debuffs from specific powerup description.
   */
	const handleReturn = () => {
		setSeeDetails(false);
		setSelectedPowerUp(null);
		setSelectedPowerUp(null);
	};


	return (
		<>
			{isOpen &&
				<Box
					sx={{
						width: {
							xs: '300px',
							md: '350px',
							lg: '400px'
						},
						position: 'absolute',
						top: 0,
						right: 0,
						zIndex: 20,
						marginTop: '80px',
						marginRight: '25px',
						borderRadius: '10px',
						border: '2px solid rgba(0, 159, 172, 0.4)',
						bgcolor: 'rgba(0, 0, 10, 1)',
						backdropFilter: 'blur(10px)',
						WebkitBackdropFilter: 'blur(10px)',
						boxShadow: '0px 0px 10px 5px rgba(0, 0, 0, 0.5)',
					}}
				>
					{/* Container for Buffs */}
					<PowerUpType seePowerups={showBuffs} label="Buff" handleClick={handleClickBuff} />

					{/* The Buffs List */}
					{showBuffs ?
						<PowerUpList
							// type="buff"
							powerups={buffs}
							openDetails={seeDetails}
							handleClick={(powerup) => { setSelectedPowerUp(powerup); }}
							handleReturn={handleReturn}
							selectedPowerUp={selectedPowerUp}
							isBuyImmunityChecked={isBuyImmunityChecked}
						/> : null
					}

					{/* Container for Debuffs */}
					<PowerUpType seePowerups={showDebuffs} label="Debuff" handleClick={handleClickDebuff} />

					{/* The Debuffs List 
						*		Debuffs cannot be bought when buy immunity is enabled
						*/}
					{/* {showDebuffs && !isBuyImmunityChecked ? */}
					{showDebuffs ?
						<PowerUpList
							// type="debuff"
							powerups={debuffs}
							openDetails={seeDetails}
							handleClick={(powerup) => { setSelectedPowerUp(powerup); }}
							handleReturn={handleReturn}
							selectedPowerUp={selectedPowerUp}
						/> : null
					}
				</Box>
			}
		</>
	);
};

export default BuyPowerUpsPopover;