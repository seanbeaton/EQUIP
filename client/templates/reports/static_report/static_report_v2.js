
import {setupVis} from '../../../../helpers/timeline';
import {console_log_conditional} from "/helpers/logging"

const obsOptions = new ReactiveVar([]);
const selectedEnvironment = new ReactiveVar(false);
const selectedObservations = new ReactiveVar([]);


const cacheInfo = new ReactiveVar();
const loadingData = new ReactiveVar(false);

Template.staticReport.events({
  'change #env-select': function (e) {

    let selected = $('option:selected', e.target);
    //console_log_conditional('env-select,', selected.val());
    selectedEnvironment.set(selected.val());
    // clearGraph();
    clearObservations();

    Tracker.autorun(() => {
      Meteor.subscribe('envSequences', selectedEnvironment.get());
      Meteor.subscribe('groupEnvSequences', selectedEnvironment.get());
    });


    obsOptions.set(getObsOptions());
    setTimeout(function () {
      setupVis('vis-container', function () {
        $(window).trigger('updated-filters');
      }, obsOptions, selectedObservations, 'whole_class');
    }, 50);

    $('#disc-select').val('');
    $('#demo-select').val('');
    $('#disc-opt-select').val('');
  },
})

Template.staticReport.onCreated(function created() {
  this.autorun(() => {
    this.subscribe('observations');
    this.subscribe('groupObservations');
    this.subscribe('subjects');
    this.subscribe('groupSubjects');
    this.subscribe('subjectParameters');
    this.subscribe('groupSubjectParameters');
    this.subscribe('sequenceParameters');
    this.subscribe('groupSequenceParameters');
    // this.subscribe('sequences');
    // this.subscribe('groupSequences');
    this.subscribe('environments');
    this.subscribe('groupEnvironments');
  })
});

let cached_activeEnvironment = {}
let cached_observations = {}

Template.staticReport.helpers({
  environments: function () {
    let envs = Environments.find().fetch();
    // let default_set = false;
    return envs.map(function (env) {
      if (typeof env.envName === 'undefined') {
        env.envName = 'Loading...';
        env.disabled = 'disabled';
        return env;
      }
      let obsOpts = getObsOptions(env._id);
      //console_log_conditional('obs_opts', obsOpts);
      if (obsOpts.length === 0) {
        env.envName += ' (no observations)';
        env.disabled = 'disabled';
      }

      if (env.userId !== Meteor.userId()) {
        env.envName += ' (shared)';
      }
      return env
    });
  },
  environmentChosen: function () {
    return !!(selectedEnvironment.get());
  },
  activeEnvironment: function () {
    let envId = selectedEnvironment.get();
    if (!cached_activeEnvironment[envId]) {
      cached_activeEnvironment[envId] = Environments.findOne({_id: selectedEnvironment.get()});
    }
    return cached_activeEnvironment[envId]
  },
  observations: function () {
    return getSelectedObservations();
  },
  activeObsIds: function () {
    return selectedObservations.get();
  },
  observationChosen: function () {
    return !!(selectedObservations.get().length)
  },
  cache_info: function () {
    return cacheInfo.get();
  },
  loadingDataClass: function () {
    return loadingData.get();
  },
  totalSequenceCount: function() {
    return getSelectedObservations().reduce((a, b) => a + b.getSequenceCount, 0)
  },
  divRound: function(num, den, round, percent) {
    if (typeof round === 'undefined') {
      round = 2;
    }
    if (typeof percent === 'undefined') {
      percent = false
    }
    const percentMultiplier = (percent) ? 100 : 1;
    return parseFloat((parseFloat(num) / parseFloat(den)) * percentMultiplier).toFixed(round);
  },
  studentActiveInSelection: function(student) {
    return Sequences.find({obsId: {$in: selectedObservations.get()}, 'info.student.studentId': student._id}, {reactive: false}).count() >= 1;
  },
  studentSequenceCountInSelection: function(student) {
    return Sequences.find({obsId: {$in: selectedObservations.get()}, 'info.student.studentId': student._id}, {reactive: false}).count();
  },
});

let getSelectedObservations = function () {
  let obsIds = selectedObservations.get();
  const cache_key = obsIds.sort().join('__');
  // console.log('cache_key', cache_key);
  // console.log('obsIds', obsIds);
  // console.log('cached_observations', cached_observations);
  if (!cached_observations[cache_key]) {
    cached_observations[cache_key] = Observations.find({_id: {$in: obsIds}}, {sort: {observationDate: 1}}, {reactive: false}).fetch();
  }
  return cached_observations[cache_key];
}

let clearObservations = function () {
  selectedObservations.set([]);
  $('.option--observation').removeClass('selected');
};

let getObsOptions = function (envId) {
  if (typeof envId === 'undefined') {
    envId = selectedEnvironment.get();
  }
  if (!!envId) {
    let obs = Observations.find({envId: envId}).fetch();
    return obs;
  }
  else {
    return false;
  }
}

