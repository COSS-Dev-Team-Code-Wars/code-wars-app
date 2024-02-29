/* eslint-disable */ 
import { useState, useRef } from 'react';

import PendingActionsIcon from '@mui/icons-material/PendingActions';
import SourceIcon from '@mui/icons-material/Source';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { SuccessWindow } from 'components';

import { baseURL } from 'utils/constants';
import { postFetch } from 'utils/apiRequest';
import { ErrorWindow } from 'components';

const  SubmitModal = ({ 
	setOpen,
	problemId,
	problemTitle,
	possiblePoints,
	totalCases
 }) => {
	/**
   * State handler for the team's uploaded file.
   */
	const [file, setFile] = useState(null);
	const [content, setContent] = useState(null);
	const [filename, setFilename] = useState(null);
	const alreadySubmitted = useRef(false);

	// for navigation (temporary only)
	const navigate = useNavigate();

	/**
   * Purpose: Allows the file to be dropped in the designated area. Set the current file to the drop file  
   * Params: <Event> event - current event
   */
	const handleDrop = (event) => {
		event.preventDefault();
		const droppedFile = event.dataTransfer.files[0];
		setFile(droppedFile);
	};

	/**
   * Purpose: Called when the BROWSE BUTTON is clicked. Set the uploaded file
   * Params: <Event> event - current event
   */
	const handleFileInputChange = (event) => {
		const selectedFile = event.target.files[0];
		
		const reader = new FileReader();
		reader.onload = function() {
			setFile(selectedFile);
			setContent(reader.result);
			setFilename(selectedFile.name);
		};
		reader.readAsText(selectedFile);
	};

	/**
   * Purpose: Allows the file to be dragged on designated area. Prvent the browser from opening the file 
   * Params: <Event> event - current event
   */
	const handleDragOver = (event) => {
		event.preventDefault();
	};

	/**
   * Purpose: Handles submission of uploaded file.
   * Params: <Event> event - current event
   */
	const handleSubmit = async () => { 
		// close submit button modal window
		setOpen(false);

		if (!alreadySubmitted.current) {
		alreadySubmitted.current = true;
		let uResponse = await postFetch(`${baseURL}/uploadsubmission`, {
			filename,
			content,
			problemId,
			problemTitle,
			possiblePoints,
			"teamId": JSON.parse(localStorage.getItem("user"))._id,
			"teamName": JSON.parse(localStorage.getItem("user")).username,
			totalCases
		})
    
		if (uResponse.success) {
			// fire success window
			SuccessWindow.fire({
				text: 'Successfully submitted file!',
				html:
				'<p>You may submit a new file for this problem once the previous file has been graded.</p>'
			});
		} else {
			// fire error window
			ErrorWindow.fire({
				title: 'Error!',
				text: 'Upload submission has failed. Please try and submit the file again.'
			})
		}

		// navigate to view all problems page
		// pwede to tanggalin once na maimplement na yung sa websockets ng checking submission
		navigate('/participant/view-all-problems');
		}
	};

	return (
		<Box>
			{/* Container for the dropdown box */}
			<Box 
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				sx={{ 
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					marginBottom: '10px',
				}}
			>
				{
					// If there is an uploaded file
					file ? (
					// dropdown box
						<Box
							sx={{ 
								border: '3px dashed',
								borderRadius: '10px', 
								height: '100px',
								width: '90%', 
								borderColor: 'rgba(64, 64, 64, 0.5)',
								display: 'flex',
								flexDirection: 'rows',
								justifyContent: 'space-between',
								alignItems: 'center',
								paddingX: 3,
								marginTop: 3,
							}}
						>
							{/* Container for file name and file icon */}
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'rows',
									alignItems: 'center',
									gap: 2,
								}}
							>
								<SourceIcon sx={{ height: 33, width: 33, color: 'rgba(0, 0, 0, 0.5)' }} />
								<Typography
									variant="body1"
									sx={{
										color: 'rgba(0, 0, 0, 0.5)',
										fontSize: '16px'
									}}
								>
									{file.name}
								</Typography>
							</Box>

							{/* Container for the status of the uploaded file*/}
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'rows',
									alignItems: 'center',
									gap: 1
								}}
							>
								<Typography
									variant="body1"
									sx={{
										color: 'rgba(0, 0, 0, 0.5)',
										fontSize: '16px', 
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap'
									}}
								>
                  Uploaded
								</Typography>
								<PendingActionsIcon
									sx={{
										height: 23,
										width: 23,
										color: 'rgba(0, 0, 0, 0.5)',
									}}
								/>
							</Box>
						</Box>
					) 
						: 
					// No file uploaded
						(
					// dropdown box
							<Box
								sx={{ 
									border: '3px dashed',
									borderRadius: '10px', 
									height: '250px',
									width: '90%', 
									borderColor: 'rgba(64, 64, 64, 0.5)',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center',
									marginTop: 3,
								}}
							>
								{/* Container for the Drag and Drop title and file icon*/}
								<SourceIcon sx={{ height: 80, width: 80, color: 'rgba(0, 0, 0, 0.3)' }} />
								<Typography
									id="transition-modal-title"
									variant="h6"
									component="h6"
									sx={{ color: 'rgba(0, 0, 0, 0.3)', fontSize: '18px' }}
								>
                Drag and Drop Here
								</Typography>    
							</Box>
						)
				}
			</Box>
      
			{/* Container for the buttons for browsing files and submitting */}
			<Box
				sx={{
					display: 'flex',
					gap: 4,
					flexDirection: 'rows',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				{/* Button for browsing files */}
				<label htmlFor="icon-button-file">
					<Button 
						variant="contained" 
						component="span"
						sx={{
							width: '200px',
							height: '50px',
							marginTop: '20px',
							bgcolor: 'primary.main',
						}}
					>
              Browse
					</Button>
					<input
						type="file"
						id="icon-button-file"
						accept=".py,.c"
						style={{ display: 'none' }}
						onChange={handleFileInputChange}
					/>
				</label>

				{/* Submit button */}
				<Button 
					type="submit"
					variant="contained" 
					disabled={file? false : true}
					onClick={handleSubmit}
					sx={{
						width: '200px',
						height: '50px',
						marginTop: '20px',
						bgcolor: 'secondary.main',
						'&:hover': {
							bgcolor: '#7a213b'
						},
						'&:disabled': {
							bgcolor: 'secondary.light',
							color: '#fff'
						}
					}}
				>
					Submit
				</Button>
			</Box>
		</Box>
	);
};

export default SubmitModal;