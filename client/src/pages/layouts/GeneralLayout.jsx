import { Outlet } from "react-router-dom";
import { FreezeOverlay } from "components";
import GeneralBackground from 'assets/GeneralBackground.png';



const GeneralLayout = ({ freezeOverlay }) => {
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
      {freezeOverlay ?
        <div className='fOverlayScreen' style={{ zIndex: "10000" }}>
          <FreezeOverlay />
        </div>
        : null
      }
      {/* Children will be displayed through outlet */}
      <Outlet />
    </Box>
  )
};

export default GeneralLayout;