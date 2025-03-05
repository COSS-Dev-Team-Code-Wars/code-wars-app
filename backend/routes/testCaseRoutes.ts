import { Router } from 'express';
import { getTestCasesByProblem, runCode } from '../controllers/testCaseController';

const router = Router();

router.get('/testcases/:problemId', getTestCasesByProblem);
router.post('/testcases/runcode', runCode)

export default router;