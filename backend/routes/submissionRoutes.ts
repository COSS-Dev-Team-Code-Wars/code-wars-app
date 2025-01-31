import { Router } from "express";
import {
  uploadSubmission,
  downloadSubmission,
  checkSubmission,
  viewSubmissionsTP,
  getAllSubmissions,
  getLastSubmissionByTeamOfProblem,
  getTeamSubmissions,
} from "../controllers/submissionController";

const router = Router();

router.post("/uploadsubmission", uploadSubmission);
router.post("/downloadsubmission", downloadSubmission);
router.post("/checksubmission", checkSubmission);
router.post("/viewsubmissions", viewSubmissionsTP);
router.get("/getallsubmissions", getAllSubmissions);
router.post("/getlastsubmissionbyteam", getLastSubmissionByTeamOfProblem);
router.get("/getteamsubmissions", getTeamSubmissions);

export default router;
