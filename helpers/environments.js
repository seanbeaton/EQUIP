import {userCanGroupEditEnv} from "./groups";

export let envHasObservations = function (envId) {
  let obs = Observations.find({envId: envId}, {sort: {lastModified: -1, reactive: false}}).fetch();
  return obs.length !== 0
}

export let userHasEnvEditAccess = function (env) {
  if (!env) {
    return false
  }
  return (Meteor.userId() === env.userId || userCanGroupEditEnv(Meteor.userId(), env._id))
}

export let getEnvironments = function (selectedEnvironment, minObservations, onlyGroupWork) {
  if (typeof minObservations === 'undefined') {
    minObservations = 1;
  }
  if (typeof onlyGroupWork === 'undefined') {
    onlyGroupWork = false;
  }
  let envs = Environments.find().fetch();
  envs = envs.map(function (env) {
    env.selected = '';

    if (typeof env.envName === 'undefined') {
      env.envName = 'Loading...';
      env.disabled = 'disabled';
      return env;
    }
    let obsOpts = getObsOptions(selectedEnvironment, env._id);
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
  if (envs.findIndex(e => !e.disabled) !== -1) {
    envs[envs.findIndex(e => !e.disabled)].selected = 'selected';
  }
  return envs;
}

export let getObsOptions = function (selectedEnvironment, envId) {
  // console.log('getobsoptions', selectedEnvironment, envId);

  if (typeof envId === 'undefined') {
    envId = selectedEnvironment.get();
  }
  // console.log('getobsoptions', selectedEnvironment, envId);

  if (!!envId) {
    return Observations.find({envId: envId}).fetch();
  }
  else {
    return false;
  }
}
