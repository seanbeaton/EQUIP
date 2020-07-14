import {getObservations} from "../../helpers/graphs";
import {console_log_conditional} from "/helpers/logging"
import {checkAccess} from "../../helpers/access";


Meteor.methods({
  getTimelineData: function(parameters, refresh) {
    checkAccess(parameters.envId, 'environment', 'view');
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
      reportType: 'getTimelineData',
      parameters_cache_key: parameters_cache_key,
    }, {
      sort: { createdAt : -1 }
    });

    if (!report_data) {
      let start = new Date().getTime();
      report_data = {
        data: createTimelineData(parameters),
        createdAt: new Date(),
        reportType: 'getTimelineData',
        parameters_cache_key: parameters_cache_key,
        cached: false,
        timeTofetch: false,
      };
      report_data['timeToGenerate'] = new Date().getTime() - start;
      CachedReportData.insert(Object.assign({}, report_data, {cached: true}))
    }
    else {
      report_data['timeToFetch'] = new Date().getTime() - fetch_start;
    }
    console_log_conditional('getTimelineData data', report_data);
    return report_data
  },
})

let createTimelineData = function(params) {
  let d3 = require('d3');

  console_log_conditional('params', params);
  let ret = {
    contributions_dataset: []
  };

  let envId = params.envId;
  let obsIds = params.obsIds;
  let demo = params.demo;
  let dimension = params.dimension;
  let option = params.option;
  let allStudents = params.allStudents;
  let demo_opts = params.demo_opts;
  let selectedObservations = params.selectedObservations;

  let students_by_demo = demo_opts.map(function(demo_opt) {
    //console_log_conditional('demo_opt', demo_opt);
    return {
      label: demo_opt,
      count: 0
    };
  });


  let start_1 = new Date().getTime();

  allStudents.forEach(function(student) {
    let demoCountIndex = students_by_demo.findIndex(demoopt => demoopt.label === student.info.demographics[demo])
    students_by_demo[demoCountIndex].count++;
  });

  // console.log(new Date().getTime() - start_1, 'start_1')
  // let start_2 = new Date().getTime();

  // console.log('students_by_demo', students_by_demo);
  students_by_demo.forEach(function(demographic) {
    demographic.percent = demographic.count / students_by_demo.reduce((t, d) => d.count + t, 0)
  });


  // console.log(new Date().getTime() - start_2, 'start_2')
  // let start_3 = new Date().getTime();

  let obsers = getObservations(selectedObservations);
  obsIds.forEach(function(obsId) {
    if (!ret.contributions_dataset.find(datapoint => datapoint.obsId === obsId)) {
      // If it wasn't there:
      let obs = obsers.find(obs => obs._id === obsId);
      let parseTime = d3.timeParse('%Y-%m-%d');
      let datapoint = {
        obsId: obsId,
        d3date: parseTime(obs.observationDate),
        obsName: obs.name,
        date: obs.observationDate,
        studentsByDemo: students_by_demo,
        _total: 0,
      };

      demo_opts.forEach(function (opt) {
        datapoint[opt] = 0
      });

      ret.contributions_dataset.push(datapoint)
    }

    Sequences.find({obsId: obsId}).forEach(function(sequence) {
      let seqDemoOption = sequence.info.student.demographics[demo];

      let ds_index = ret.contributions_dataset.findIndex(datapoint => datapoint.obsId === obsId);

      if (sequence.info.parameters[dimension] === option) {
        ret.contributions_dataset[ds_index]._total += 1;
        ret.contributions_dataset[ds_index][seqDemoOption] += 1;
      }

    });
  });


  // console.log(new Date().getTime() - start_3, 'start_3')
  // let start_4 = new Date().getTime();

  ret.equity_dataset = [];

  ret.equity_dataset = ret.contributions_dataset.map(function(observation) {
    let obs_equity = {
      _total: 1,
      obsId: observation.obsId,
      obsName: observation.obsName,
      d3date: observation.d3date,
      date: observation.date,
      studentsByDemo: students_by_demo,
      contribsByDemo: [],
    }
    demo_opts.forEach(function(demo_opt) {
      let percent_of_contribs = observation[demo_opt] / observation._total;
      if (isNaN(percent_of_contribs)) {
        percent_of_contribs = 0;
      }

      obs_equity.contribsByDemo.push({
        label: demo_opt,
        percent: percent_of_contribs,
        count: observation[demo_opt],
        total: observation._total
      });
      let percent_of_students = students_by_demo.find(demo => demo.label === demo_opt).percent;
      if (isNaN(percent_of_students)) {
        percent_of_students = 0;
      }

      if (percent_of_students === 0) {
        obs_equity[demo_opt] = 0;
      }
      else {
        let equity_ratio = percent_of_contribs / percent_of_students;
        obs_equity[demo_opt] = isNaN(equity_ratio) ? 0 : equity_ratio;
      }
    });
    return obs_equity
  })

  // console.log(new Date().getTime() - start_4, 'start_4')
  // let start_5 = new Date().getTime();

  ret.contributions_dataset.forEach(function(obs) {
    let vals = demo_opts.map(demo_opt => obs[demo_opt]);
    obs.max = Math.max.apply(null, vals);
  });
  ret.equity_dataset.forEach(function(obs) {
    let vals = demo_opts.map(demo_opt => obs[demo_opt]);
    obs.max = Math.max.apply(null, vals);
  })

  // console.log(new Date().getTime() - start_5, 'start_5')

  return ret
}

