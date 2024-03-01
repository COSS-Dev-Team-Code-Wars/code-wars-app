/* eslint-disable */ 
import { useEffect } from 'react';

import { Box } from '@mui/material';

import { PowerUpList, PowerUpType } from 'components';


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
	isBuyImmunityChecked,
	fetchLeaderboardData
}) => {

	const [showBuffs, setShowBuffs] = buffsState;
	const [showDebuffs, setShowDebuffs] = debuffsState;
	const [seeDetails, setSeeDetails] = detailsState;
	const [selectedPowerUp, setSelectedPowerUp] = powerUpState;

	/**
   * Reset the view of buffs and debuffs when powerup modal is closed
   */
	useEffect(() => {

		if (isOpen) return;
		else if (!isOpen) {
			setShowBuffs(false);
			setShowDebuffs(false);
			setSeeDetails(false);
			setSelectedPowerUp(null);
		}

	}, [isOpen]);

	/**
   * For viewing the details of selected power-up.
   */
	useEffect(() => {
		if(selectedPowerUp == null) return;
		setSeeDetails(true);
	}, [selectedPowerUp]);

	/**
   * Shows the buff list when buff container is clicked.
   */
	const handleClickBuff = () => {
		if( !showBuffs && showDebuffs ) setShowDebuffs(!showDebuffs);
		setShowBuffs(!showBuffs);
		setSelectedPowerUp(null);
		setSeeDetails(false);
	};

	/**
   * Shows the debuff list when debuff container is clicked.
   */
	const handleClickDebuff = () => {
		if( showBuffs && !showDebuffs ) setShowBuffs(!showBuffs);
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
        		width: '400px',
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
        	{ showBuffs ?
        		<PowerUpList
        			type="buff"
        			openDetails={seeDetails}
        			handleClick={(powerup) => { setSelectedPowerUp(powerup); }}
        			handleReturn={handleReturn}
        			selectedPowerUp={selectedPowerUp}
							isBuyImmunityChecked={isBuyImmunityChecked}
							fetchLeaderboardData={fetchLeaderboardData}
        		/> : null
        	}
          
        	{/* Container for Debuffs */}
        	<PowerUpType seePowerups={showDebuffs} label="Debuff" handleClick={handleClickDebuff} />

        	{/* The Debuffs List 
						*		Debuffs cannot be bought when buy immunity is enabled
						*/}
        	{showDebuffs && !isBuyImmunityChecked ?
        		<PowerUpList
        			type="debuff"
        			openDetails={seeDetails}
        			handleClick={(powerup) => { setSelectedPowerUp(powerup); }}
        			handleReturn={handleReturn}
        			selectedPowerUp={selectedPowerUp}
					fetchLeaderboardData={fetchLeaderboardData}
        		/> : null
        	}
        </Box>
			}
		</>
	);
};

export default BuyPowerUpsPopover;