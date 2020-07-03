import {console_log_conditional} from "./logging"


function setupSequenceParameters(envId, reactive) {
  return setupParameters('sequence', envId, reactive)
}

function setupSubjectParameters(envId, reactive) {
  return setupParameters('subject', envId, reactive)
}

function setupParameters(parameterType, envId, reactive) {
  if (typeof envId === 'undefined') {
    envId = Router.current().params._envId
  }
  if (typeof parameterType === 'undefined') {
    parameterType = 'subject'
  }
  if (typeof reactive === 'undefined') {
    reactive = false
  }

  let subjParams;
  if (parameterType === 'subject') {
    subjParams = SubjectParameters.findOne({'envId':envId}, {reactive: reactive});
  }
  else {
    subjParams = SequenceParameters.findOne({'envId':envId}, {reactive: reactive});
  }

  if (typeof subjParams === 'undefined') {
    console_log_conditional('no ' + parameterType + ' params found for envId ' + envId);
    return [];
  }

  let allParams = [];

  // console_log_conditional('subjParams', subjParams);

  if (subjParams.children["parameters"] === undefined) {
    // for legacy classrooms
    for (let p = 0; p < subjParams["children"]["parameterPairs"]; p++) {
      allParams.push({
        'name': subjParams['children']['label'+p],
        'options': subjParams['children']['parameter'+p],
      });
    }
  }
  else {
    // new data model classrooms
    allParams = subjParams.children.parameters
  }
  return allParams
}

export {setupSubjectParameters, setupSequenceParameters}