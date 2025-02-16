// dummy data for buffs
// used in poweruplist.jsx component
export const buffs = [
	{
		name: 'Dispel',
		type: 'buff',
		shortDescription:  'dispelled debuff',
		fullDescription: 'The team’s current debuff is dispelled. When more than one debuff types are active, the team can only choose one.',
		Cost: '120% of the cost of the dispelled debuff',
		duration: 5000
	},
	{
		name: 'Immunity I',
		type: 'buff',
		shortDescription:  'Cannot be targeted by any debuff.',
		fullDescription: 'Is decided before the round starts. The team cannot be targeted by any debuff from opposing teams for five (5) minutes since the round starts.',
		Cost: '100 points',
		duration: 5000
	},
	{
		name: 'Immunity II',
		type: 'buff',
		shortDescription:  'Cannot be targeted by any debuff.',
		fullDescription: 'Is decided before the round starts. The team cannot be targeted by any debuff from opposing teams for five (5) minutes since the round starts.',
		Cost: '100 points',
		duration: 5000
	},
	{
		name: 'Immunity III',
		type: 'buff',
		shortDescription:  'Cannot be targeted by any debuff.',
		fullDescription: 'Is decided before the round starts. The team cannot be targeted by any debuff from opposing teams for five (5) minutes since the round starts.',
		Cost: '100 points',
		duration: 5000
	},
	{
		name: 'Immunity IV',
		type: 'buff',
		shortDescription:  'Cannot be targeted by any debuff.',
		fullDescription: 'Is decided before the round starts. The team cannot be targeted by any debuff from opposing teams for five (5) minutes since the round starts.',
		Cost: '100 points',
		duration: 5000
	},
	{
		name: 'Unchain',
		type: 'buff',
		shortDescription:  'Cannot be targeted by any debuff.',
		fullDescription: 'Is decided before the round starts. The team cannot be targeted by any debuff from opposing teams for five (5) minutes since the round starts.',
		Cost: '100 points',
		duration: 5000
	},
];

// dummy data for debuffs
// used in poweruplist.jsx component
export const debuffs = [
	{
		name: 'Stun',
		type: 'debuff',
		fullDescription: 'Target an opposing team, that team would be unable to make changes to their code for two (2) minutes upon its activation.',
		Cost: '100 points',
		duration: '2 minutes'
	},
	{
		name: 'Editor',
		type: 'debuff',
		fullDescription: 'Target an opposing team, that team would be unable to make changes to their code for two (2) minutes upon its activation.',
		Cost: '100 points',
		duration: '2 minutes'
	},
	{
		name: 'Frosty Hands',
		type: 'debuff',
		fullDescription: 'Target an opposing team, that team would be unable to make changes to their code for two (2) minutes upon its activation.',
		Cost: '100 points',
		duration: '2 minutes'
	}
];

// dummy data for list of teams
// used in powerupdetails.jsx component
export const teamsList = [
	'Team1',
	'Team2',
	'Team3',
	'Team4',
	'Team5',
	'Team6',
	'Team7',
	'Team8',
	'Team9',
	'Team10',
];

// options for rounds dropdown select
// used in admin - general options page
export const optionsRounds = [
	'START',
	'EASY',
	'MEDIUM',
	'WAGER',
	'HARD',
];

// options for teams dropdown select
// used in judges - view submissions page
export const optionsTeam = [
	'Team Yeah Yeah',
	'Team Wiwzzz',
	'Team Ooohh',
	'Team One',
	'Team Two',
	'Team Three',
	'Team Four',
	'Team Five',
	'Team Six',
	'Team Seven',
];

// options for problems dropdown select
// used in judges - view submissions page
export const optionsProblems = [
	'Special Calculator',
	'Listing All Addends',
	'BINGO',
	'Hamming distance, interleavings, and isomorphic',
	'The "Without" Problems',
	'Figuring Patterns',
	'Recursive Shifting',
	'Sudoku Validator',
	'Figure Output Pattern',
	'Roman Numeral Calculator',
];

// problem list columns
// used in participants - view all problems page
export const columnsProblems = [
	{
		field: 'id',
		headerName: '#',
		minWidth: 60,
		maxWidth: 100,
		headerAlign: 'center',
		align: 'center',
		flex: 1,
	},
	{
		field: 'problemTitle',
		headerName: 'Problem Title',
		minWidth: 220,
		// maxWidth: 500,
		flex: 1,
	},
	{
		field: 'status',
		headerName: 'Last Evaluation',
		minWidth: 190,
		// maxWidth: 200,
		flex: 1,
	},
	{
		field: 'score',
		headerName: 'Max Score Achieved',
		minWidth: 240,
		//maxWidth: 200,
		headerAlign: 'left',
		align: 'left',
		flex: 1,
	},
	{
		field: 'checkedBy',
		headerName: 'Checked By',
		minWidth: 200,
		// maxWidth: 250,
		flex: 1,
	},
];

// problem list rows
// used in participants - view all problems page
export const rowsProblems = [
	{ id: 1, problemTitle: 'Special Calculator', status: 'Pending', score: 0/200, checkedBy: 'Sir Hermocilla'},
	{ id: 2, problemTitle: 'Listing All Addends', status: 'Checked', score: 0/400, checkedBy: 'Sir Isungga'},
	{ id: 3, problemTitle: 'BINGO', status: 'Checked', score: 0/400, checkedBy: 'Sir Doria'},
	{ id: 4, problemTitle: 'Hamming distance, interleavings, and isomorphic', status: 'Pending', score: 500/500, checkedBy: 'Sir Hermocilla'},
	{ id: 5, problemTitle: 'The "Without" Problems', status: 'Error', score: 300/700, checkedBy: 'Sir Isungga' },
	{ id: 6, problemTitle: 'Figuring Patterns', status: 'Error', score: 0/1000, checkedBy: 'Sir Doria' },
	{ id: 7, problemTitle: 'Recursive Shifting', status: 'Checked', score: 0/2800, checkedBy: 'Sir Hermocilla'},
	{ id: 8, problemTitle: 'Sudoku Validator', status: 'Pending', score: 0/5500, checkedBy: 'Sir Isungga'},
	{ id: 9, problemTitle: 'Figure Output Pattern', status: 'Pending', score: 0/600, checkedBy: 'Sir Doria' },
	{ id: 10, problemTitle: 'Roman Numeral Calculator', status: 'Pending', score: 0/700, checkedBy: 'Sir Hermocilla'},

	{ id: 11, problemTitle: 'Special Calculator', status: 'Pending', score: 0/200, checkedBy: 'Sir Hermocilla'},
	{ id: 12, problemTitle: 'Listing All Addends', status: 'Checked', score: 0/400, checkedBy: 'Sir Isungga'},
	{ id: 13, problemTitle: 'BINGO', status: 'Checked', score: 0/400, checkedBy: 'Sir Doria'},
	{ id: 14, problemTitle: 'Hamming distance, interleavings, and isomorphic', status: 'Pending', score: 500/500, checkedBy: 'Sir Hermocilla'},
	{ id: 15, problemTitle: 'The "Without" Problems', status: 'Error', score: 300/700, checkedBy: 'Sir Isungga' },
	{ id: 16, problemTitle: 'Figuring Patterns', status: 'Error', score: 0/1000, checkedBy: 'Sir Doria' },
	{ id: 17, problemTitle: 'Recursive Shifting', status: 'Checked', score: 0/2800, checkedBy: 'Sir Hermocilla'},
];

// options for evaluation of judges
// used in judges - view submissions page
export const optionsEval = [
	'Correct',
	'Partially Correct',
	'Incorrect Solution',
	'Error',
	'Pending'
];

export const optionsEvalWager = [
	'Correct',
	'Incorrect Solution',
	'Error',
	'Pending'
];



// columns for submissions table
// used in judges - view submissions page
export const columnsSubmissions = [
	{
		field: 'id',
		headerName: 'ID',
		width: 75,
	},
	{
		field: 'teamName',
		headerName: 'Team Name',
		minWidth: 250,
		// flex: 1,
	},
	{
		field: 'problemTitle',
		headerName: 'Problem Title',
		minWidth: 300,
		// maxWidth: 500,
		// flex: 1,
	},
	{
		field: 'submittedAt',
		headerName: 'Submitted At',
		minWidth: 200,
		// maxWidth: 200,
		// flex: 1,
	},
	{
		field: 'uploadedFile',
		headerName: 'Uploaded File',
		minWidth: 250,
		// maxWidth: 200,
		headerAlign: 'left',
		align: 'left',
		// flex: 1,
	},
	{
		field: 'runTests',
		headerName: 'Test Cases',
		minWidth: 200,
	},
	{
		field: 'evaluation',
		headerName: 'Evaluation',
		minWidth: 250,
		// maxWidth: 250,
		// flex: 1,

		// type: 'singleSelect',
		// width: 120,
		editable: true,
		valueOptions: optionsEval
	},
	{
		field: 'checkedBy',
		headerName: 'Judge',
		minWidth: 265,
		// maxWidth: 250,
		// flex: 1,
	},
];

// submission entries rows
export const rowsSubmissions = [
	{ id: 0,teamName: 'Team Yeah Yeah', problemTitle: 'Special Calculator', submittedAt: '09:55:01', uploadedFile: 'filename.txt', evaluation: '', checkedBy: 'Sir Hermocilla'},
	{ id: 1,teamName: 'Team Wiwzzz', problemTitle: 'Listing All Addends', submittedAt: '09:48:55', uploadedFile: 'filename.txt', evaluation: '', checkedBy: 'Sir Isungga'},
	{ id: 2,teamName: 'Team Ooohh', problemTitle: 'BINGO', submittedAt: '09:45:08', uploadedFile: 'filename.txt', evaluation: '', checkedBy: 'Sir Doria'},
	{ id: 3,teamName: 'Team One', problemTitle: 'Hamming distance, interleavings, and isomorphic', submittedAt: '09:37:44', uploadedFile: 'filename.txt', evaluation: '', checkedBy: 'Sir Hermocilla'},
	{ id: 4,teamName: 'Team Two', problemTitle: 'The "Without" Problems', submittedAt: '09:33:04', uploadedFile: 'filename.txt', evaluation: '', checkedBy: 'Sir Isungga' },
	{ id: 5,teamName: 'Team Three', problemTitle: 'Figuring Patterns', submittedAt: '09:30:15', uploadedFile: 'filename.txt', evaluation: '', checkedBy: 'Sir Doria' },
	{ id: 6,teamName: 'Team Four', problemTitle: 'Recursive Shifting', submittedAt: '09:10:45', uploadedFile: 'filename.txt', evaluation: '', checkedBy: 'Sir Hermocilla'},
	{ id: 7,teamName: 'Team Five', problemTitle: 'Sudoku Validator', submittedAt: '09:10:45', uploadedFile: 'filename.txt', evaluation: '', checkedBy: 'Sir Isungga'},
	{ id: 8,teamName: 'Team Six', problemTitle: 'Figure Output Pattern', submittedAt: '09:00:27', uploadedFile: 'filename.txt', evaluation: '', checkedBy: 'Sir Doria' },
	{ id: 9,teamName: 'Team Seven', problemTitle: 'Roman Numeral Calculator', submittedAt: '09:00:15', uploadedFile: 'filename.txt', evaluation: '', checkedBy: 'Sir Hermocilla'},
];

// leaderboard columns
// used in:
// admin - general options page
// judges - view submissions page
// participants - view all problems page
export const columnsLeaderboard = [
	{
		field: 'rank',
		headerName: 'Rank',
		minWidth: 60,
		maxWidth: 100,
		headerAlign: 'center',
		align: 'center',
		flex: 1,
	},
	{
		field: 'team_name',
		headerName: 'Team Name',
		minWidth: 200,
		// maxWidth: 300,
		flex: 1,
	},
	{
		field: 'score',
		headerName: 'Score',
		minWidth: 150,
		// maxWidth: 200,
		flex: 1,
	},
	{
		field: 'total_points_used',
		headerName: 'Total Spent',
		minWidth: 180,
		headerAlign: 'left',
		align: 'left',
		flex: 1,
	},
];

// only for admin - timer page
export const columnsLeaderboardAdmin = [
	{
		field: 'rank',
		headerName: 'Rank',
		minWidth: 130,
		// maxWidth: 100,
		headerAlign: 'center',
		align: 'center',
		flex: 1,
	},
	{
		field: 'team_name',
		headerName: 'Team Name',
		minWidth: 250,
		// maxWidth: 300,
		flex: 1,
	},
	{
		field: 'score',
		headerName: 'Score',
		minWidth: 180,
		// maxWidth: 200,
		flex: 1,
	},
	{
		field: 'total_points_used',
		headerName: 'Total Spent',
		minWidth: 180,
		headerAlign: 'left',
		align: 'left',
		flex: 1,
	},
];

// leaderboard rows
// replaced with getLeaderboard.js
export const rowsLeaderboard = [
	{ id: 1, rank: 1, team_name: 'Team One', score: 0/200, total_points_used: 1500},
	{ id: 2, rank: 2, team_name: 'Team Two', score: 0/400, total_points_used: 1300},
	{ id: 3, rank: 3, team_name: 'Team Three', score: 0/400, total_points_used: 1800},
	{ id: 4, rank: 4, team_name: 'Team Four', score: 500/500, total_points_used: 1000},
	{ id: 5, rank: 5, team_name: 'Team Five', score: 300/700, total_points_used: 650},
	{ id: 6, rank: 6, team_name: 'Team Six', score: 0/1000, total_points_used: 800},
	{ id: 7, rank: 7, team_name: 'Team Seven', score: 0 / 2800, total_points_used: 750 },
	{ id: 8, rank: 8, team_name: 'Team Five', score: 300/700, total_points_used: 650},
	{ id: 9, rank: 9, team_name: 'Team Six', score: 0/1000, total_points_used: 800},
	{ id: 10, rank: 10, team_name: 'Team Seven', score: 0/2800, total_points_used: 750},
];


// columns for power-up logs
// used in admin - power-up logs page
export const columnsPowerUpLog = [
	{
		field: 'id',
		headerName: 'ID',
		minWidth: 60,
		maxWidth: 100,
		headerAlign: 'center',
		align: 'center',
		flex: 1,
	},
	{
		field: 'teamName',
		headerName: 'Team Name',
		minWidth: 300,
		flex: 1,
	},
	{
		field: 'type',
		headerName: 'Type',
		minWidth: 75,
		flex: 1,
	},
	{
		field: 'powerup',
		headerName: 'Power-Up',
		minWidth: 150,
		// maxWidth: 200,
		flex: 1,
	},
	{
		field: 'timestamp',
		headerName: 'Timestamp',
		minWidth: 100,
		maxWidth: 200,
		headerAlign: 'left',
		align: 'left',
		flex: 1,
	},
	{
		field: 'recipient',
		headerName: 'Recipient',
		minWidth: 200,
		// maxWidth: 250,
		flex: 1,
	}
];

// rows for power-up logs
// used in admin - power-up logs page
export const rowsPowerUpLog = [
	{ id: 0,teamName: 'Team Yeah Yeah', type: 'Buff', powerup:'Dispel', timestamp: '09:55:01', recipient: 'Team One'},
	{ id: 1,teamName: 'Team Wiwzzz', type: 'Buff', powerup:'Immunity', timestamp: '09:48:55', recipient: 'Team Two'},
	{ id: 2,teamName: 'Team Ooohh', type: 'Debuff', powerup:'Stun', timestamp: '09:45:08', recipient: 'Team One'},
	{ id: 3,teamName: 'Team One', type: 'Buff', powerup:'Dispel', timestamp: '09:37:44', recipient: 'Team Three'},
	{ id: 4,teamName: 'Team Two', type: 'Debuff', powerup:'Stun', timestamp: '09:33:04', recipient: 'Team Seven'},
	{ id: 5,teamName: 'Team Three', type: 'Debuff', powerup:'Stun', timestamp: '09:30:15', recipient: 'Team Five'},
	{ id: 6,teamName: 'Team Four', type: 'Debuff', powerup:'Editor', timestamp: '09:10:45', recipient: 'Team Ten'},
	{ id: 7,teamName: 'Team Five', type: 'Buff', powerup:'Dispel', timestamp: '09:10:45', recipient: 'Team Ten'},
	{ id: 8,teamName: 'Team Six', type: 'Buff', powerup:'Stun', timestamp: '09:00:27', recipient: 'Team Nine'},
	{ id: 9,teamName: 'Team Seven', type: 'Debuff', powerup:'Editor', timestamp: '09:00:15', recipient: 'Team Four'},
];