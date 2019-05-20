
export let envHasObservations = function(envId) {
  let obs = Observations.find({envId: envId}, {sort: {lastModified: -1}}).fetch();
  return obs.length === 0
}