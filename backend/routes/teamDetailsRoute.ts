import { Router } from 'express';
import { getAllTeams, getTeamDetailsById, getTeamSets, setTeamSet } from '../controllers/teamDetailsController';

const router = Router();

router.get('/teams', getAllTeams);
router.get('/teams/:id', getTeamDetailsById);
router.post('/teamsets', getTeamSets);
router.post('/setteamset', setTeamSet);

export default router;