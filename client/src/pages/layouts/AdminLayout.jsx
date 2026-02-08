/* eslint-disable */
import { useEffect } from 'react';

import { Box } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';

import GeneralBackground from 'assets/GenBackground.png';
import { FreezeOverlay, LoadingOverlay, Sidebar } from 'components';


/**
 * Purpose: Layout for admin-related pages.
 */
const AdminLayout = ({
	freezeOverlay,
	isLoggedIn,
	setIsLoggedIn,
	checkIfLoggedIn,
}) => {

	const navigate = useNavigate();

	useEffect(() => { 
		// Always check authentication status
		const verifyAuth = async () => {
			await checkIfLoggedIn();
			
			// After auth check, route based on usertype
			const usertype = JSON.parse(localStorage?.getItem('user'))?.usertype;
			if (usertype == 'judge') {
				navigate('/judge/submissions');
			}
			else if (usertype == 'participant') {
				navigate('/participant/view-all-problems');
			}
		};
		
		verifyAuth();

  }, []);

	// Redirect to login if authentication fails
	useEffect(() => {
		if (isLoggedIn === false) {
			const usertype = JSON.parse(localStorage?.getItem('user'))?.usertype;
			if (!usertype || usertype !== 'admin') {
				navigate('/');
			}
		}
	}, [isLoggedIn]);
  
  
	return (
		<Box
			sx={{
				height: '100vh',
				overflow: 'hidden',
				backgroundSize: 'cover',
				backgroundRepeat: 'no-repeat',
				backgroundAttachment: 'fixed',
				backgroundImage: `url(${GeneralBackground})`,
			}}
			id="commonBox"
		>
			{ freezeOverlay ?
				<div className='fOverlayScreen' style={{ zIndex: '10000' }}>
					<FreezeOverlay />
				</div>

			  // if user is logged in as admin
				: isLoggedIn ?
					<Box sx={{ display: 'flex' }}>
						<Sidebar />
  
						<Outlet />
					</Box>

				  // replace with protected page sana
					: <LoadingOverlay />
			}
		</Box>
	);
};

export default AdminLayout;