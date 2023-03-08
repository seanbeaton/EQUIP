import {userCanGroupEditEnv} from "./groups";

export let getEnvironments = function (minObservations, onlyGroupWork) {
  if (typeof minObservations === 'undefined') {
    minObservations = 1;
  }
  if (typeof onlyGroupWork === 'undefined') {
    onlyGroupWork = false;
  }
  let envs = Environments.find().fetch();
  envs = envs.map((env) => {
    env.selected = '';

    if (typeof env.envName === 'undefined') {
      env.envName = 'Loading...';
      env.disabled = 'disabled';
      return env;
    }
    let obsOpts = getObsOptions.call(this, env._id);


    if (obsOpts.length === 0) {
      env.envName += ' (no observations)';
      env.disabled = 'disabled';
    }
    else if (obsOpts.length < minObservations) {
      env.envName += ' (' + obsOpts.length + ')';
      env.disabled = 'disabled';
    }

    if (onlyGroupWork && obsOpts.filter(obs => obs.observationType === 'small_group').length === 0) {
      env.envName += ' (no group work obs.)';
      env.disabled = 'disabled';
    }

    if (env.userId !== Meteor.userId()) {
      env.envName += ' (shared)';
    }
    return env
  }).sort((a, b) => b.lastModifiedObs - a.lastModifiedObs);

  return envs;
}

export let getObsOptions = function (envId) {
  if (typeof envId === 'undefined') {
    envId = this.instance.state.get('selectedEnvironment');
  }

  if (!!envId) {
    return Observations.find({envId: envId}).fetch();
  }
  else {
    return false;
  }
}

export const getDiscourseDimensions = function () {
  let envId = this.instance.state.get('selectedEnvironment');
  if (!envId) {
    return []
  }
  let ret = SequenceParameters.findOne({envId: envId}).parameters;
  ret.forEach(s => s.selected = "")
  ret.unshift({'label': 'Total Contributions', 'options': ['Total Contributions'], 'selected': 'selected'})
  console.log('getDiscourseDimensions ret', ret)

  return ret
};


export const getParamOptions = function (param_type) {
  if (param_type === "discourse") {
    return getDiscourseDimensions.call(this)
  }
  else {
    return getDemographics.call(this)
  }
};


export const getDemographics = function (args) {
  if (typeof args === 'undefined') {
    args = {}
  }

  args = Object.assign({aggregate: true}, args)

  console.log('getDemographics');
  let envId = this.instance.state.get('selectedEnvironment');
  if (!envId) {
    return []
  }
  let ret = SubjectParameters.findOne({envId: envId}).parameters
  ret.forEach(s => s.selected = "")
  ret[0].selected = "selected";
  if (args.aggregate) {
    ret.unshift({'label': 'All Students', 'options': ['All Students'], 'selected': ''})
  }
  return ret
};


export const getSelectedObservations = function () {
  let obsIds = this.instance.state.get('selectedObservationIds');
  return Observations.find({_id: {$in: obsIds}}).fetch();
}
