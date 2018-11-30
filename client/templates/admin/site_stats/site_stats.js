// Meteor.siteStats.events({
//
// });

Template.siteStats.helpers({
  stats: function() {
    let stats = [];
    stats.push({label: 'Number of users', value: Meteor.users.find().count()});
    stats.push({label: 'Number of classrooms', value: Environments.find().count()});
    stats.push({label: 'Number of students', value: Environments.find().count()});
    stats.push({label: 'Number of observations', value: Observations.find().count()});
    stats.push({label: 'Number of sequences', value: Sequences.find().count()});

    console.log('stats', stats);
    return stats;
  },
  demographic_popularities: function() {
    return getParamPopularity(SubjectParameters.find().fetch());
  },
  discourse_param_popularities: function() {
    return getParamPopularity(SequenceParameters.find().fetch());
  }

});


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