/* eslint-disable */ 
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useGridApiContext } from "@mui/x-data-grid";
import { DropdownSelect } from "components";
import { optionsEval } from "utils/dummyData";
import EvaluationModal from "../modals/EvaluationModal";
import { ConfirmWindow, SuccessWindow, ErrorWindow } from "components";
import { socketClient } from "socket/socket";
import { cloneDeep } from "lodash";
import { baseURL } from "utils/constants";
import { postFetch } from "utils/apiRequest";

export default function EvalEditInputCell({props, submissionsList, setSubmissionsList, subListRef}) {
	console.log(props);
	const { id, value, field, hasFocus, row } = props;


	// initial state should be the same as the value held by view state
	const [initialVal, setInitialVal] = useState(value);

	// state handler for dropdown select value
	const [currVal, setCurrVal] = useState(value);

	// for dropdown select
	//const [isDisabled, setIsDisabled] = useState(!row.hasFileDownloaded);

	// for not pushing through with selected option
	const [confirmed, setConfirmed] = useState(false);
	
	const [openModal, setOpenModal] = useState(false);
	const [correctTestCases, setCorrectTestCases] = useState(row.totalCases);

	const apiRef = useGridApiContext();
	const ref = useRef();

	const handleChange = (event) => {
		let newVal = event.target.value;

		if (newVal !== "Pending" && newVal !== initialVal) {
			console.log("handleChange", newVal, initialVal)
			setCurrVal(newVal);
			apiRef.current.setEditCellValue({ id, field, value: newVal });
		}
		
		if (newVal == "Error" || newVal == "Incorrect Solution") {
			setCorrectTestCases(0);
		}
		
	};

	useEffect(()=>{
		console.log("000", row.isDisabled);
	}, [row]);

	useEffect(() => {
		if (!row.isDisabled && initialVal !== "Partially Correct" && currVal === "Partially Correct") {
			setOpenModal(true);

		} else if (!row.isDisabled && currVal !== initialVal && currVal !== "Pending") {

			if (props.formattedValue != "Pending") {
				ErrorWindow.fire({
					text: 'Cannot evaluate already evaluated submission.'
				});

				setConfirmed(false);
				setCurrVal(initialVal);

				var copy = cloneDeep(submissionsList);
				setSubmissionsList(copy);
				subListRef.current = copy;

				apiRef.current.setEditCellValue({ id, field, value: initialVal });
			}
			else {

			// ask for confirmation of action
			ConfirmWindow.fire({
				text: 'Are you sure you want to choose ' + `${currVal}` + ' as the evaluation?',
				html:
				'<p>Please take note that submitted evaluations are irreversible.</p>'
				
			}).then((res) => {
				let judgeID = JSON.parse(localStorage?.getItem("user"))?._id;
				let judgeName = JSON.parse(localStorage?.getItem("user"))?.username;
				
				if (res['isConfirmed']) {

					setConfirmed(true);

					const eResponse = postFetch(`${baseURL}/checksubmission`, {
						submissionId: row.dbId,
						evaluation: currVal,
						judgeId: judgeID,
						judgeName: judgeName,
						correctCases: correctTestCases,
						possiblePoints: row.possible_points
					})
					
					SuccessWindow.fire({
						text: 'Successfully submitted evaluation!'
					});

					var copy = cloneDeep(submissionsList);

					copy.map((submission)=>{
						if (row.dbId == submission.dbId) {
							submission.evaluation = currVal;
							submission.checkedBy = judgeName;
						}
					});

					console.log(
						submissionsList
					);
					setSubmissionsList(copy);
					subListRef.current = copy;

					// disabling the dropdown select again
					//row.hasFileDownloaded = false;
					//setIsDisabled(true);
					//console.log(isDisabled);

				// if user selected pending as option, do not replace currValue with "Pending" kasi dapat di siya valid option (?) // It's ok i think, like meaning ay di muna i-evaluate
				} 
				if (res['isDismissed']) {
					setConfirmed(false);
					setCurrVal(initialVal);

					var copy = cloneDeep(submissionsList);
					setSubmissionsList(copy);
					subListRef.current = copy;

					apiRef.current.setEditCellValue({ id, field, value: initialVal });
				}
			});
			}
		}
		
	}, [currVal])
	

	return (
		<>
			<DropdownSelect
				innerRef={(el)=>ref.current = el}
				displayEmpty
				variant="standard"
				isDisabled={row.isDisabled}
				minWidth="100%"
				options={optionsEval}
				handleChange={handleChange}
				value={currVal}
			/>

			{openModal ?
				<EvaluationModal
					props={props}
					open={openModal}
					setOpen={setOpenModal}
					currEval={currVal}
					initialVal={initialVal}
					rowValues={row}
					correctCases={correctTestCases}
					setCorrectCases={setCorrectTestCases}
					submissionsList={submissionsList}
					setSubmissionsList={setSubmissionsList}
					subListRef={subListRef}
					id={id}
					field={field}
					setCurrVal={setCurrVal}
					totalCases={row.totalCases}
				/>
				: null
			}
		</>
	)
};