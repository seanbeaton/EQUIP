import {setupSequenceParameters, setupSubjectParameters} from "/helpers/parameters";
import {getStudent} from "./students";

function getSequence(seqId, envId) {
  let sequence = Sequences.findOne({_id:seqId}, {reactive: false});
  let allParams = setupSequenceParameters(envId);
  return updateSequence(sequence, allParams);
}
function getSequences(obsId, envId) {
  let sequences;
  console.log('obsId, envId', obsId, envId)
  if (obsId === null) {
    sequences = Sequences.find({envId:envId}, {reactive: false}).fetch();
  }
  else {
    sequences = Sequences.find({obsId:obsId}, {reactive: false}).fetch();
  }
  let allParams = setupSequenceParameters(envId);
  return updateSequences(sequences, allParams);
}

function updateSequences(sequences, allParams) {
  // if we have the legacy student params, convert to the new ones.
  sequences.forEach(function(sequence) {
    updateSequence(sequence, allParams)
  });
  return sequences
}

function updateSequence(sequence, allParams) {
  // console.log('updateSequence', sequence, allParams);
  if (sequence.info['parameters'] === undefined || !sequence.info['parameters']) {
    sequence.info.parameters = {};

    for (let param_k in allParams) {
      if (!allParams.hasOwnProperty(param_k)) continue;
      let param = allParams[param_k];
      sequence.info.parameters[param.name] = sequence.info[param.name]
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
    // console.log('updating sequeence, student', student);

    sequence.info.student.studentName = student.info.name;
    sequence.info.student.demographics = student.info.demographics;

  }
  // console.log('done with updateSequence', sequence, allParams);

  return sequence
}


export {updateSequence, updateSequences, getSequences, getSequence}