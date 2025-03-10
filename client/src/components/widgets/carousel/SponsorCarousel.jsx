/* eslint-disable */ 
import Carousel from 'react-material-ui-carousel';

import Item from './CarouselItem';

// Company logos
// import azeus from 'assets/Company Logos/Azeus.jpg';
// import broadridge from 'assets/Company Logos/BR_logo_rgb_blue.png'
// import exist from 'assets/Company Logos/exist-logo_high-res.png'
// import kusho from 'assets/Company Logos/KushoLogoWhite.png';
// import sxi from 'assets/Company Logos/SXI Logo 02 Horizontal.png';
import dbd from 'assets/Company Logos/DBD.gif';
import offshorly from 'assets/Company Logos/Offshorly.jpg';
import openit from 'assets/Company Logos/OpenIT.png';
import sevenseven from 'assets/Company Logos/SevenSeven.png';
import tenxdev from 'assets/Company Logos/TenXDev.jpeg';

// Partner logos
// import cynthia from 'assets/Partner Logos/Cynthia.jpg';
// import tresto from 'assets/Partner Logos/Tresto.jpg';
import chikincorner from 'assets/Partner Logos/ChikinCorner.jpg';
import cafeture from 'assets/Partner Logos/Cafeture.png';

// Org Logos
import cicssc from 'assets/Org Logos/CICSSC.png';
import gss from 'assets/Org Logos/GSS.png';
import socomsci from 'assets/Org Logos/SoComSci.png';
import unreal from 'assets/Org Logos/Unreal.png';
import uplbcaps from 'assets/Org Logos/UPLBCAPS.png';
import uplbcasfc from 'assets/Org Logos/UPLBCASFC.PNG';
import yses from 'assets/Org Logos/YSES.png';

// Media Logos
import cebu from 'assets/Media Logos/CebuDaily.jpeg';
import inquirer from 'assets/Media Logos/Inquirer.jpg';
import pop from 'assets/Media Logos/Pop.png';


// placeholder for company logos
var logos = [
	{
		id: '1',
		title: 'Company 1',
		image: `${dbd}`,
	},
	{
		id: '2',
		title: 'Company 2',
		image: `${offshorly}`,
	},
	{
		id: '3',
		title: 'Company 3',
		image: `${openit}`,
	},
	{
		id: '4',
		title: 'Company 3',
		image: `${sevenseven}`,
	},
	{
		id: '5',
		title: 'Company 2',
		image: `${tenxdev}`,
	},
	{
		id: '6',
		title: 'Company 3',
		image: `${chikincorner}`,
	},
	{
		id: '7',
		title: 'Company 3',
		image: `${cafeture}`,
	},
	{
		id: '8',
		title: 'Company 3',
		image: `${cicssc}`,
	},
	{
		id: '9',
		title: 'Company 3',
		image: `${gss}`,
	},
	{
		id: '10',
		title: 'Company 3',
		image: `${socomsci}`,
	},
	{
		id: '11',
		title: 'Company 3',
		image: `${unreal}`,
	},
	{
		id: '12',
		title: 'Company 3',
		image: `${uplbcaps}`,
	},
	{
		id: '13',
		title: 'Company 3',
		image: `${uplbcasfc}`,
	},
	{
		id: '14',
		title: 'Company 3',
		image: `${yses}`,
	},
	{
		id: '15',
		title: 'Company 3',
		image: `${cebu}`,
	},
	{
		id: '16',
		title: 'Company 3',
		image: `${inquirer}`,
	},
	{
		id: '17',
		title: 'Company 3',
		image: `${pop}`,
	},
];


/**
 * Purpose: Component that will display the sponsored companies through a carousel
 * Params: None
 */
const SponsorCarousel = () => {

	return (
		<Carousel
			sx={{
				paddingY: 3,
				// minWidth: '100%',
				alignItems: 'center',
				alignContent: 'center',
				justifyContent: 'center',
				borderRadius: '15px',
				bgcolor: 'rgba(255, 255, 255, 0.1)',
				boxShadow: '0px 0px 10px 5px rgba(0, 0, 0, 0.5)',
				backdropFilter: 'blur(10px)',
			}}

			// remove grow animation on component mount
			swipe={false}
			
			// make prev and next buttons always visible
			navButtonsAlwaysVisible={true}

			// adjust marginX for navigation buttons
			navButtonsWrapperProps={{
				style: {
					marginLeft: 5,
					marginRight: 5,
				}
			}} 

			// modify color for active indicator
			activeIndicatorIconButtonProps={{
				style: {
					backgroundColor: 'blue'
				}
			}}
      
			// adjust margin for indicators
			indicatorContainerProps={{
				style: {
					marginTop: '15px',
				}
			}}

			// adjust padding for indicator buttons
			indicatorIconButtonProps={{
				style: {
					marginLeft: 8,
					marginRight: 8,
				}
			}}
		>
			{/* displays the logos */}
			{ logos.map((item) =>
				<Item
					key={item.id}
					logo={item}
				/>
			)}
		</Carousel>
	);
};

export default SponsorCarousel;
