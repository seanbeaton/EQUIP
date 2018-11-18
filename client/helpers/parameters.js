

function setupSequenceParameters(envId) {
  return setupParameters('sequence', envId)
}

function setupSubjectParameters(envId) {
  return setupParameters('subject', envId)
}

function setupParameters(parameterType, envId) {
  if (typeof envId === 'undefined') {
    envId = Router.current().params._envId
  }
  if (typeof parameterType === 'undefined') {
    parameterType = 'subject'
  }

  let subjParams;
  if (parameterType === 'subject') {
    subjParams = SubjectParameters.find({'children.envId':envId}).fetch()[0];
  }
  else {
    subjParams = SequenceParameters.find({'children.envId':envId}).fetch()[0];
  }


  let allParams = [];
  // console.log(students);
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