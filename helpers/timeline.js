
/*
  visContainerId is a string, the css id of the container for the vis timeline.

  selectionCallback is a function to be called when the
  observation selection changes.

  obsOptions is a ReactiveVar that contains all available observations.

  selectedObservations is a ReactiveVar that will be updated with
  the currently active observations per the timeline.
 */
import {getSequences} from "./sequences";
import vis from "vis";

let setupVis = function(visContainerId, selectionCallback, obsOptions, selectedObservations) {
  let observations = obsOptions.get();
  let obs = observations.map(function(obs) {
    return {
      id: obs._id,
      content: obs.name + ' (' + obs.observationDate + ')',
      compare_date: new Date(obs.observationDate),
      start: obs.observationDate,
      className: getSequences(obs._id, obs.envId).length < 1 ? 'disabled' : ''
    }
  })
  let items = new vis.DataSet(obs);
  let container = document.getElementById(visContainerId);
  $(container).html('');
  let options = {
    multiselect: true,
    zoomable: false,
  }
  let timeline = new vis.Timeline(container, items, options)

  timeline.on('select', function(props) {
    if (props.event.firstTarget.classList.contains('vis-group')) {
      timeline.setSelection(selectedObservations.get());
      return;
    }
    if (props.items.length > 1) {
      selectedObservations.set(props.items);
    } else {
      let currentObs = selectedObservations.get();
      let obsIndex = currentObs.indexOf(props.items[0])
      if (obsIndex === -1) {
        currentObs.push(props.items[0])
      }
      else {
        currentObs.splice(obsIndex, 1)
      }
      selectedObservations.set(currentObs);
      timeline.setSelection(currentObs);
    }

    selectionCallback()
  });

  let recent_obs = obs.sort(function(a, b) {return a.compare_date - b.compare_date}).slice(-8);
  let recent_obs_ids = recent_obs.map(obs => obs.id);
  timeline.focus(recent_obs_ids);

  return timeline
}

export {setupVis}