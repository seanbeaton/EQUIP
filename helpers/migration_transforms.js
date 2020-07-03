import {getStudent} from "./students";

export const upgradeSequence = function(sequence) {
  let new_info = {
    studentId: sequence.info.studentId,
    parameters: []
  };
  let allParams = SequenceParameters.findOne({envId:subj.envId});

  if (sequence.info['parameters'] === undefined || !sequence.info['parameters']) {
    for (let param_k in allParams) {
      if (!allParams.hasOwnProperty(param_k)) continue;
      let param = allParams[param_k];
      new_info.parameters.push({
        'label': param.label,
        'value': sequence.info[param.label],
      });
    }
  }
  else {
    new_info.parameters = Object.keys(sequence.info.parameters).map(function(key) {
      return {
        'label': key,
        'value': sequence.info.parameters[key],
      }
    })
  }
  sequence.info = new_info;
  return sequence
}

export const upgradeParams = function (params) {
  params['parameters'] = [];

  for (let p = 0; p < params["children"]["parameterPairs"]; p++) {
    params['parameters'].push({
      'label': params['children']['label' + p],
      'options': params['children']['parameter' + p].split(',').map(function (item) {
        return item.trim();
      })
    });
  }
  params['envId'] = params['children']['envId'];
  delete params['children'];
  return params;
}

export const upgradeSubject = function(subj) {
  let allParams = SubjectParameters.findOne({envId:subj.envId});
  if (subj.info['demographics'] === undefined || Object.keys(subj.info['demographics']).length === 0) {

    subj.info.demographics = {};
    allParams.forEach(function(param) {
      subj.info.demographics[param.label] = subj.info[param.label];
    })
  }
  return subj;
}


export const downgradeParams = function (params) {
  params['children'] = {}
  params["parameters"].forEach(function (param, idx) {
    params['children']['label' + idx] = param.label
    params['children']['parameter' + idx] = param.options.join(',')
  });
  params['children']['envId'] = params['envId'];
  params['children']['parameterPairs'] = params['parameters'].length;
  delete params['parameters'];
  delete params['envId'];
  return params;
}

export const downgradeSequence = function(sequence) {
  let sequence_params = {}
  sequence.info.parameters.map(function(param) {
    sequence_params[param.label] = param.value;
  })
  sequence.info.parameters = sequence_params;

  sequence.info.student = {
    studentId: sequence.info.studentId,
    studentName: sequence.info.Name,
    demographics: getStudent(sequence.info.studentId, sequence.envId).info.demographics
  };
  return sequence;
}