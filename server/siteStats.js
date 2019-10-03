


CachedStats = new Mongo.Collection('cached_stats');

const total_color = "#F25F3D";
const month_color = "#999999";
let d3 = require('d3');


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

    console.log('cached stats', stats);

    if (!stats) {
      let seq_params = SequenceParameters.find().fetch();
      let subj_params = SubjectParameters.find().fetch();
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

    console.log('cached stats', stats);

    if (!stats) {
      let items = []
      items.push({label: 'Number of users', value: Meteor.users.find().count()});
      items.push({label: 'Number of classrooms', value: Environments.find({isExample: null, envName: {$ne: "Example Classroom"}}).count()});
      items.push({label: 'Number of example classrooms', value: Environments.find({$or: [{isExample: true}, {envName: "Example Classroom"}]}).count()});
      items.push({label: 'Number of students', value: Subjects.find({origStudId: null}).count()});
      items.push({label: 'Number of observations', value: Observations.find({origObsId: null}).count()});
      items.push({label: 'Number of sequences', value: Sequences.find({origObsId: null}).count()});

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
  getStatsTime: function(refresh) {
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

    console.log('cached stats', stats);

    if (!stats) {
      let items = []
      items.push({selector: 'new_users_graph', group_label_prefix: new_total_guide(), group_label: 'users', months: users_over_time()});
      items.push({selector: 'new_classrooms_graph', group_label_prefix: new_total_guide(), group_label: 'classrooms', months: classrooms_over_time()});
      items.push({selector: 'new_students_graph', group_label_prefix: new_total_guide(), group_label: 'students', months: students_over_time()});
      items.push({selector: 'new_observations_graph', group_label_prefix: new_total_guide(), group_label: 'observations', months: observations_over_time()});
      items.push({selector: 'new_sequences_graph', group_label_prefix: new_total_guide(), group_label: 'sequences', months: sequences_over_time()});

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



let users_over_time = function() {
  return get_grouped_data(Meteor.users.find().fetch(), 'createdAt')
}

let classrooms_over_time = function() {
  return get_grouped_data(Environments.find({isExample: null, envName: {$ne: "Example Classroom"}}).fetch(), 'submitted')
}

let students_over_time = function() {
  return get_grouped_data(Subjects.find({origStudId: null}).fetch(), 'submitted')
}

let observations_over_time = function() {
  return get_grouped_data(Observations.find({origObsId: null}).fetch(), 'submitted')
}

let sequences_over_time = function() {
  return get_grouped_data(Sequences.find({origObsId: null}).fetch(), 'submitted')
}


let get_grouped_data = function(data, key) {
  let month_groups = group_by(data, key);
  let stats = [];
  Object.keys(month_groups).forEach(function(month_key) {
    stats.push({
      label: month_key,
      value: month_groups[month_key].length,
      d3date: d3.timeParse('%B %Y')(month_key)
    })
  })
  stats.sort(function(a, b) {
    // console.log('a, b', a , b);
    return (new Date(a.label) - new Date(b.label))
  })

  let running_total = 0;
  stats.forEach(function(stat) {
    running_total += stat.value;
    stat.total = running_total;
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
