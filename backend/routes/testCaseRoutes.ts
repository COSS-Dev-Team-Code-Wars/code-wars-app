import { Router } from 'express';
import { getTestCasesByProblem } from '../controllers/testCaseController';

const router = Router();

router.get('/testcases/:problemId', getTestCasesByProblem);

export default router;