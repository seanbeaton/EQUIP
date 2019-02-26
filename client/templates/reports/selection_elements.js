let chosen = require('chosen-js');

// Template.dataTypeSelect.helpers({
//   environments: function() {
//     let envs = Environments.find().fetch();
//     // let default_set = false;
//     envs = envs.map(function(env) {
//       let obsOpts = getObsOptions(env._id);
//       //console.log('obs_opts', obsOpts);
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
//       //console.log('obs_opts', obsOpts);
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

Template.environmentSelect.rendered = function(){
  // import '/node_modules/chosen-js/chosen.min.css';
  $('.env-select.chosen-select')
    .filter(':not(.chosen--processed)').addClass('chosen--processed')
    .chosen({disable_search_threshold: 10, width: "300px"});
  // $(".chosen-select").trigger("chosen:updated");   // update chosen to take the updated values into account
};


Template.dataTypeSelect.rendered = function(){
  // import '/node_modules/chosen-js/chosen.min.css';
  $('.dataset.chosen-select')
    .filter(':not(.chosen--processed)').addClass('chosen--processed')
    .chosen({disable_search_threshold: 10, width: "300px"});
  // $(".dataset.chosen-select").trigger("chosen:updated");   // update chosen to take the updated values into account
};


Template.interactiveReport.rendered = function(){
  // import '/node_modules/chosen-js/chosen.min.css';
  $('.param-select-form-item.chosen-select')
    .filter(':not(.chosen--processed)').addClass('chosen--processed')
    .chosen({disable_search_threshold: 10, width: "300px"});
  // $(".param-select-form-item.chosen-select").trigger("chosen:updated");   // update chosen to take the updated values into account
};


Template.demographicHeatmapFilter.rendered = function() {
  $('.filter.chosen-select')
    .filter(':not(.chosen--processed)').addClass('chosen--processed')
    .chosen({disable_search_threshold: 10, width: "250px"});
}

Template.spotlightDiscourseSelect.rendered = function() {
  $('.disc-select-chosen')
    .filter(':not(.chosen--processed)').addClass('chosen--processed')
    .chosen({disable_search_threshold: 10, width: "250px"});
}

Template.heatmapReportSort.rendered = function() {
  console.log('rendered run');
  $('.students-select-sort')
    .trigger('change')
    .filter(':not(.chosen--processed)').addClass('chosen--processed')
    .chosen({disable_search_threshold: 10, width: "250px"});
}

Template.heatmapReportSortDemo.rendered = function() {
  $('.students-select-buckets-demo')
    .trigger('change')
    .filter(':not(.chosen--processed)').addClass('chosen--processed')
    .chosen({disable_search_threshold: 10, width: "250px"});
}

const showDemoSelect = new ReactiveVar(false);
const heatmapReportSortType = new ReactiveVar(false);
const heatmapReportSortDemoChosen = new ReactiveVar(false);
Template.heatmapReportSort.helpers({
  showDemoSelect: function() {
    return showDemoSelect.get()
  }
})

Template.heatmapReportSort.events({
  'change #students-sort': function(e) {
    let selected = $('option:selected', e.target);
    showDemoSelect.set(selected.val() === 'buckets');
    heatmapReportSortType.set(selected.val());
    $(window).trigger('heatmap_student_sort_updated', selected.val())
  }
})
Template.heatmapReportSortDemo.events({
  'change #students-buckets-demo': function(e) {
    let selected = $('option:selected', e.target);
    heatmapReportSortDemoChosen.set(selected.val());
    $(window).trigger('heatmap_student_sort_demo_updated', selected.val())
  }
})

Template.studentSpotlight.helpers({
  arrayify: function(obj) {
    let result = [];
    for (let key in obj) {
      result.push({name:key,value:obj[key]});
    }
    return result;
  },
})

// const selectedSpotlightDimension = new ReactiveVar(false);

// Template.studentSpotlight.events({
//   'change #student-spotlight__discourse-select': function(e) {
//     let selected = $('option:selected', e.target);
//     console.log('this', this);
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

export {heatmapReportSortDemoChosen, heatmapReportSortType}