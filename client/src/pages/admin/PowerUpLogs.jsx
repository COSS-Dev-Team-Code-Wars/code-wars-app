/* eslint-disable */ 
import { useEffect, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { Table } from 'components/';
import { columnsPowerUpLog } from 'utils/dummyData';
import { baseURL } from 'utils/constants';
import { getFetch } from 'utils/apiRequest';


const additionalStyles = {
	backgroundColor: '#fff',
};

/**
 * Purpose: Displays the page power-up logs for admin.
 * Params: None
 */
const PowerUpLogs = () => {

	const [powerupLogRow, setPowerupLogRow] = useState([]);

	useEffect(() => { 
		getPowerupLog();
	}, []);

	const getPowerupLog = async () => {
		const res = await getFetch(`${baseURL}/teams/`);

		if(res.success){
			let rowLog = [];
			let count = 0

			res.teams.forEach((team) => {
				team.activated_powerups.forEach((powerup) => {
					const date = new Date(powerup.startTime);
					
					const month = date.toLocaleString('default', { month: 'short' });
					const day = date.getDate().toString().padStart(2,'0');
					
					const hours = date.getHours().toString().padStart(2,'0');
					const minutes = date.getMinutes().toString().padStart(2,'0');
					const seconds = date.getSeconds().toString().padStart(2,'0');
					const milliseconds = date.getMilliseconds().toString().substring(0,2);

					const log = {
						teamName: team.team_name,
						type: powerup.type == 0 ? 'Debuff' : 'Buff',
						powerup: powerup.code === 'immune' ? `${powerup.name} ${powerup.tier}` : powerup.name,
						timestamp: `${month} ${day} - ${hours}:${minutes}:${seconds}.${milliseconds}`,
						recipient: powerup.type == 0 ? powerup.target : team.team_name,
						time: new Date(powerup.startTime).getTime(), // for sorting
					} 

					rowLog.push(log);
				});
			});
			// Sort the rowLog array by the time field
			rowLog.sort((a, b) => b.time - a.time);

			// Add id field representing the index of each element after sorting
			rowLog = rowLog.map((log, index) => ({ ...log, id: index }));

			setPowerupLogRow(rowLog);
		}

	}

	return (
		<Stack spacing={7} sx={{ margin:'4em', width:'100%', height: 'auto'}}>

			{/* Page title */}
			<Box>
				<Typography variant="h4">POWER-UP LOGS</Typography>  
			</Box>

			{/* Table */}
			<Box sx={{ display: 'flex', justifyContent: 'center' }}>
				<Box sx={{ width: '80%' }}>
					<Table
						rows={powerupLogRow}
						columns={columnsPowerUpLog}
						hideFields={[]}
						additionalStyles={additionalStyles}
						pageSizeOptions={[5, 10]}
						pageSize={10}
						autoHeight
						initialState={{
							pagination: { paginationModel: { pageSize: 10 } },
						}}
						// if there are no submission entries yet
						slots={{
							noRowsOverlay: () => (
								<Stack height="100%" alignItems="center" justifyContent="center">
									<Typography><em>No records to display.</em></Typography>
								</Stack>
							)
						}}
					/>
				</Box>
			</Box>
		</Stack>
	);
};

export default PowerUpLogs;