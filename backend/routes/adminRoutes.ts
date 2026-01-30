import { Router } from 'express';
import { commandChannel, setAnnouncement, setAdminCommand, setBuyImmunity } from '../controllers/adminController';
import { generateQuestion } from '../controllers/questionsController';

const router = Router();


router.get('/admincommand', commandChannel);
router.post('/setcommand', setAdminCommand);
router.post('/set-buy-immunity', setBuyImmunity);
router.post('/announce', setAnnouncement);

// Add question creation endpoint for admin
router.post('/questions', generateQuestion);

export default router;