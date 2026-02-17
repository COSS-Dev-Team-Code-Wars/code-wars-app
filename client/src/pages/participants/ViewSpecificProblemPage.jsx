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
		<div style={{ display: "flex", flexDirection: "column", gap: "25px", justifyContent: "space-between", height: "100%", width: "100%", padding: "20px 40px 20px 0px" }}>
			<div style={{ display: "flex", flexDirection: "column", gap: "10px", overflow: "hidden" }}>
				<Typography variant="h5" color="white.main" sx={{ fontFamily: "Poppins" }}>
					Description
				</Typography>
				<Box sx={{ padding: 3, borderRadius: 4, backgroundColor: "#fff" }} style={{ display: "flex", flexDirection: "column", overflowY: "hidden" }}>
					<div style={{ display: "flex", flexDirection: "column", gap: "10px", overflow: "auto" }}>
						<Typography
							variant="body1"
							paragraph
							style={{ margin: "0", whiteSpace: "pre-wrap" }}
						>
							{problemDesc}
						</Typography>

						{/* Sample Inputs and Outputs */}
						{sampleTestCases && sampleTestCases.length > 0 && (
							<div style={{ marginTop: "10px" }}>
								<Typography variant="subtitle1" style={{ fontWeight: "bold", marginBottom: "8px" }}>

								</Typography>
								{sampleTestCases.map((tc, index) => (
									<div key={index} style={{ marginBottom: "12px" }}>
										<Typography variant="body2" style={{ fontWeight: "bold" }}>
											Sample Input {sampleTestCases.length > 1 ? `#${index + 1}` : ""}:
										</Typography>
										<pre style={{
											backgroundColor: "#f5f5f5",
											padding: "8px 12px",
											borderRadius: "4px",
											fontFamily: "monospace",
											fontSize: "0.875rem",
											margin: "4px 0 8px 0",
											whiteSpace: "pre-wrap",
											overflowX: "auto",
										}}>
											{tc.input?.replace(/\\n/g, "\n")}
										</pre>
										<Typography variant="body2" style={{ fontWeight: "bold" }}>
											Sample Output {sampleTestCases.length > 1 ? `#${index + 1}` : ""}:
										</Typography>
										<pre style={{
											backgroundColor: "#f5f5f5",
											padding: "8px 12px",
											borderRadius: "4px",
											fontFamily: "monospace",
											fontSize: "0.875rem",
											margin: "4px 0 0 0",
											whiteSpace: "pre-wrap",
											overflowX: "auto",
										}}>
											{tc.expected_output?.replace(/\\n/g, "\n")}
										</pre>
									</div>
								))}
							</div>
						)}
					</div>
				</Box>
			</div>
			<CodeEditor />
		</div>
	);
};

export default ViewSpecificProblemPage;