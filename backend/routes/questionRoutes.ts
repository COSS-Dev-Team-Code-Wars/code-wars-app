import { Router } from 'express';
import { viewQuestions } from '../controllers/questionsController';

const router = Router();

router.get('/viewquestions', viewQuestions);

export default router;