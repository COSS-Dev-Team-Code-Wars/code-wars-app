import { Router } from 'express';
import { commandChannel, setAnnouncement, setAdminCommand, setBuyImmunity } from '../controllers/adminController';

const router = Router();

router.get('/admincommand', commandChannel);
router.post('/setcommand', setAdminCommand);
router.post('/set-buy-immunity', setBuyImmunity);
router.post('/announce', setAnnouncement);

export default router;