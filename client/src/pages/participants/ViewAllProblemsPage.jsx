/* eslint-disable */
import { useEffect, useState, useMemo } from 'react';

import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import {
	Button,
	Box,
	Stack,
	Typography,
} from '@mui/material';
import { useNavigate, createSearchParams, useOutletContext } from 'react-router-dom';
import { AllCommunityModule, themeQuartz, colorSchemeLight } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

/* Clean white AG Grid theme */
const gridTheme = themeQuartz.withPart(colorSchemeLight).withParams({
	backgroundColor: "#ffffff",
	foregroundColor: "#333333",
	headerBackgroundColor: "#fafafa",
	headerFontWeight: 700,
	headerTextColor: "#707070",
	oddRowBackgroundColor: "#fafafa",
	rowHoverColor: "rgba(0, 0, 0, 0.04)",
	borderColor: "rgba(0, 0, 0, 0.07)",
	accentColor: "#1976d2",
	fontSize: 14,
	headerFontSize: 13,
	spacing: 8,
	wrapperBorderRadius: 10,
	columnBorder: false,
});

/**
 * Purpose: Displays the View All Problems Page for participants.
 */
const ViewAllProblemsPage = ({ currRound }) => {
	/**
	 * Consuming context needed for the page
	 */
	const {
		teamInfo,
		setTeamInfo,
		currQuestions,
		getRoundQuestions
	} = useOutletContext();

	// options for round labels
	const rounds = ['EASY', 'MEDIUM', 'WAGER', 'HARD'];
	// used for client-side routing to other pages
	const navigate = useNavigate();

	useEffect(() => {
		// Pass currRound explicitly so getRoundQuestions always receives the current
		// round value. React fires child effects before parent effects, so relying on
		// currRoundRef (updated in the parent effect) would read a stale 'start' value.
		getRoundQuestions(currRound);
	}, [currRound]);

	/**
	 * Column Definitions for AG Grid
	 */
	const columnDefs = useMemo(() => [
		{
			field: "id",
			headerName: "#",
			width: 60,
			sortable: true,
			cellStyle: { display: 'flex', alignItems: 'center' }
		},
		{
			field: "problemTitle",
			headerName: "Problem Title",
			flex: 1,
			sortable: true,
			filter: true,
			cellStyle: { display: 'flex', alignItems: 'center', fontWeight: 500 }
		},
		{
			headerName: "Last Evaluation",
			width: 150,
			valueGetter: (p) => p.data.evaluation || "No Submission",
			cellRenderer: (params) => {
				const status = params.value;
				let color = "#707070";
				let bgcolor = "transparent";

				if (status === "Correct") {
					color = "#1b5e20";
					bgcolor = "#e8f5e9";
				}
				else if (status === "Incorrect") {
					color = "#c62828";
					bgcolor = "#ffebee";
				}
				else if (status === "Partially Correct") {
					color = "#e65100";
					bgcolor = "#fff3e0";
				}
				else if (status === "Pending") {
					color = "#01579b";
					bgcolor = "#e1f5fe";
				}

				return (
					<div style={{
						display: 'flex',
						alignItems: 'center',
						height: '100%'
					}}>
						<span style={{
							color,
							backgroundColor: bgcolor,
							padding: '4px 8px',
							borderRadius: '4px',
							fontSize: '0.85rem',
							fontWeight: 600,
							lineHeight: 1
						}}>
							{status}
						</span>
					</div>
				);
			}
		},
		{
			headerName: "Max Score Achieved",
			width: 180,
			valueGetter: (p) => p.data.score || 0,
			sortable: true,
			cellStyle: { display: 'flex', alignItems: 'center' }
		},
		{
			headerName: "Checked By",
			width: 150,
			valueGetter: (p) => p.data.checkedby || "Unassigned",
			cellStyle: { display: 'flex', alignItems: 'center', color: '#666' }
		}
	], []);

	const defaultColDef = useMemo(() => ({
		resizable: false,
		suppressMovable: true,
	}), []);


	/**
   * Purpose: Handles opening of leaderboard modal window upon clicking the ellipsis button.
   */
	const handleRowClick = (event) => {
		const data = event.data;
		console.log("Row Click Data:", data); // Debugging
		// map generic fields to what ViewSpecificProblemPage expects
		let customParams = {
			checkedBy: data.checkedby || "Unassigned",
			id: data.dbId, // dbId
			problemTitle: data.title,
			score: data.score || 0,
			status: data.evaluation || "No Submission"
		};

		navigate({
			pathname: '/participant/view-specific-problem',
			search: createSearchParams(customParams).toString()
		});
	};

	return (
		<Box
			sx={{
				display: 'flex',
				width: '100%',
				minHeight: '100%',
				paddingBottom: "20px",
				alignContent: { xs: 'center', md: 'none' },
				justifyContent: { xs: 'center', md: 'none' }
			}}
		>
			{/* Full Desktop View for round buttons and problem table */}
			<Stack
				spacing={5}
				sx={{
					px: { xs: 8, xl: 0 },
					mx: { xs: 5, xl: 0 },
					mt: { xs: 0, xl: 6 },
					pr: { xl: 7 },
					width: { xs: '100%' },
				}}
			>

				{/* Container for round buttons and team name + score */}
				<Box
					sx={{
						px: { xs: '3em', xl: '0' },
						display: 'flex',
						flexDirection: { xs: 'column', md: 'row' },
						justifyContent: { sx: 'initial', md: 'space-between' },
						gap: 4
					}}
				>
					{/* Round buttons */}
					<Box sx={{ display: 'flex', gap: 3, height: '70%', alignSelf: 'center' }}>
						{rounds.map((round, idx) =>
							<Button
								key={idx}
								variant="contained"
								startIcon={currRound === round ? <LockOpenIcon /> : <LockIcon />}
								disabled={currRound === round ? false : true}
								size="large"
								sx={{
									fontFamily: 'Poppins',
									fontWeight: '600',
									minWidth: 125,
									gap: 0.5,
									bgcolor: 'major.main',
									'&:hover': {
										bgcolor: 'major.light',
										color: 'general.main',
									},
									'&:disabled': {
										bgcolor: 'major.light',
										color: '#fff'
									}
								}}
							>
								{round}
							</Button>
						)}
					</Box>

					{/* Team Name and Team Score */}
					<Typography
						sx={{
							gap: { xs: 10, md: 1 },
							color: '#fff',
							display: 'flex',
							fontSize: { xs: '1rem', lg: '1.15rem' },
							flexDirection: { xs: 'row', md: 'column' },
							alignItems: { xs: 'center', md: 'end' },
							justifyContent: { xs: 'center', md: 'initial' },
						}}
					>
						<Box sx={{ display: 'flex', gap: 2 }}>
							<span style={{ fontWeight: '500' }}>Team Name:</span>
							<span style={{ fontWeight: '300' }}>{teamInfo.teamName}</span>
						</Box>
						<Box sx={{ display: 'flex', gap: 2 }}>
							<span style={{ fontWeight: '500' }}>Current Score:</span>
							<span style={{ fontWeight: '300' }}>{teamInfo.score}</span>
						</Box>
					</Typography>
				</Box>

				{/* Problem List Table (AG Grid) */}
				<Box
					sx={{
						height: 650,
						width: '100%',
					}}
				>
					<AgGridReact
						rowData={currQuestions}
						columnDefs={columnDefs}
						defaultColDef={defaultColDef}
						theme={gridTheme}
						modules={[AllCommunityModule]}
						onRowClicked={handleRowClick}
						getRowId={(params) => String(params.data.dbId)}
						rowSelection="single"
						pagination={true}
						paginationPageSize={10}					paginationPageSizeSelector={[10, 20, 50, 100]}						excludeChildrenWhenTreeDataFiltering={true}
						overlayNoRowsTemplate={
							`<span style="padding: 10px; color: #707070;">No questions available for this round yet.</span>`
						}
					/>
				</Box>
			</Stack>
		</Box>
	);
};

export default ViewAllProblemsPage;