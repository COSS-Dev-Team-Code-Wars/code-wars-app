/* eslint-disable */ 
import { useState, useEffect, useRef } from 'react';

import { useGridApiContext } from '@mui/x-data-grid';
import { cloneDeep } from 'lodash';

import { DropdownSelect } from 'components';
import { ConfirmWindow, SuccessWindow, ErrorWindow } from 'components';
import { postFetch } from 'utils/apiRequest';
import { baseURL } from 'utils/constants';
import { optionsEval, optionsEvalWager } from 'utils/dummyData';



/**
 * Purpose: Displays dropdown select on evaluation column for submissions table when a row is in edit mode.
 */
export default function EvalEditInputCell({ props, submissionsList, setSubmissionsList, subListRef }) {
	// console.log(props)
	// get values from props
	const { id, value, field, hasFocus, row } = props;
	const wagerTitle = "Seek the Mid";

	/**
	 * Initial state should be the same as the value held by view state.
	 */
	const [initialVal, setInitialVal] = useState(value);
	/**
	 * State handler for dropdown select value.
	 */
	const [currVal, setCurrVal] = useState(value);
	/**
	 * State handler for not pushing through with selected option.
	 */
	const [confirmed, setConfirmed] = useState(false);
	/**
	 * State handler for opening modal window if partially correct has been selected.
	 */
	const [openModal, setOpenModal] = useState(false);
	/**
	 * State handler for # of test cases passed.
	 */
	const [correctTestCases, setCorrectTestCases] = useState(row.totalCases);

	
	// for dropdown select
	//const [isDisabled, setIsDisabled] = useState(!row.hasFileDownloaded);

	const apiRef = useGridApiContext();
	const ref = useRef();



	/**
	 * Handles on change event for dropdown select
	 */
	const handleChange = (event) => {
		let newVal = event.target.value;

		if (newVal !== 'Pending' && newVal !== initialVal) {
			console.log('handleChange', newVal, initialVal);
			setCurrVal(newVal);
			apiRef.current.setEditCellValue({ id, field, value: newVal });
		}
		
		if (newVal == 'Error' || newVal == 'Incorrect Solution') {
			setCorrectTestCases(0);
		}
		
	};


	useEffect(()=>{
		console.log('000', row.isDisabled);
	}, [row]);


	useEffect(() => {
		if (!row.isDisabled && initialVal !== 'Partially Correct' && currVal === 'Partially Correct') {
			setOpenModal(true);

		} else if (!row.isDisabled && currVal !== initialVal && currVal !== 'Pending') {

			if (props.formattedValue != 'Pending') {
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
					html: 'Are you sure you want to choose ' + `${currVal}` + ' as the evaluation?<br /><br />Submitted evaluations are final and irreversible.',
				
				}).then((res) => {
					let judgeID = JSON.parse(localStorage?.getItem('user'))?._id;
					let judgeName = JSON.parse(localStorage?.getItem('user'))?.username;
				
					if (res['isConfirmed']) {

						setConfirmed(true);

						const eResponse = postFetch(`${baseURL}/checksubmission`, {
							submissionId: row.dbId,
							evaluation: currVal,
							judgeId: judgeID,
							judgeName: judgeName,
							correctCases: correctTestCases,
							possiblePoints: row.possible_points
						});
					
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
		
	}, [currVal]);
	

	return (
		<>
			<DropdownSelect
				innerRef={(el)=>ref.current = el}
				displayEmpty
				variant="standard"
				isDisabled={row.isDisabled}
				minWidth="100%"
				options={row.problemTitle != wagerTitle ? optionsEval : optionsEvalWager}
				handleChange={handleChange}
				value={currVal}
			/>
		</>
	);
}