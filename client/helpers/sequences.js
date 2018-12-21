import {setupSequenceParameters, setupSubjectParameters} from "./parameters";

function getSequence(seqId, envId) {
  let sequence = Sequences.find({_id:seqId}).fetch();
  let allParams = setupSequenceParameters(envId);
  return updateSequence(sequence, allParams);

}
function getSequences(obsId, envId) {
  let sequences = Sequences.find({obsId:obsId}).fetch();
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
  if (sequence.info['parameters'] === undefined || !sequence.info['parameters']) {
    sequence.info.parameters = {};
  }
  for (let param_k in allParams) {
    if (!allParams.hasOwnProperty(param_k)) continue;
    let param = allParams[param_k];
    sequence.info.parameters[param.name] = sequence.info[param.name]
  }
  sequence.info.student = {
    studentId: sequence.info.studentId,
    studentName: sequence.info.Name,
  };
  return sequence
}


export {updateSequence, updateSequences, getSequences, getSequence}