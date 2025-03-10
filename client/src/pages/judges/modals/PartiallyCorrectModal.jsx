import { useEffect, useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { ConfirmWindow, CustomModal } from "components";
import { postFetch } from "utils/apiRequest";
import { baseURL } from "utils/constants";

const PartiallyCorrectModal = ({ open, setOpen, submission, updateEvaluation }) => {
  const [correctCases, setCorrectCases] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOpen(false);

    const { isConfirmed } = await ConfirmWindow.fire({
      text: `Are you sure you want to choose Partially Correct (${correctCases} of ${submission?.total_test_cases}) as the evaluation?`,
    });
    if (!isConfirmed) return setCorrectCases();
    let judgeID = JSON.parse(localStorage?.getItem("user"))?._id;
    let judgeName = JSON.parse(localStorage?.getItem("user"))?.username;
    postFetch(`${baseURL}/checksubmission`, {
      submissionId: submission.id,
      evaluation: "Partially Correct",
      judgeId: judgeID,
      judgeName: judgeName,
      correctCases: correctCases,
      possiblePoints: submission.possible_points,
    });
    updateEvaluation(submission?.id, "Partially Correct");
    setCorrectCases();
  };

  useEffect(() => {
    console.log("new submission", submission);
  }, [submission]);

  return (
    <CustomModal isOpen={open} setOpen={setOpen} windowTitle="Test Case Evaluation">
      {/* Container for modal body */}
      <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off" sx={{ maxWidth: "100%", marginTop: "25px" }}>
        {/* Instruction text */}
        <Typography variant="body1" sx={{ marginBottom: "20px" }}>
          Please enter the number of test cases passed for this particular submission entry.
        </Typography>

        {/* Input field */}
        <TextField
          required
          fullWidth
          error={correctCases === ""}
          value={correctCases}
          onChange={(e) => Number(e.target.value) < submission?.total_test_cases && setCorrectCases(e.target.value)}
          InputLabelProps={{ shrink: true }}
          InputProps={{ inputProps: { min: 1, max: submission?.total_test_cases - 1 } }}
          type="number"
          variant="standard"
          label={"# of Test Cases Passed Out of " + submission?.total_test_cases + " Cases:"}
          helperText="Enter numeric values only."
        />

        {/* Buttons */}
        <Box sx={{ gap: 3, float: "right", display: "flex", marginTop: "20px" }}>
          {/* Submit button */}
          <Button
            variant="contained"
            size="large"
            disabled={correctCases === ""}
            onClick={handleSubmit}
            sx={{ bgcolor: "primary", "&:disabled": { bgcolor: "primary.light", color: "#fff" } }}
          >
            Submit
          </Button>

          {/* Cancel Button */}
          <Button variant="contained" onClick={() => setOpen(false)} size="large" sx={{ bgcolor: "#808080", "&:hover": { bgcolor: "#646464" } }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </CustomModal>
  );
};

export default PartiallyCorrectModal;
