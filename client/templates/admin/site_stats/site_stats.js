// Meteor.siteStats.events({
//
// });
import {console_log_conditional} from "/helpers/logging"


let demographic_popularities = new ReactiveVar([]);
let discourse_param_popularities = new ReactiveVar([]);
let param_stat_gen_time = new ReactiveVar('');
let stat_gen_time = new ReactiveVar('');
let stats = new ReactiveVar([]);

Template.siteStats.helpers({
  stats: function() {
    return stats.get();
  },
  demographic_popularities: function() {
    return demographic_popularities.get()
  },
  discourse_param_popularities: function() {
    return discourse_param_popularities.get()
  },
  param_stat_gen_time: function() {
    return param_stat_gen_time.get();
  },
  stat_gen_time: function() {
    return stat_gen_time.get()
  }
});


Template.siteStats.onRendered(function() {
  Meteor.call('getCounts', function(err, res) {
    if (!err) {
      console_log_conditional('res', res);
      stats.set(res.stats);
      stat_gen_time.set(res.createdAt.toLocaleString());
    }
  });
  Meteor.call('getParamPopularity', function(err, res) {
    if (!err) {
      console_log_conditional('res', res);
      demographic_popularities.set(res.demographics_pop);
      discourse_param_popularities.set(res.sequences_pop);
      param_stat_gen_time.set(res.createdAt.toLocaleString());
    }
  });
})