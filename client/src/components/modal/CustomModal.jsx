import {
  Backdrop,
  Box,
  Button,
  Fade,
  Modal,
  Typography
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';



const CustomModal = ({ isOpen, setOpen, windowTitle, primaryButtonText }) => {
	/**
   * Purpose: Closes the submission modal.
   */ 
	const handleClose = () => setOpen(false);


  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >   
      {/* Fade in effect */}
      <Fade in={isOpen}>

        {/* Modal Window */}
        <Box
          sx={{
            // centering the window
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",

            // blur all contents in the background
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(10px)",
            boxShadow: "0px 0px 10px 5px rgba(0, 0, 0, 0.5)",

            p: 4,
            borderRadius: "10px",
            bgcolor: "rgba(255, 255, 255)",
          }}
        >

          {/* Container for window title and close button */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              // px: 2,
              // marginBottom: "25px"
            }}
          >
            <Typography
              variant="h5"
              sx={{ color: "general.main" }}
            >
              {windowTitle}
            </Typography>
            <CloseIcon
              sx={{
                width: "30px",
                height: "30px",
                color: "general.main",
                '&:hover': {
                  cursor: 'pointer',
                  color: "glass.main" 
                }
              }}
              onClick={handleClose}
            />
          </Box>

          {/* Primary Button */}
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
            <Button 
              variant="contained" 
              component="span"
              sx={{
                width: "200px",
                height: "50px",
                marginTop: "20px",
                bgcolor: "primary.main",
                '&:hover': {
                  bgcolor: "primary.light",
                }
              }}
            >
              {primaryButtonText}
            </Button>

            {/* Secondary Button */}
            <Button 
              variant="contained" 
              component="span"
              sx={{
                width: "200px",
                height: "50px",
                marginTop: "20px",
                bgcolor: "secondary.main",
                '&:hover': {
                  bgcolor: "secondary.light",
                }
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default CustomModal;