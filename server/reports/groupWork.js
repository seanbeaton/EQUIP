import {getDiscourseDimensions, getObservations} from "../../helpers/graphs";
import {getStudent, getStudents} from "../../helpers/students";
import {getSequences} from "../../helpers/sequences";
import {console_log_conditional, console_table_conditional} from "/helpers/logging"
import {checkAccess} from "../../helpers/access";

Meteor.methods({
  getGroupWorkData: function(parameters, refresh) {
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
      reportType: 'getGroupWorkData',
      parameters_cache_key: parameters_cache_key,
    }, {
      sort: { createdAt : -1 }
    });

    if (!report_data) {
      let start = new Date().getTime();
      report_data = {
        data: createGroupWorkData(parameters),
        createdAt: new Date(),
        reportType: 'getGroupWorkData',
        parameters_cache_key: parameters_cache_key,
        cached: false
      };
      report_data['timeToGenerate'] = new Date().getTime() - start;
      CachedReportData.insert(Object.assign({}, report_data, {cached: true}))
    }
    else {
      report_data['timeToFetch'] = new Date().getTime() - fetch_start;
    }
    console_log_conditional('getGroupWorkData data', report_data);
    return report_data
  },
})

let createGroupWorkData = function(params) {
  let {envId, obsIds} = params

  let observations = getObservations(obsIds);
  let allStudents = getStudents(envId);

  let ret = {
    groups: [],
  };
  let discDims = getDiscourseDimensions(envId);

  ret.groups = observations.map(function(observation) {
    console_log_conditional('observation', observation);
    observation.sequences = getSequences(observation._id, envId);
    // let obs = getObs
    observation.students = observation.small_group.map(function(studId) {
      let student = getStudent(studId, envId);
      student.sequences = observation.sequences.filter(seq => seq.info.student.studentId === student._id);
      student.total_contributions = student.sequences.length;
      student.sorted_contributions = discDims.map(function(dim) {
        // let sequences = student.sequences.filter(seq => console_log_conditional(seq));
        return {
          dim: dim.name,
          option_counts: dim.options.split(',')
            .map(function(opt) {return {name: opt.trim()}})
            .map(function(opt) {
              let filtered_seqs = student.sequences.filter(seq => seq.info.parameters[dim.name] === opt.name);
              // console_log_conditional(opt, filtered_seqs);
              return {
                option: opt.name,
                count: filtered_seqs.length,
                sequences: filtered_seqs
              }
            })
        }
      });
      return student
    });
    return observation
  });

  return ret;
}