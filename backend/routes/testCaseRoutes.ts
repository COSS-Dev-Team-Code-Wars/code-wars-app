import { Router } from 'express';
import { getTestCasesByProblem, runCode, createTestCase, createMultipleTestCases } from '../controllers/testCaseController';

const router = Router();

router.get('/testcases/:problemId', getTestCasesByProblem);
router.post('/testcases/runcode', runCode);
router.post('/testcases/create', createTestCase);
router.post('/testcases/create-multiple', createMultipleTestCases);

export default router;