import {getStudents} from "../../helpers/students";
import {getSequences} from "../../helpers/sequences";
import {getObservations} from "../../helpers/graphs";
import {console_log_conditional} from "/helpers/logging"
import {setupSubjectParameters} from "../../helpers/parameters";
import {checkAccess} from "../../helpers/access";


Meteor.methods({
  getHeatmapData: function(parameters, refresh) {
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
      reportType: 'getHeatmapData',
      parameters_cache_key: parameters_cache_key,
    }, {
      sort: { createdAt : -1 }
    });

    if (!report_data) {
      let start = new Date().getTime();
      report_data = {
        data: createHeatmapData(parameters),
        createdAt: new Date(),
        reportType: 'getHeatmapData',
        parameters_cache_key: parameters_cache_key,
        cached: false
      };
      report_data['timeToGenerate'] = new Date().getTime() - start;
      CachedReportData.insert(Object.assign({}, report_data, {cached: true}))
    }
    else {
      report_data['timeToFetch'] = new Date().getTime() - fetch_start;
    }
    console_log_conditional('getHeatmapData data', report_data);
    return report_data
  },
})

let createHeatmapData = function(params) {
  let {envId, obsIds, selectedDemo, heatmapReportSortType} = params

  let ret = {
    contributions_dataset: []
  };

  let allStudents = getStudents(envId);

  ret.limit_x = 0;
  ret.limit_y = 0;
  ret.contributions_dataset = allStudents.map(function(student) {
    if (ret.limit_y > student.data_y) {
      ret.limit_y = student.data_y
    }
    if (ret.limit_x > student.data_x) {
      ret.limit_x = student.data_x
    }
    return {
      name: student.info.name,
      studentId: student._id,
      class: '',
      student: student,
      data_x: student.data_x,
      data_y: student.data_y,
      count: 0,
      show_count: true,
      sort_first: false,
    }
  });

  allStudents.map(function(student) {
    for (let obsId_k in obsIds) {

      if (!obsIds.hasOwnProperty(obsId_k)) continue;
      let obsId = obsIds[obsId_k];

      let sequences = getSequences(obsId, envId);
      for (let sequence_k in sequences) {
        if (!sequences.hasOwnProperty(sequence_k)) continue;
        let sequence = sequences[sequence_k];
        let ds_index = ret.contributions_dataset.findIndex(datapoint => datapoint.studentId === student._id);
        if (sequence.info.student.studentId === student._id) {
          ret.contributions_dataset[ds_index].count += 1;
        }
      }
    }
  });


  let highest_count = ret.contributions_dataset.reduce((acc, student) => student.count > acc ? student.count : acc, 1);
  // let highest_count = ret.contributions_dataset.map(student => student.count).reduce((acc, student) => student > acc ? student : acc, 0)
  ret.contributions_dataset = ret.contributions_dataset.map(function(datum) {
    datum.quintile = Math.ceil(datum.count * 4 / highest_count);
    return datum
  });

  // if (heatmapReportSortType.get() === 'quintiles') {
  //   let sortQuintiles = function(a, b) {
  //     return a.quintile - b.quintile;
  //   }
  //   ret.contributions_dataset.sort(sortQuintiles)
  // }
  // else
  if (heatmapReportSortType === 'buckets') {
    let selected_demo_options = setupSubjectParameters(envId).filter(d => d.name === selectedDemo)[0];
    let opts;
    if (selected_demo_options) {
      opts = selected_demo_options.options.split(',').map(function(opt) {return {name: opt.trim()}});
    }
    else {
      opts = [];
    }
    ret.contributions_dataset = ret.contributions_dataset.map(datum => {datum.selected_demo_value = datum.student.info.demographics[selectedDemo]; return datum})

    opts.map(opt => ret.contributions_dataset.push({
      name: opt.name,
      studentId: opt.name + '-label',
      selected_demo_value: opt.name,
      class: opt.name + '-label demo-label',
      student: {},
      data_x: 0,
      data_y: 0,
      count: 0,
      show_count: false,
      sort_first: true,
    }));



    let sortDemo = function(a, b) {
      let a_demo = a.selected_demo_value;
      let b_demo = b.selected_demo_value;
      if (a_demo > b_demo) {
        return 1
      }
      else if (a_demo === b_demo) {
        // return b.sort_first - a.sort_first;
        if (a.sort_first) {
          return -1;
        }
        else if (b.sort_first) {
          return 1
        }
        else {
          return b.count - a.count;
        }
      }
      else {
        return -1
      }
    };
    ret.contributions_dataset = ret.contributions_dataset.sort(sortDemo);
  }

  return ret
};
