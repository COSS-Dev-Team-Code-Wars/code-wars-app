/* eslint-disable */
import { Backdrop, Fade, Modal } from '@mui/material';
import './AnnouncementModal.css';

/**
 * Purpose: Reusable announcement modal widget.
 * Props:
 *   isOpen        – boolean, whether the modal is visible
 *   setOpen       – state setter to close the modal
 *   announcements – array of { message: string, time: string }
 */
const AnnouncementModal = ({ isOpen, setOpen, announcements = [] }) => {
    const handleClose = () => setOpen(false);

    return (
        <Modal
            open={isOpen}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{ backdrop: { timeout: 400 } }}
        >
            <Fade in={isOpen}>
                <div className="ann-modal__box">

                    {/* ── Header (pinned) ── */}
                    <div className="ann-modal__header">
                        <div className="ann-modal__header-left">
                            <span className="ann-modal__title">Announcements</span>
                        </div>

                        <button className="ann-modal__close" onClick={handleClose} type="button" aria-label="Close announcements">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {/* ── Scrollable body ── */}
                    <div className="ann-modal__body">
                        {announcements.length > 0 ? (
                            <div className="ann-modal__feed">
                                {[...announcements].reverse().map((item, index) => (
                                    <div className="ann-card" key={index} style={{ animationDelay: `${index * 0.05}s` }}>
                                        <div className="ann-card__accent" />
                                        <div className="ann-card__body">
                                            <p className="ann-card__message">{item.message}</p>
                                            {item.time && (
                                                <span className="ann-card__meta">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <polyline points="12 6 12 12 16 14" />
                                                    </svg>
                                                    {item.time}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="ann-modal__empty">
                                <div className="ann-modal__empty-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M13.73 21a2 2 0 01-3.46 0" />
                                        <path d="M18.63 13A17.9 17.9 0 0118 8" />
                                        <path d="M6.26 6.26A5.86 5.86 0 006 8c0 7-3 9-3 9h14" />
                                        <path d="M18 8a6 6 0 00-9.33-5" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                </div>
                                <p className="ann-modal__empty-title">No announcements yet</p>
                            </div>
                        )}
                    </div>

                </div>
            </Fade>
        </Modal>
    );
};

export default AnnouncementModal;
