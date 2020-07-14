import {getStudents} from "../../helpers/students";
import {get_average, get_median} from "../../helpers/graphs";
import {console_log_conditional, console_table_conditional} from "/helpers/logging"
import {checkAccess} from "../../helpers/access";


Meteor.methods({
  getHistogramData: function(parameters, refresh) {
    checkAccess(parameters.envId, 'environment', 'view');
    console_log_conditional(parameters, refresh)
    if (typeof refresh === 'undefined') {
      refresh = false;
    }
    let user = Meteor.user();

    const parameters_cache_key = JSON.stringify(parameters);
    const one_hour = 1*60*60*1000;
    const search_time_limit = refresh ? 0 : one_hour;

    let fetch_start = new Date().getTime();
    let report_data = CachedReportData.findOne({
      createdAt: {$gte: new Date(new Date().getTime()-search_time_limit)},
      reportType: 'getHistogramData',
      parameters_cache_key: parameters_cache_key,
    }, {
      sort: { createdAt : -1 }
    });

    if (!report_data) {
      let start = new Date().getTime();
      report_data = {
        data: createHistogramData(parameters),
        createdAt: new Date(),
        reportType: 'getHistogramData',
        parameters_cache_key: parameters_cache_key,
        cached: false
      };
      report_data['timeToGenerate'] = new Date().getTime() - start;
      CachedReportData.insert(Object.assign({}, report_data, {cached: true}))
    }
    else {
      report_data['timeToFetch'] = new Date().getTime() - fetch_start;
    }
    console_log_conditional('getHistogramData data', report_data);
    return report_data
  },
})

let createHistogramData = function(params) {
  let {envId, obsIds} = params
  let ret = {
    students: [],
    // groups: []
  };

  let allStudents = Subjects.find({envId: envId}).fetch()

  ret.students = allStudents.map(function(student) {
    return {
      name: student.info.name,
      studentId: student._id,
      class: '',
      student: student,
      count: 0,
      show_count: true,
      sort_first: false,
    }
  });

  for (let obsId_k in obsIds) {
    if (!obsIds.hasOwnProperty(obsId_k)) continue;
    let obsId = obsIds[obsId_k];

    Sequences.find({obsId: obsId}).forEach(function(sequence) {
      allStudents.map(function(student) {
        if (sequence.info.student.studentId === student._id) {
          let ds_index = ret.students.findIndex(datapoint => datapoint.studentId === student._id);
          ret.students[ds_index].count += 1;
        }
      });
    });
  }

  let all_counts = ret.students.map(d => d.count);
  ret.median = get_median(all_counts);
  ret.average = get_average(all_counts);
  ret.quartiles = get_n_groups(all_counts, 4, true, 'Group'); //quartiles
  ret.students.forEach(function(student) {
    student.median = get_median(all_counts);
    student.average = get_average(all_counts);
  })

  ret.quartiles.forEach(function(quartile) {
    quartile.students = ret.students.filter(function(student) {
      return quartile.min_exclusive < student.count && student.count <= quartile.max_inclusive
    }).sort((a, b) => b.count - a.count)
  })

  console_table_conditional(ret.students);
  console_table_conditional(ret.quartiles);

  return ret
}

// let get_ntiles = function(values, n, zero_separate, ntile_name) {
//   if (typeof ntile_name === 'undefined') {
//     ntile_name = n + '-tile';
//   }
//   let ret = []
//   if (zero_separate) {
//     ret.push({
//       name: 'No contributions',
//       min_exclusive: -1,
//       max_inclusive: 0,
//     })
//   }
//
//   let max_value = Math.max(...values);
//   if (n > max_value) {
//     n = max_value;
//   }
//   let group_size = values.length / n;
//   let min = -1;
//   if (zero_separate) {
//     min = 0
//   }
//   for (let i = 1; i <= n; i++) {
//     let index = Math.min(Math.round(i * group_size), values.length - 1)
//     let max = values[index];
//     ret.push({
//       name: get_ordinal_suffix(i) + '&nbsp;' + ntile_name,
//       min_exclusive: min,
//       max_inclusive: max
//     });
//     min = max;
//   }
//   return ret;
// }

let get_n_groups = function(values, n, zero_separate, group_name) {
  if (typeof group_name === 'undefined') {
    group_name = n + ' group';
  }
  let ret = []
  if (zero_separate) {
    ret.push({
      name: 'No contributions',
      min_exclusive: -1,
      max_inclusive: 0,
    })
  }

  if (n > Math.max(...values)) {
    n = Math.max(...values);
  }

  let step = Math.max(...values) / n;

  let min = 0;
  let max;
  console_log_conditional('values, ', values)
  console_log_conditional('step, ', step)
  for (let i = 1; i <= n; i++) {
    console_log_conditional('i', i);
    max = Math.ceil(step * i);
    console_log_conditional('min and max', min, max);
    let name = get_ordinal_suffix(i) + '&nbsp;' + group_name + "&nbsp;(n&nbsp;=&nbsp;";
    if ((min + 1) !== max) {
      name += (min + 1) + "&nbsp;to&nbsp;" + max + ")";
    }
    else {
      name += max + ")"
    }
    ret.push({
      name: name,
      min_exclusive: min,
      max_inclusive: max
    });
    min = max;
  }

  console_log_conditional('rett', ret);
  return ret;
}

let get_ordinal_suffix = function(i) {
  let j = i % 10,
    k = i % 100;

  if (j === 1 && k !== 11) {
    return i + "st";
  }
  if (j === 2 && k !== 12) {
    return i + "nd";
  }
  if (j === 3 && k !== 13) {
    return i + "rd";
  }
  return i + "th";
}
