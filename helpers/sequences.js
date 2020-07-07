import {setupSequenceParameters, setupSubjectParameters} from "/helpers/parameters";
import {getStudent} from "./students";
import {console_log_conditional} from "./logging"

//
// function updateSequences(sequences, allParams) {
//   // if we have the legacy student params, convert to the new ones.
//   sequences.forEach(function(sequence) {
//     updateSequence(sequence, allParams)
//   });
//   return sequences
// }

function updateSequence(sequence, allParams) {
  // console_log_conditional('updateSequence', sequence, allParams);
  if (sequence.info['parameters'] === undefined || !sequence.info['parameters']) {
    sequence.info.parameters = {};

    for (let param_k in allParams) {
      if (!allParams.hasOwnProperty(param_k)) continue;
      let param = allParams[param_k];
      sequence.info.parameters[param.label] = sequence.info[param.label]
    }
  }
  if (typeof sequence.info.student === 'undefined') {
    sequence.info.student = {
      studentId: sequence.info.studentId,
      studentName: sequence.info.Name,
      demographics: getStudent(sequence.info.studentId, sequence.envId).info.demographics
    };
  }
  else {
    let student = getStudent(sequence.info.student.studentId, sequence.envId);
    // console_log_conditional('updating sequeence, student', student);

    sequence.info.student.studentName = student.info.name;
    sequence.info.student.demographics = student.info.demographics;

  }
  // console_log_conditional('done with updateSequence', sequence, allParams);

  return sequence
}


export {updateSequence, updateSequences, getSequences, getSequence}