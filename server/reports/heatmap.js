import {getStudents} from "../../helpers/students";
import {console_log_conditional} from "/helpers/logging"
import {checkAccess} from "../../helpers/access";
import {createHeatmapData} from "../../helpers/graphs";


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
