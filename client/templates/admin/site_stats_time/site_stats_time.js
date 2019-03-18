// Meteor.siteStats.events({
//
// });

Template.siteStatsTime.helpers({
  stats: function() {
    let stats = [];
    stats.push({group_label: 'New users', months: users_over_time()});
    stats.push({group_label: 'New classrooms', months: classrooms_over_time()});
    stats.push({group_label: 'New students', months: students_over_time()});
    stats.push({group_label: 'New observations', months: observations_over_time()});
    stats.push({group_label: 'New sequences', months: sequences_over_time()});
    console.log('stats', stats);
    return stats;
  },
});

let users_over_time = function() {
  return get_grouped_data(Meteor.users.find().fetch(), 'createdAt')

}

let classrooms_over_time = function() {
  return get_grouped_data(Environments.find().fetch(), 'submitted')

}

let students_over_time = function() {
  return get_grouped_data(Subjects.find().fetch(), 'submitted')

}

let observations_over_time = function() {
  return get_grouped_data(Observations.find().fetch(), 'submitted')

}

let sequences_over_time = function() {
  return get_grouped_data(Sequences.find().fetch(), 'submitted')
}


let get_grouped_data = function(data, key) {
  let month_groups = group_by(data, key);
  let stats = [];
  Object.keys(month_groups).forEach(function(month_key) {
    stats.push({
      label: month_key,
      value: month_groups[month_key].length
    })
  })
  return stats;
};

let group_by = function(xs, key) {
  let locale = "en-us";
  return xs.reduce(function(rv, x) {
    let date_month;
    if (!x[key]) {
      date_month = 'Not recorded';
    } else {
      date_month = x[key].toLocaleString(locale, {month: 'long', year: 'numeric'});
    }
    (rv[date_month] = rv[date_month] || []).push(x);
    return rv;
  }, {});
};


function getParamPopularity(parameter_sets) {
  let labels = {}
  for (let pk in parameter_sets) {
    let parameters = parameter_sets[pk]['children'];
    // console.log('parameters')
    for (let i = 0; i < parameters.parameterPairs; i++) {
      if (typeof labels[parameters[`label${i}`]] !== 'undefined') {
        labels[parameters[`label${i}`]]['count']++

        let params = {};
        let param_opts = parameters[`parameter${i}`];
        if (typeof labels[parameters[`label${i}`]]['params'][param_opts] !== 'undefined') {
          labels[parameters[`label${i}`]]['params'][param_opts]++
        }
        else {
          labels[parameters[`label${i}`]]['params'][param_opts] = 1
        }

        // labels[parameters[`label${i}`]]['params'].push(parameters[`parameter${i}`])
      }
      else {
        let params = {};
        params[parameters[`parameter${i}`]] = 1;
        labels[parameters[`label${i}`]] = {
          count: 1,
          params: params
        }
      }
    }
  }
  let ret = [];
  for (let label in labels) {
    let params = []
    for (let param_label in labels[label]['params']) {
      params.push({
        label: param_label,
        count: labels[label]['params'][param_label]
      })
    }
    ret.push({
      label: label,
      count: labels[label]['count'],
      params: params
    })
  }
  console.log('returning', ret);
  return ret;
}