import { Router } from 'express';
import { getTestCasesByProblem, runCode } from '../controllers/testCaseController';

const router = Router();

router.get('/testcases/:problemId', getTestCasesByProblem);
router.get('/testcases/runCode', runCode)

export default router;