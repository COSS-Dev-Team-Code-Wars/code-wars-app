/* eslint-disable */
import { Backdrop, Fade, Modal } from '@mui/material';
import LeaderboardTable from './LeaderboardTable';
import './LeaderboardModal.css';

/**
 * Purpose: Reusable leaderboard modal widget.
 * Props:
 *   isOpen    – boolean
 *   setOpen   – state setter
 *   rows      – array of { rank, team_name, score, total_points_used }
 *   showSpent – boolean, show "Total Spent" column (default true)
 */
const LeaderboardModal = ({ isOpen, setOpen, rows = [], showSpent = true }) => {
    const handleClose = () => setOpen(false);

    return (
        <Modal
            open={isOpen}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{ backdrop: { timeout: 400 } }}
        >
            <Fade in={isOpen}>
                <div className="lb-modal__box">

                    {/* Header */}
                    <div className="lb-modal__header">
                        <div className="lb-modal__header-left">
                            <span className="lb-modal__title">Leaderboard</span>
                            {rows.length > 0 && (
                                <span className="lb-modal__count">{rows.length} teams</span>
                            )}
                        </div>
                        <button
                            className="lb-modal__close"
                            onClick={handleClose}
                            type="button"
                            aria-label="Close leaderboard"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="lb-modal__body">
                        <LeaderboardTable rows={rows} showSpent={showSpent} />
                    </div>

                </div>
            </Fade>
        </Modal>
    );
};

export default LeaderboardModal;
