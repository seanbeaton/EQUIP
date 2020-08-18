import {createStudentContribData, createStudentTimeData} from "../../helpers/graphs";
import {console_log_conditional} from "/helpers/logging"
import {checkAccess} from "../../helpers/access";

CachedReportData = new Mongo.Collection('cached_report_data');

Meteor.methods({
  getStudentContribData: function (parameters, refresh) {
    checkAccess(parameters.envId, 'environment', 'view');
    console_log_conditional(parameters, refresh)
    if (typeof refresh === 'undefined') {
      refresh = false;
    }
    let user = Meteor.user();

    const parameters_cache_key = JSON.stringify(parameters);
    const one_hour = 1 * 60 * 60 * 1000;
    const search_time_limit = refresh ? 0 : one_hour;

    let fetch_start = new Date().getTime();
    let report_data = CachedReportData.findOne({
      createdAt: {$gte: new Date(new Date().getTime() - search_time_limit)},
      reportType: 'getStudentContribData',
      parameters_cache_key: parameters_cache_key,
    }, {
      sort: {createdAt: -1}
    });

    if (!report_data) {
      let start = new Date().getTime();
      report_data = {
        data: createStudentContribData(parameters),
        createdAt: new Date(),
        reportType: 'getStudentContribData',
        parameters_cache_key: parameters_cache_key,
        cached: false
      };
      report_data['timeToGenerate'] = new Date().getTime() - start;
      CachedReportData.insert(Object.assign({}, report_data, {cached: true}))
    }
    else {
      report_data['timeToFetch'] = new Date().getTime() - fetch_start;
    }
    console_log_conditional('getStudentContribData data', report_data);
    return report_data
  },

  getObsSequences: function (parameters, refresh) {
    checkAccess(parameters.envId, 'environment', 'view');
    console_log_conditional(parameters, refresh)
    if (typeof refresh === 'undefined') {
      refresh = false;
    }
    let user = Meteor.user();

    const parameters_cache_key = JSON.stringify(parameters);
    const one_hour = 1 * 60 * 60 * 1000;
    const search_time_limit = refresh ? 0 : one_hour;

    let fetch_start = new Date().getTime();
    let report_data = CachedReportData.findOne({
      createdAt: {$gte: new Date(new Date().getTime() - search_time_limit)},
      reportType: 'getObsSequences',
      parameters_cache_key: parameters_cache_key,
    }, {
      sort: {createdAt: -1}
    });

    if (!report_data) {
      let start = new Date().getTime();
      report_data = {
        data: getSequencesForObs(parameters),
        createdAt: new Date(),
        reportType: 'getObsSequences',
        parameters_cache_key: parameters_cache_key,
        cached: false
      };
      report_data['timeToGenerate'] = new Date().getTime() - start;
      CachedReportData.insert(Object.assign({}, report_data, {cached: true}))
    }
    else {
      report_data['timeToFetch'] = new Date().getTime() - fetch_start;
    }
    // console_log_conditional('getObsSequences data', report_data);
    return report_data
  },
  getStudentTimeData: function (parameters, refresh) {
    checkAccess(parameters.envId, 'environment', 'view');
    console_log_conditional(parameters, refresh)
    if (typeof refresh === 'undefined') {
      refresh = false;
    }
    let user = Meteor.user();

    const parameters_cache_key = JSON.stringify(parameters);
    const one_hour = 1 * 60 * 60 * 1000;
    const search_time_limit = refresh ? 0 : one_hour;

    let fetch_start = new Date().getTime();
    let report_data = CachedReportData.findOne({
      createdAt: {$gte: new Date(new Date().getTime() - search_time_limit)},
      reportType: 'getStudentTimeData',
      parameters_cache_key: parameters_cache_key,
    }, {
      sort: {createdAt: -1}
    });

    if (!report_data) {
      let start = new Date().getTime();
      report_data = {
        data: createStudentTimeData(parameters),
        createdAt: new Date(),
        reportType: 'getStudentTimeData',
        parameters_cache_key: parameters_cache_key,
        cached: false
      };
      report_data['timeToGenerate'] = new Date().getTime() - start;
      CachedReportData.insert(Object.assign({}, report_data, {cached: true}))
    }
    else {
      report_data['timeToFetch'] = new Date().getTime() - fetch_start;
    }
    console_log_conditional('getStudentTimeData data', report_data);
    return report_data
  },
})

let getSequencesForObs = function (params) {
  if (typeof params.obsIds !== 'undefined') {
    return {sequences: Sequences.find({obsId: {$in: params.obsIds}}).fetch()};
  }
  else {
    return {sequences: Sequences.find({obsId: params.obsId}).fetch()}
  }
}
