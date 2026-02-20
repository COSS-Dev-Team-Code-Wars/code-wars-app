/* eslint-disable */
import { Backdrop, Fade, Modal } from '@mui/material';

/**
 * Purpose: A minimal status feedback modal.
 *
 * Props:
 *   isOpen      <Boolean>  – whether the modal is visible
 *   setOpen     <Func>     – state setter to close the modal
 *   variant     <String>   – 'success' | 'error' | 'info'  (default: 'info')
 *   title       <String>   – bold heading text
 *   message     <String>   – body description text
 *   confirmText <String>   – button label (default: 'OK')
 *   onConfirm   <Func>     – optional extra callback when confirmed; if omitted just closes
 */

const VARIANTS = {
	success: {
		icon: (
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<polyline points="20 6 9 17 4 12" />
			</svg>
		),
	},
	error: {
		icon: (
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</svg>
		),
	},
	info: {
		icon: (
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<circle cx="12" cy="12" r="10" />
				<line x1="12" y1="16" x2="12" y2="12" />
				<line x1="12" y1="8" x2="12.01" y2="8" />
			</svg>
		),
	},
};

const StatusModal = ({
	isOpen,
	setOpen,
	variant = 'info',
	title,
	message,
	confirmText = 'OK',
	onConfirm,
}) => {
	const config = VARIANTS[variant] ?? VARIANTS.info;

	const handleConfirm = () => {
		if (onConfirm) onConfirm();
		setOpen(false);
	};

	return (
		<Modal
			open={isOpen}
			closeAfterTransition
			slots={{ backdrop: Backdrop }}
			slotProps={{ backdrop: { timeout: 200 } }}
		>
			<Fade in={isOpen} timeout={200}>
				<div style={styles.overlay}>
					<div style={styles.card}>

						{/* Icon + Title row */}
						<div style={styles.header}>
							<span style={styles.iconWrap}>{config.icon}</span>
							<h2 style={styles.title}>{title}</h2>
						</div>

						{/* Divider */}
						<div style={styles.divider} />

						{/* Message */}
						{message && <p style={styles.message}>{message}</p>}

						{/* Confirm button */}
						<button
							style={styles.button}
							onClick={handleConfirm}
							onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
							onMouseLeave={e => e.currentTarget.style.background = '#1a1a1a'}
						>
							{confirmText}
						</button>
					</div>
				</div>
			</Fade>
		</Modal>
	);
};

const styles = {
	overlay: {
		position: 'fixed',
		inset: 0,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '16px',
	},
	card: {
		background: '#ffffff',
		borderRadius: '12px',
		boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
		padding: '28px 32px 24px',
		width: '100%',
		maxWidth: '380px',
		display: 'flex',
		flexDirection: 'column',
		gap: '14px',
	},
	header: {
		display: 'flex',
		alignItems: 'center',
		gap: '10px',
	},
	iconWrap: {
		display: 'flex',
		alignItems: 'center',
		flexShrink: 0,
	},
	divider: {
		height: '1px',
		background: '#e5e5e5',
		margin: '0 -2px',
	},
	title: {
		margin: 0,
		fontFamily: 'Inter, sans-serif',
		fontWeight: 600,
		fontSize: '1.05rem',
		color: '#1a1a1a',
		letterSpacing: '-0.01em',
	},
	message: {
		margin: 0,
		fontFamily: 'Inter, sans-serif',
		fontWeight: 400,
		fontSize: '0.9rem',
		color: '#555',
		lineHeight: 1.6,
	},
	button: {
		alignSelf: 'flex-end',
		padding: '8px 24px',
		border: 'none',
		borderRadius: '8px',
		background: '#1a1a1a',
		color: '#fff',
		fontFamily: 'Inter, sans-serif',
		fontWeight: 500,
		fontSize: '0.88rem',
		cursor: 'pointer',
		transition: 'background 0.15s ease',
	},
};

export default StatusModal;
