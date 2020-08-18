import {getStudent} from "./students";

export const upgradeSequence = function (sequence, cachedEnvsParams, cachedEnvsMemoStats) {
  let new_info = {
    studentId: sequence.info.studentId,
    parameters: {}
  };

  if (typeof sequence.envId === 'undefined') {
    new_info['delete_seq'] = true;
    new_info['reason'] = 'missing envId'
    sequence.info = new_info
    return sequence
  }

  let allParams;
  if (cachedEnvsParams[sequence.envId]) {
    allParams = cachedEnvsParams[sequence.envId]
    cachedEnvsMemoStats.memo++
    // console.log('using cached allParams')
  }
  else {
    allParams = SequenceParameters.findOne({envId: sequence.envId});
    cachedEnvsParams[sequence.envId] = allParams
    cachedEnvsMemoStats.new++
    // console.log('using fresh allParams')
  }

  if (!allParams) {
    console.log('missing allParams for envId from sequence, searched for ', sequence.envId, 'allparams', allParams)
    new_info['delete_seq'] = true;
    new_info['reason'] = 'no params found'
    sequence.info = new_info
    return sequence
  }

  if (sequence.info && allParams && (sequence.info['parameters'] === undefined || !sequence.info['parameters'])) {
    allParams.parameters.forEach(function (param) {
      new_info.parameters[param.label] = sequence.info[param.label]
    });
  }
  else if (sequence.info && allParams && Object.keys(sequence.info['parameters']).length > 0) {
    new_info.parameters = sequence.info.parameters
  }
  else {
    console.log('first check', sequence.info && allParams && (sequence.info['parameters'] === undefined || !sequence.info['parameters']))
    console.log('first check', Boolean(sequence.info), Boolean(allParams), sequence.info['parameters'] === undefined, !sequence.info['parameters'])
    console.log('second check', Boolean(sequence.info) && Boolean(allParams) && sequence.info['parameters'].length > 0)
    console.log('second check items', sequence.info, allParams, sequence.info['parameters'].length > 0)
    console.log('sequence.info', sequence.info);
    console.log('allParams', allParams);
  }

  if (!allParams || !new_info.parameters || new_info.parameters.length < 1) {
    new_info = sequence.info
    new_info['delete_seq'] = true;
    new_info['reason'] = 'missing parameters after format update';
  }

  if (typeof sequence.info.studentId !== 'undefined') {
    new_info.student = {
      studentId: sequence.info.studentId
    }
  }
  else if (typeof sequence.info.student !== "undefined" && typeof sequence.info.student.studentId !== "undefined") {
    new_info.student = {
      studentId: sequence.info.student.studentId
    }
  }
  else {
    new_info = sequence.info
    new_info['delete_seq'] = true;
    new_info['reason'] = typeof new_info['reason'] === 'undefined' ? 'no student id' : new_info['reason'] + ', no student id'
  }
  sequence.info = new_info;
  return sequence
}

export const upgradeParams = function (params) {
  params['parameters'] = [];
  // console.log('params', params)

  if (typeof params["children"] === "undefined") {
    return params;
  }
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

export const upgradeSubject = function (subj, subjEnvCache, subjEnvMemoStats) {
  if (subj.info['demographics'] === undefined || Object.keys(subj.info['demographics']).length === 0) {

    let allParams;
    if (subjEnvCache[subj.envId]) {
      allParams = subjEnvCache[subj.envId]
      subjEnvMemoStats.memo++
    }
    else {
      allParams = SubjectParameters.findOne({envId: subj.envId}).parameters;
      subjEnvCache[subj.envId] = allParams
      subjEnvMemoStats.new++
    }

    let new_demos = {};
    allParams.forEach(function (param) {
      new_demos[param.label] = subj.info[param.label];
    })
    subj.info = {
      demographics: new_demos,
      name: subj.info.name,
    }
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

export const downgradeSequence = function (sequence) {
  let sequence_params = {}
  sequence.info.parameters.map(function (param) {
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
