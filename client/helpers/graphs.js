import {getSequences} from "./sequences";
import {setupSequenceParameters} from "./parameters";
let d3 = require('d3');

let createStudentTimeData = function(envId, obsIds, student, dimension, disc_opts) {

  let ret = {
    contributions_dataset: []
  };

  for (let obsId_k in obsIds) {

    if (!obsIds.hasOwnProperty(obsId_k)) continue;
    let obsId = obsIds[obsId_k];

    let sequences = getSequences(obsId, envId);
    let selected_observations = getObservations(obsIds);

    for (let sequence_k in sequences) {
      if (!sequences.hasOwnProperty(sequence_k)) continue;
      let sequence = sequences[sequence_k];

      if (!ret.contributions_dataset.find(datapoint => datapoint.obsId === obsId)) {
        // If it wasn't there:

        let obs = selected_observations.find(obs => obs._id === obsId);
        let parseTime = d3.timeParse('%Y-%m-%d');
        let datapoint = {
          obsId: obsId,
          d3date: parseTime(obs.observationDate),
          obsName: obs.name,
          date: obs.observationDate,
          _total: 0,
        };

        disc_opts.forEach(function (opt) {
          datapoint[opt.name] = 0
        });

        ret.contributions_dataset.push(datapoint)
      }

      if (sequence.info.student.studentId !== student._id) {
        continue;
      }

      let seq_disc_opt = sequence.info.parameters[dimension];
      let ds_index = ret.contributions_dataset.findIndex(datapoint => datapoint.obsId === obsId);

      ret.contributions_dataset[ds_index]._total += 1;
      ret.contributions_dataset[ds_index][seq_disc_opt] += 1;

    }
  }

  ret.contributions_dataset.forEach(function(obs) {
    obs.max = obs._total;
  });

  return ret.contributions_dataset

}

let getObservations = function(obsIds) {
  return Observations.find({_id: {$in: obsIds}}).fetch();
}

let getDiscourseDimensions = function(envId) {
  if (typeof envId === 'undefined' || !envId) {
    return []
  }
  return setupSequenceParameters(envId);
};

let getDiscourseOptionsForDimension = function(envId, dimension) {
  let options = getDiscourseDimensions(envId);
  if (dimension === false) {
    return [];
  }
  let opt = options.find(opt => opt.name === dimension);
  if (typeof opt === 'undefined') {
    return [];
  }
  return opt
    .options.split(',').map(function(opt) {return {name: opt.trim()}})
};


export {createStudentTimeData, getObservations, getDiscourseOptionsForDimension, getDiscourseDimensions}