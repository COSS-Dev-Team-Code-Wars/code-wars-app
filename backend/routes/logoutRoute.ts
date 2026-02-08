import { Router, Request, Response } from 'express';

const router = Router();

/*
 * Purpose: Logout user by clearing the authToken cookie
 * Params: None
 * Returns: Success message
 */
router.post('/logout', (req: Request, res: Response) => {
  // Clear the authToken cookie
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
  });

  return res.send({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;
