import {userCanGroupEditEnv} from "./groups";

export let envHasObservations = function(envId) {
  let obs = Observations.find({envId: envId}, {sort: {lastModified: -1, reactive: false}}).fetch();
  return obs.length !== 0
}

export let userHasEnvEditAccess = function(env) {
  if (!env) {
    return false
  }
  return (Meteor.userId() === env.userId || userCanGroupEditEnv(Meteor.userId(), env._id))
}