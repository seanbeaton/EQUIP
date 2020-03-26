
import {console_log_conditional} from "/helpers/logging"


CachedStats = new Mongo.Collection('cached_stats');

const total_color = "#F25F3D";
const month_color = "#999999";


Meteor.methods({
  getParamPopularity: function(refresh) {
    if (typeof refresh === 'undefined') {
      refresh = false;
    }
    let user = Meteor.user();
    if (!user || !Roles.userIsInRole(user, 'admin', 'site')) {
      throw new Meteor.Error('403', `Access forbidden`);
    }
    const six_hours = 6*60*60*1000;
    const search_time_limit = refresh ? 0 : six_hours;

    let stats = CachedStats.findOne({
      createdAt: {$gte: new Date(new Date().getTime()-search_time_limit)},
      statsType: 'paramPopularity',
    }, {
      sort: { createdAt : -1 }
    });

    if (!stats) {
      let seq_params = SequenceParameters.find({}, {reactive: false}).fetch();
      let subj_params = SubjectParameters.find({}, {reactive: false}).fetch();
      stats = {
        sequences_pop: _getParamPopularity(seq_params),
        demographics_pop: _getParamPopularity(subj_params),
        createdAt: new Date(),
        statsType: 'paramPopularity',
        cached: false
      };
      CachedStats.insert(Object.assign({}, stats, {cached: true}))
    }
    return stats
  },
  getCounts: function(refresh) {
    if (typeof refresh === 'undefined') {
      refresh = false;
    }
    let user = Meteor.user();
    if (!user || !Roles.userIsInRole(user, 'admin', 'site')) {
      throw new Meteor.Error('403', `Access forbidden`);
    }
    const six_hours = 6*60*60*1000;
    const search_time_limit = refresh ? 0 : six_hours;

    let stats = CachedStats.findOne({
      createdAt: {$gte: new Date(new Date().getTime()-search_time_limit)},
      statsType: 'counts',
    }, {
      sort: { createdAt : -1 }
    });


    if (!stats) {
      let items = []
      items.push({label: 'Number of users', value: Meteor.users.find({}, {reactive: false}).count()});
      items.push({label: 'Number of classrooms', value: Environments.find({isExample: null, envName: {$ne: "Example Classroom"}}, {reactive: false}).count()});
      items.push({label: 'Number of example classrooms', value: Environments.find({$or: [{isExample: true}, {envName: "Example Classroom"}]}, {reactive: false}).count()});
      items.push({label: 'Number of students', value: Subjects.find({origStudId: null}, {reactive: false}).count()});
      items.push({label: 'Number of observations', value: Observations.find({origObsId: null}).count()}, {reactive: false});
      items.push({label: 'Number of sequences', value: Sequences.find({origObsId: null}).count()}, {reactive: false});

      stats = {
        stats: items,
        createdAt: new Date(),
        statsType: 'counts',
        cached: false
      };
      CachedStats.insert(Object.assign({}, stats, {cached: true}))
    }
    return stats
  },
  getStatsTime: async function(refresh) {
    if (typeof refresh === 'undefined') {
      refresh = false;
    }

    let user = Meteor.user();
    if (!user || !Roles.userIsInRole(user, 'admin', 'site')) {
      throw new Meteor.Error('403', `Access forbidden`);
    }
    const six_hours = 6*60*60*1000;
    const search_time_limit = refresh ? 0 : six_hours;
    let stats = CachedStats.findOne({
      createdAt: {$gte: new Date(new Date().getTime()-search_time_limit)},
      statsType: 'statsTime',
    }, {
      sort: { createdAt : -1 }
    });

    if (!stats) {
      let items = []
      items.push({selector: 'new_classrooms_graph', group_label_prefix: new_total_guide(), group_label: 'classrooms', months: await classrooms_over_time()});
      items.push({selector: 'new_users_graph', group_label_prefix: new_total_guide(), group_label: 'users', months: await users_over_time()});
      items.push({selector: 'new_students_graph', group_label_prefix: new_total_guide(), group_label: 'students', months: await students_over_time()});
      items.push({selector: 'new_observations_graph', group_label_prefix: new_total_guide(), group_label: 'observations', months: await observations_over_time()});
      items.push({selector: 'new_sequences_graph', group_label_prefix: new_total_guide(), group_label: 'sequences', months: await sequences_over_time()});

      stats = {
        stats: items,
        createdAt: new Date(),
        statsType: 'statsTime',
        cached: false
      };
      CachedStats.insert(Object.assign({}, stats, {cached: true}))
    }
    return stats
  }
})



let new_total_guide = function() {
  return `<span class="key--label"><span class="key--color" style="background-color: ${total_color}"></span><span class="key--text">Total</span></span>/<span class="key--label"><span class="key--color" style="background-color: ${month_color}"></span><span class="key--text">New</span></span>&nbsp;`
}


function _getParamPopularity(parameter_sets) {
  let labels = {}
  for (let pk in parameter_sets) {
    let parameters = parameter_sets[pk]['children'];
    // console_log_conditional('parameters')
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
  console_log_conditional('returning', ret);
  return ret;
}



let users_over_time = function() {
  let search = {};
  let collection = Meteor.users;
  let result = get_grouped_data(search, collection, '$createdAt')
  return result;
}

let classrooms_over_time = function() {
  let search = {isExample: null, envName: {$ne: "Example Classroom"}};
  let collection = Environments;
  let result = get_grouped_data(search, collection, '$submitted')
  return result;
}

let students_over_time = function() {
  let search = {origStudId: null};
  let collection = Subjects;
  let result = get_grouped_data(search, collection, '$submitted')
  return result;
}

let observations_over_time = function() {
  let search = {origObsId: null};
  let collection = Observations;
  let result = get_grouped_data(search, collection, '$submitted')
  return result;
}

let sequences_over_time = function() {
  let search = {origObsId: null};
  let collection = Sequences;
  let result = get_grouped_data(search, collection, '$submitted')
  return result;
}


let get_grouped_data = async function(search, collection, key) {
  let d3 = require('d3');
  const command = [{
    $match: search
  }, {
    $group: {
      _id : { year: { $year: key } , month: { $month: key }},
      count: { $sum: 1 }
    }
  }];
  console_log_conditional('command', command);
  let res = collection.rawCollection().aggregate(command);
  const locale = 'en-us';
  let stats = []
  await res.forEach(function(date_count) {
    let human_month = new Date(`${date_count._id.year}-${date_count._id.month.toString().padStart(2, '0')}-01`).toLocaleString(locale, {timeZone: 'UTC', month: 'long', year: 'numeric'});
    stats.push({
      label: human_month,
      value: date_count.count,
      d3date: d3.timeParse('%B %Y')(human_month)
    })
  })
  stats.sort(function(a, b) {
    return (new Date(a.label) - new Date(b.label))
  });
  let running_total = 0;
  stats.forEach(function(stat) {
    running_total += stat.value;
    stat.total = running_total;
  });

  return stats;
};