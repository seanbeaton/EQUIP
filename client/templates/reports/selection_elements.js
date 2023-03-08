let chosen = require('chosen-js');
import {console_log_conditional} from "/helpers/logging"
import {obsTypeAbbrev} from "/helpers/timeline"


let handleChosenUpdates = function (e) {
  if (e.target.tagName.toLowerCase() === "select") {
    $(e.target).trigger("chosen:updated");
  }
  else if (e.target.tagName.toLowerCase() === "option") {
    $(e.target).parents('select').trigger("chosen:updated");
  }
}

// Template.dataTypeSelect.helpers({
//   environments: function() {
//     let envs = Environments.find().fetch();
//     // let default_set = false;
//     envs = envs.map(function(env) {
//       let obsOpts = getObsOptions(env._id);
//       //console_log_conditional('obs_opts', obsOpts);
//       if (obsOpts.length === 0) {
//         env.envName += ' (no observations)';
//         env.disabled = 'disabled';
//       }
//       else if (obsOpts.length < 2) {
//         env.envName += ' (' + obsOpts.length + ')';
//         env.disabled = 'disabled';
//       }
//       // else if (!default_set) {
//       // default_set = true;
//       // env.default = 'selected';
//       // }
//       return env
//     });
//     return envs;
//   },
// })
//
// Template.environmentSelect.helpers({
//   environments: function() {
//     let envs = Environments.find().fetch();
//     // let default_set = false;
//     envs = envs.map(function(env) {
//       let obsOpts = getObsOptions(env._id);
//       //console_log_conditional('obs_opts', obsOpts);
//       if (obsOpts.length === 0) {
//         env.envName += ' (no observations)';
//         env.disabled = 'disabled';
//       }
//       else if (obsOpts.length < 2) {
//         env.envName += ' (' + obsOpts.length + ')';
//         env.disabled = 'disabled';
//       }
//       // else if (!default_set) {
//       // default_set = true;
//       // env.default = 'selected';
//       // }
//       return env
//     });
//     return envs;
//   },
// });

Template.environmentSelect.events({
  'DOMSubtreeModified select.chosen-select': handleChosenUpdates,
})
Template.environmentSelect.rendered = function () {
  // import '/node_modules/chosen-js/chosen.min.css';
  $('.env-select.chosen-select')
    .filter(':not(.chosen--processed)').addClass('chosen--processed')
    .chosen({disable_search_threshold: 10, width: "300px"});


  setTimeout(() => {
    $('#env-select').trigger('change');
    //todo make each report look at the default
  }, 1000)

  // $(".chosen-select").trigger("chosen:updated");   // update chosen to take the updated values into account
};

Template.environmentSelectV2.onCreated(function created() {

})

Template.environmentSelectV2.events({
  'change #env-selectv2': function(e, instance) {
    this.envSelectParams.setSelectedEnvironment(instance.$(e.target).val())
    this.envSelectParams.environmentSelectCallback()
  }
})
Template.dataTypeSelectV2.onCreated(function created() {

})

Template.dataTypeSelectV2.events({
  'change #dataset-type-selectv2': function(e, instance) {
    this.dataTypeSelectParams.setSelectedDatasetType(instance.$(e.target).val())
    this.dataTypeSelectParams.datasetSelectCallback()
  }
})

Template.visObservationsSelector.onCreated(function created() {

})

Template.visObservationsSelector.onRendered(function created() {
  this.autorun(() => {
    import vis from "vis";

    let visParams = this.data.visSetupParams;
    console.log('this', this)
    let observations = visParams.obsOptions;

    if (!observations) {
      return;
    }

    let disabled = function (obs) {
      return !(visParams.visClassType === 'all' || visParams.visClassType === obs.observationType)
    }

    let disabled_class = function (obs) {
      return disabled(obs) ? 'disabled' : '';
    }

    let all_observations = observations.map(function (obs) {
      return {
        id: obs._id,
        content: obs.name + ' (' + obs.observationDate + ' - ' + obsTypeAbbrev(obs.observationType) + ')',
        compare_date: new Date(obs.observationDate),
        start: obs.observationDate,
        className: disabled_class(obs),
        disabled: disabled(obs)
      }
    })

    let items = new vis.DataSet(all_observations);
    let $container = this.$('#vis-container');
    $container.removeClass('vis-container-select-all-processed').html('');
    this.$('.vis-select-all').remove();

    let options = {
      multiselect: true,
      zoomable: false,
      zoomMin: 7 * 24 * 60 * 60 * 1000, // 1 week in ms
    }
    let timeline = new vis.Timeline($container[0], items, options)

    timeline.on('select',  (props) => {
      if (props.event.firstTarget.classList.contains('vis-group')) {
        timeline.setSelection(visParams.selectedObservationIds);
        return;
      }
      if (props.items.length > 1) {
        visParams.setSelectedObservationIds(props.items);
      }
      else {
        let currentObs = visParams.selectedObservationIds;
        let obsIndex = currentObs.indexOf(props.items[0])
        if (obsIndex === -1) {
          currentObs.push(props.items[0])
        }
        else {
          currentObs.splice(obsIndex, 1)
        }
        visParams.setSelectedObservationIds(currentObs);
        timeline.setSelection(currentObs);
      }

      visParams.visSelectionCallback()
    });

    let recent_obs = all_observations.sort(function (a, b) {
      return a.compare_date - b.compare_date
    }).slice(-8);
    let recent_obs_ids = recent_obs.map(obs => obs.id);
    timeline.focus(recent_obs_ids);

    let select_all_button = $('<a class="vis-select-all" href="#">Select All Observations</a>')
    select_all_button.on('click', (e) => {
      e.preventDefault();
      let valid_observation_ids = all_observations.filter(o => !o.disabled).map(o => o.id);
      if (visParams.selectedObservationIds.length === valid_observation_ids.length) {
        timeline.setSelection([])
        visParams.setSelectedObservationIds([])
      }
      else {
        timeline.setSelection(valid_observation_ids)
        visParams.setSelectedObservationIds(valid_observation_ids)
      }
      visParams.visSelectionCallback()
    })
    $container
      .filter(':not(.vis-container-select-all-processed)')
      .addClass('vis-container-select-all-processed')
      .after(select_all_button)

    return timeline
  })
})

Template.visObservationsSelector.events({
  // 'change #dataset-type-selectv2': function(e, instance) {
  //   this.dataTypeSelectParams.setSelectedDatasetType(instance.$(e.target).val())
  // }
})

Template.timelineReport.events({
  'DOMSubtreeModified select.chosen-select': handleChosenUpdates,
})
Template.timelineReport.rendered = function () {
  $('.timeline-param-select.chosen-select')
    .filter(':not(.chosen--processed)').addClass('chosen--processed')
    .chosen({disable_search_threshold: 10, width: "300px"});
  // $(".param-select-form-item.chosen-select").trigger("chosen:updated");   // update chosen to take the updated values into account
};

Template.dataTypeSelect.events({
  'DOMSubtreeModified select.chosen-select': handleChosenUpdates,
})
Template.dataTypeSelect.rendered = function () {
  // import '/node_modules/chosen-js/chosen.min.css';
  $('.dataset.chosen-select')
    .filter(':not(.chosen--processed)').addClass('chosen--processed')
    .chosen({disable_search_threshold: 10, width: "300px"});
  // $(".dataset.chosen-select").trigger("chosen:updated");   // update chosen to take the updated values into account
};


Template.interactiveReport.events({
  'DOMSubtreeModified select.chosen-select': handleChosenUpdates,
})
Template.interactiveReport.rendered = function () {
  // import '/node_modules/chosen-js/chosen.min.css';
  $('.param-select-form-item.chosen-select')
    .filter(':not(.chosen--processed)').addClass('chosen--processed')
    .chosen({disable_search_threshold: 10, width: "300px"});
  // $(".param-select-form-item.chosen-select").trigger("chosen:updated");   // update chosen to take the updated values into account
};


Template.groupWorkDiscSelect.events({
  'DOMSubtreeModified select.chosen-select': handleChosenUpdates,
})
Template.groupWorkDiscSelect.rendered = function () {
  $('.group-work-report__graph-disc-select .chosen-select')
    .filter(':not(.chosen--processed)').addClass('chosen--processed')
    .chosen({disable_search_threshold: 10, width: "300px"});
  // $(".param-select-form-item.chosen-select").trigger("chosen:updated");   // update chosen to take the updated values into account
}


Template.demographicHeatmapFilter.events({
  'DOMSubtreeModified select.chosen-select': handleChosenUpdates,
})
Template.demographicHeatmapFilter.rendered = function () {
  $('.filter.chosen-select')
    .filter(':not(.chosen--processed)').addClass('chosen--processed')
    .chosen({disable_search_threshold: 10, width: "240px", placeholder_text_multiple: "Choose Multiple Options"});
}


Template.spotlightDiscourseSelect.events({
  'DOMSubtreeModified select.chosen-select': handleChosenUpdates,
})
Template.spotlightDiscourseSelect.rendered = function () {
  $('.disc-select-chosen')
    .filter(':not(.chosen--processed)').addClass('chosen--processed')
    .chosen({disable_search_threshold: 10, width: "250px"});
}


Template.heatmapReportSort.events({
  'DOMSubtreeModified select.chosen-select': handleChosenUpdates,
})
Template.heatmapReportSort.rendered = function () {
  console_log_conditional('rendered run');
  $('.students-select-sort')
    .trigger('change')
    .filter(':not(.chosen--processed)').addClass('chosen--processed')
    .chosen({disable_search_threshold: 10, width: "300px", placeholder_text_multiple: "Choose Multiple Options"});
}


Template.heatmapReportSortDemo.events({
  'DOMSubtreeModified select.chosen-select': handleChosenUpdates,
})
Template.heatmapReportSortDemo.rendered = function () {
  $('.students-select-buckets-demo')
    .trigger('change')
    .filter(':not(.chosen--processed)').addClass('chosen--processed')
    .chosen({disable_search_threshold: 10, width: "240px", placeholder_text_multiple: 'Choose Multiple Options'});
}


Template.histogramDemoSelect.events({
  'DOMSubtreeModified select.chosen-select': handleChosenUpdates,
})
Template.histogramDemoSelect.rendered = function () {
  $('.' + this.data.class_prefix + '-demographic-chosen')
    .trigger('change')
    .filter(':not(.chosen--processed)').addClass('chosen--processed')
    .chosen({disable_search_threshold: 10, width: "240px", placeholder_text_multiple: 'Choose Multiple Options'});
}

const showDemoSelect = new ReactiveVar(false);
const heatmapReportSortType = new ReactiveVar(false);
const heatmapReportSortDemoChosen = new ReactiveVar(false);
Template.heatmapReportSort.helpers({
  showDemoSelect: function () {
    return showDemoSelect.get()
  }
})


Template.heatmapReportSort.events({
  'DOMSubtreeModified select.chosen-select': handleChosenUpdates,
})
Template.heatmapReportSort.events({
  'change #students-sort': function (e) {
    let selected = $('option:selected', e.target);
    showDemoSelect.set(selected.val() === 'buckets');
    heatmapReportSortType.set(selected.val());
    $(window).trigger('heatmap_student_sort_updated', selected.val())
  }
})


Template.heatmapReportSortDemo.events({
  'DOMSubtreeModified select.chosen-select': handleChosenUpdates,
})
Template.heatmapReportSortDemo.events({
  'change #students-buckets-demo': function (e) {
    let selected = $('option:selected', e.target);
    heatmapReportSortDemoChosen.set(selected.val());
    $(window).trigger('heatmap_student_sort_demo_updated', selected.val())
  }
})


Template.studentSpotlight.events({
  'DOMSubtreeModified select.chosen-select': handleChosenUpdates,
})
Template.studentSpotlight.helpers({
  arrayify: function (obj) {
    let result = [];
    for (let key in obj) {
      result.push({name: key, value: obj[key]});
    }
    return result;
  },
})

// const selectedSpotlightDimension = new ReactiveVar(false);

// Template.studentSpotlight.events({
//   'change #student-spotlight__discourse-select': function(e) {
//     let selected = $('option:selected', e.target);
//     console_log_conditional('this', this);
//     selectedSpotlightDimension.set(selected.val());
//     updateStudentContribGraph();
//     updateStudentTimeGraph();
//   },
// })
//
// let getObsOptions = function(envId) {
//   if (!!envId) {
//     let obs = Observations.find({envId: envId}).fetch();
//     return Observations.find({envId: envId}).fetch();
//   }
//   else {
//     return false;
//   }
// }


export {heatmapReportSortDemoChosen, heatmapReportSortType, handleChosenUpdates}
