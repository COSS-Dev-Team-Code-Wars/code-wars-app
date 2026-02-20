/* eslint-disable */
import { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useOutletContext } from "react-router-dom";
import CodeEditor from "components/widgets/code-editor/CodeEditor";

/**
 * Purpose: Displays the Specific Problem Page for participants.
 */
const ViewSpecificProblemPage = () => {
	/**
	 * Consuming context needed for the page
	 */
	const { problemDesc, sampleTestCases, fetchContent, teamInfo } = useOutletContext();
	useEffect(() => {
		fetchContent();
	}, []);	return (
		<Box 
			sx={{ 
				display: "flex", 
				flexDirection: "column", 
				gap: "25px", 
				minHeight: "100%", 
				width: "100%", 
				maxWidth: "100%",
				overflowY: "auto",
				overflowX: "hidden",
				boxSizing: "border-box",
				padding: { 
					xs: "15px 20px 15px 20px",  // mobile
					sm: "20px 30px 20px 20px",   // small tablets
					md: "20px 40px 20px 30px",   // medium screens
					lg: "20px 40px 20px 20px"     // large screens
				}
			}}		>
			{/* Header section with Description title and Current Score */}
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
				<Typography variant="h5" color="white.main" sx={{ fontFamily: "Poppins" }}>
					Description
				</Typography>
				
				{/* Team Score - matching ViewAllProblemsPage style */}
				<Typography
					sx={{
						color: '#fff',
						display: 'flex',
						fontSize: { xs: '1rem', lg: '1.15rem' },
						alignItems: 'center',
					}}
				>
					<Box sx={{ display: 'flex', gap: 2 }}>
						<span style={{ fontWeight: '500' }}>Current Score:</span>
						<span style={{ fontWeight: '300' }}>{teamInfo?.score || 0}</span>
					</Box>
				</Typography>			</Box>

		<Box 
			sx={{ 
				padding: 3, 
				borderRadius: 4, 
				backgroundColor: "#fff", 
				height: "400px",
				minHeight: "150px",
				width: "100%", 
				maxWidth: "100%", 
				boxSizing: "border-box",
				overflow: "auto",
				resize: "vertical"
			}}
		>
			<Typography
				variant="body1"
				paragraph
				style={{ margin: "0", whiteSpace: "pre-wrap", wordWrap: "break-word", overflowWrap: "break-word" }}
			>
				{problemDesc}
			</Typography>
		</Box>
		
		<CodeEditor />
		</Box>
	);
};

export default ViewSpecificProblemPage;