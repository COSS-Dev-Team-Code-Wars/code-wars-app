/* eslint-disable */ 
import { Box, Typography } from "@mui/material";

import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';


const PowerUpItem = ({
  icon,
  item,
  handleClick,
}) => {
  
  return (
    <Box
      sx={{
        width: '70%',
        display: 'flex',
        cursor: 'pointer',
        color: 'white.main',
      }}
      onClick={() => handleClick(item)}
    >
      <Box
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          width: '100%',
          boxShadow: 'inset 0px 5px 5px -5px rgba(0,0,0,0.5)',
          paddingY: 2,
          borderRadius: '50px',
          display: 'flex',
          justifyContent: 'space-between',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.2)',
          },
        }}
      >
        {/* Container for buff name, icon, and arrow icon */}
        <Box sx={{ display: 'flex' }} >
          {icon}

          <Typography sx={{ fontSize: '.9rem', color: 'white.main' }} >
            {item.name}
          </Typography>
        </Box>
        
        {/* Arrow icon */}
        <ArrowCircleRightIcon sx={{ marginRight: '20px' }} />
      </Box>
    </Box>
  )
}

export default PowerUpItem