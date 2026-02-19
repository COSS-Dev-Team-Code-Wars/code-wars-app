/* eslint-disable */
import './LeaderboardTable.css';

/**
 * Purpose: Reusable modern leaderboard table.
 * Props:
 *   rows – array of { rank, team_name, score, total_points_used }
 *   showSpent – boolean, whether to show the "Total Spent" column (default true)
 */
const LeaderboardTable = ({ rows = [], showSpent = true }) => {
    if (rows.length === 0) {
        return (
            <div className="lb-table">
                <div className="lb-table__empty">No records to display.</div>
            </div>
        );
    }

    return (
        <div className="lb-table">
            {/* Header */}
            <div className="lb-table__head">
                <div className="lb-table__head-cell lb-table__head-cell--center">Rank</div>
                <div className="lb-table__head-cell">Team</div>
                <div className="lb-table__head-cell lb-table__head-cell--right">Score</div>
                {showSpent && (
                    <div className="lb-table__head-cell lb-table__head-cell--right">Spent</div>
                )}
            </div>

            {/* Rows */}
            <div className="lb-table__body">
                {rows.map((row, idx) => {
                    const rank = row.rank ?? idx + 1;
                    const isTop = rank <= 3;
                    return (
                        <div
                            key={row.id ?? idx}
                            className={[
                                'lb-row',
                                isTop ? 'lb-row--top' : '',
                                isTop ? `lb-row--rank-${rank}` : '',
                            ].join(' ')}
                            style={{ animationDelay: `${idx * 0.03}s` }}
                        >
                            {/* Rank */}
                            <div className="lb-cell lb-cell--rank">
                                <span className="lb-rank-badge">{rank}</span>
                            </div>

                            {/* Team name */}
                            <div className="lb-cell lb-cell--name" title={row.team_name}>
                                {row.team_name}
                            </div>

                            {/* Score */}
                            <div className="lb-cell lb-cell--score">
                                {row.score ?? 0}
                            </div>

                            {/* Total spent */}
                            {showSpent && (
                                <div className="lb-cell lb-cell--spent">
                                    {row.total_points_used ?? 0}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LeaderboardTable;
