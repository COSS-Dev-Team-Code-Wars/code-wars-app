import { Router } from 'express';

const router = Router();

router.get('/health-check', (req, res) => {
  return res.status(200).send("Health check passed!");
});

export default router;