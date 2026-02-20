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
	const { problemDesc, sampleTestCases, fetchContent } = useOutletContext();

	useEffect(() => {
		fetchContent();
	}, []);
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "25px", justifyContent: "space-between", minHeight: "100%", width: "100%", padding: "20px 40px 20px 0px" }}>
			<div style={{ display: "flex", flexDirection: "column", gap: "10px", overflow: "hidden", flex: "0 1 auto" }}>
				<Typography variant="h5" color="white.main" sx={{ fontFamily: "Poppins" }}>
					Description
				</Typography>
				<Box sx={{ padding: 3, borderRadius: 4, backgroundColor: "#fff", maxHeight: "400px" }} style={{ display: "flex", flexDirection: "column", overflowY: "auto" }}>
					<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
						<Typography
							variant="body1"
							paragraph
							style={{ margin: "0", whiteSpace: "pre-wrap" }}
						>
							{problemDesc}
						</Typography>
					</div>
				</Box>
			</div>
			<CodeEditor />
		</div>
	);
};

export default ViewSpecificProblemPage;