import {console_log_conditional} from "/helpers/logging"

import {getStudents, getStudent} from "../../../../helpers/students";
import {heatmapReportSortDemoChosen, heatmapReportSortType} from "../selection_elements";
import {setupVis} from '../../../../helpers/timeline';
import {clone_object} from "../../../../helpers/objects";
import {
  createHeatmapData,
  getDiscourseDimensions,
  getDiscourseOptionsForDimension,
  getObservations, studentContribGraph, studentTimeGraph
} from "../../../../helpers/graphs";
import {Sidebar} from "../../../../helpers/graph_sidebar";

// const envSet = new ReactiveVar(false);
const obsOptions = new ReactiveVar([]);
const selectedEnvironment = new ReactiveVar(false);
const selectedObservations = new ReactiveVar([]);
const selectedDatasetType = new ReactiveVar('contributions');
const students = new ReactiveVar([]);
const selectedStudent = new ReactiveVar(false);
const selectedSpotlightDimension = new ReactiveVar(false);

const totalContributions = new ReactiveVar(0);

const currentDemoFilters = new ReactiveVar(false);

const cacheInfo = new ReactiveVar();
const cacheInfoStudentContrib = new ReactiveVar();
const latestDataRequestStudentContrib = new ReactiveVar();

const cacheInfoStudentTime = new ReactiveVar();
const latestDataRequestStudentTime = new ReactiveVar();

const loadingData = new ReactiveVar(false);

const latestDataRequest = new ReactiveVar();
const cachedDataRequests = new ReactiveVar({})


Template.heatmapReport.onCreated(function created() {
  this.autorun(() => {
    this.subscribe('observations');
    this.subscribe('groupObservations');
    this.subscribe('subjects');
    this.subscribe('groupSubjects');
    this.subscribe('subjectParameters');
    this.subscribe('groupSubjectParameters');
    this.subscribe('sequenceParameters');
    this.subscribe('groupSequenceParameters');
    this.subscribe('environments');
    this.subscribe('groupEnvironments');
  })
});

Template.heatmapReport.helpers({
  environments: function() {
    let envs = Environments.find().fetch();
    envs = envs.map(function(env) {
      if (typeof env.envName === 'undefined') {
        env.envName = 'Loading...';
        env.disabled = 'disabled';
        return env;
      }
      let obsOpts = getObsOptions(env._id);
      //console_log_conditional('obs_opts', obsOpts);
      if (obsOpts.length === 0) {
        env.envName += ' (no observations)';
        env.disabled = 'disabled';
      }
      if (env.userId !== Meteor.userId()) {
        env.envName += ' (shared)';
      }
      return env
    });
    return envs;
  },
  environmentChosen: function() {
    return !!(selectedEnvironment.get());
  },
  observationChosen: function() {
    return !!(selectedObservations.get().length >= 1)
  },
  multipleObservationsChosen: function() {
    return !!(selectedObservations.get().length >= 2)
  },
  // discourseDimensions: function() {
  //   return getDiscourseDimensions()
  // },
  // demographics: function() {
  //   return getDemographics()
  // },

  environment: function() {
    return getEnvironment();
  },
  observations: function() {
    return getObservations(selectedObservations.get());
  },
  observationsOptions: function() {
    return obsOptions.get();
  },
  observationNames: function() {
    let observations = getObservations(selectedObservations.get());
    let obsNames = observations.map(obs => obs.name);

    if (obsNames.length >= 3) {
      return obsNames.slice(0,-1).join(', ') + ', and ' + obsNames[obsNames.length - 1]
    }
    else if (obsNames.length === 2) {
      return obsNames.join(' and ');
    }
    else {
      return obsNames[0]
    }
  },
  demographics: function() {
    return getDemographics();
  },
  demographic_filters: function() {
    let demo_options = getDemographics();
    demo_options = demo_options.map(function(demo_opt) {
      demo_opt.default = '';
      return demo_opt;
    });

    if (typeof demo_options[0] !== 'undefined') {
      demo_options[0].default = 'default'
    }

    return demo_options;
  },
  discourseparams: function() {
    return getDiscourseDimensions(selectedEnvironment.get());
  },
  showFilters: function() {
    return (students.get().length > 0) && (selectedObservations.get().length > 0);
  },
  demo_available: function() {
    setTimeout(function(){$(".chosen-select").trigger("chosen:updated");}, 100);  // makes these elements respect the disabled attr on their selects
    return !!selectedEnvironment.get() && !!(selectedObservations.get().length >= 2) ? '' : 'disabled'
  },
  disc_available: function() {
    setTimeout(function(){$(".chosen-select").trigger("chosen:updated");}, 100);  // makes these elements respect the disabled attr on their selects
    return !!selectedEnvironment.get() && !!(selectedObservations.get().length >= 2) ? '' : 'disabled'
  },
  disc_options_available: function() {
    setTimeout(function(){$(".chosen-select").trigger("chosen:updated");}, 100);  // makes these elements respect the disabled attr on their selects
    return !!selectedDiscourseDimension.get() && !!selectedEnvironment.get() && !!(selectedObservations.get().length >= 2) ? '' : 'disabled'
  },
  selected_discourse_options: function() {
    return getDiscourseOptions();
  },
  dataset_types: function() {
    return [
      {
        id: 'contributions',
        name: 'Contributions',
        default: 'default'
      }
    ]
  },
  students: function() {
    return students.get();
  },
  studentsHeatmapSortType: function() {
    heatmapReportSortType.get()
  },
  studentsHeatmapSortDemoChosen: function() {
    heatmapReportSortDemoChosen.get()
  },
  selectedStudent: function() {
    return selectedStudent.get();
  },
  totalContributions: function() {
    return totalContributions.get()
  },
  selectedEnvironment: function() {
    return selectedEnvironment.get();
  },
  selectedObservations: function() {
    return selectedObservations.get();
  },
  cache_info: function() {
    return cacheInfo.get();
  },
  cache_info_student_time: function() {
    return cacheInfoStudentTime.get();
  },
  cache_info_student_contrib: function() {
    return cacheInfoStudentContrib.get();
  },
  loadingDataClass: function() {
    return loadingData.get();
  },
});

let getDemographics = function() {
  let envId = selectedEnvironment.get();
  if (!envId) {
    return []
  }
  return SubjectParameters.findOne({envId: envId}).parameters;
};

let getEnvironment = function() {
  let envId = selectedEnvironment.get();
  return Environments.findOne({_id: envId})
}

Template.heatmapReport.events({
  'change #env-select': function(e) {

    let selected = $('option:selected', e.target);
    clearGraph();

    selectedEnvironment.set(selected.val());
    obsOptions.set(getObsOptions());
    students.set(Subjects.find({envId: selectedEnvironment.get()}).fetch());
    setTimeout(function() {
      setupVis('vis-container', function() {
        if (selectedObservations.get().length === 0) {
          selectedStudent.set(false);
        }
        updateStudentContribGraph();
        updateStudentTimeGraph();
        updateGraph();
        // setTimeout(updateGraph, 10);
      }, obsOptions, selectedObservations, 'whole_class');
    }, 50);


    $('#disc-select').val('');
    $('#demo-select').val('');
    $('#disc-opt-select').val('');

    let blank_filters = getDemographics().map(function(demo) {
      return {
        label: demo.label,
        selected: []
      }
    })
    currentDemoFilters.set(blank_filters);
  },
  'change #student-spotlight__discourse-select': function(e) {
    let selected = $('option:selected', e.target);
    selectedSpotlightDimension.set(selected.val());
    updateStudentContribGraph();
    updateStudentTimeGraph();
  },
  'change #dataset-type-select': function(e) {
    let selected = $('option:selected', e.target);
    selectedDatasetType.set(selected.val());
    updateGraph();
    updateStudentContribGraph();
    updateStudentTimeGraph();
  },
  'click .student-spotlight__close': function() {
    selectedStudent.set(false);
    latestDataRequest.set(false)
    latestDataRequestStudentContrib.set(false)
    latestDataRequestStudentTime.set(false)
    loadingData.set(false)
  },
  'change .filters__wrapper .filter': function() {
    let selected_filters = getDemographics().map(function(demo) {
      let selected_options = $('.filters__wrapper .filter[data-filter-demo-name="' + demo.label + '"] option:selected');
      let opts = []
      selected_options.each(function(key) {
        opts.push($(selected_options[key]).val());
      })
      return {
        label: demo.label,
        selected: opts
      }
    })
    currentDemoFilters.set(selected_filters);

    $('.students').html('');
    updateGraph()
  },
  'click .refresh-report': function(e) {
    e.preventDefault();
    cachedDataRequests.set({});
    updateGraph(true)
  },
  'click .refresh-report-student-contrib': function(e) {
    e.preventDefault();
    updateStudentContribGraph(true)
  },
  'click .refresh-report-student-time': function(e) {
    e.preventDefault();
    updateStudentTimeGraph(true)
  },
})

$(window).on('heatmap_student_sort_updated', function(e, sort_type) {
  updateGraph();
  console_log_conditional('currentValue sort', sort_type, heatmapReportSortType.get())
})

$(window).on('heatmap_student_sort_demo_updated', function(e, sort_buckets_demo) {
  updateGraph();
  console_log_conditional('demo val', sort_buckets_demo, heatmapReportSortDemoChosen.get());
})

let clearGraph = function() {
  students.set([])
  selectedObservations.set([]);
  selectedStudent.set(false);
  totalContributions.set(0);
  $('.heatmap-report-wrapper').removeClass('heatmap-created');
  $('#heatmap-d3-wrapper').html('');
  $('.heatmap-report__graph-key').html('');
  // let timeline_selector = '.heatmap-report__graph';
  // $(timeline_selector + ' svg').remove();
}

let updateGraph = async function(refresh) {

  if (selectedObservations.get().length < 1) {
    return;
  }

  let heatmap_params = {
    obsIds: selectedObservations.get(),
    envId: selectedEnvironment.get(),
    selectedDemo: heatmapReportSortDemoChosen.get(),
    heatmapReportSortType: heatmapReportSortType.get(),
  }
  loadingData.set(true)

  let cachedData = cachedDataRequests.get();
  let cachedResult = cachedData;

  if (typeof cachedResult[JSON.stringify(heatmap_params)] !== 'undefined' && !refresh) {
    showData(cachedResult[JSON.stringify(heatmap_params)]);
    cacheInfo.set({...cacheInfo.get(), ...{localCache: true}});
  }
  else {

    let currentDataRequest = Math.random()
    latestDataRequest.set(currentDataRequest)
    console_log_conditional(new Error().stack);
    console_log_conditional('setting latest data req', currentDataRequest)

    // Meteor.call('getHeatmapData', heatmap_params, refresh, function(err, result) {
    //   if (err) {
    //     console_log_conditional('error', err);
    //     return;
    //   }
    //
    //   let cachedData = cachedDataRequests.get()
    //   cachedData[JSON.stringify(heatmap_params)] = result
    //   cachedDataRequests.set(cachedData);
    //
    //   if (currentDataRequest !== latestDataRequest.get()) {
    //     console_log_conditional('currentDataRequest', currentDataRequest)
    //     console_log_conditional('latestDataRequest', latestDataRequest.get())
    //     console_log_conditional('current cachedDataRequests.get()', cachedDataRequests.get())
    //     return;
    //   }
    //   else {
    //     console_log_conditional('data req matches')
    //     latestDataRequest.set(null)
    //   }
    //
    //
    //   showData(result)
    // });

    Meteor.call('getObsSequences', {
      obsIds: selectedObservations.get(),
      envId: selectedEnvironment.get()
    }, refresh, function (err, result) {
      if (err) {
        console_log_conditional('error', err);
        return;
      }

      let cachedData = cachedDataRequests.get()
      cachedData[JSON.stringify(heatmap_params)] = result
      cachedDataRequests.set(cachedData);

      if (currentDataRequest !== latestDataRequest.get()) {
        console_log_conditional('currentDataRequest', currentDataRequest)
        console_log_conditional('latestDataRequest', latestDataRequest.get())
        console_log_conditional('current cachedDataRequests.get()', cachedDataRequests.get())
        return;
      }
      else {
        console_log_conditional('data req matches')
        latestDataRequest.set(null)
      }
      result.data = createHeatmapData(heatmap_params, result.data.sequences)

      showData(result)
    });

  }

}

let showData = function(result) {
  let heatmap_wrapper = $('.heatmap-report-wrapper');
  let heatmap_selector = '.heatmap-report__graph';

  updateTotalContribs(result.data.contributions_dataset);
  $('.heatmap-report-wrapper').removeClass('filters-active');
  if (!heatmap_wrapper.hasClass('heatmap-created')) {
    heatmap_wrapper.addClass('heatmap-created');

    initHeatmapGraph(result.data, heatmap_selector)
  }
  else {
    $('#heatmap-d3-wrapper').html('');
    updateHeatmapGraph(result.data, heatmap_selector)
  }
  updateFilteredStudents()
  cacheInfo.set({createdAt: result.createdAt.toLocaleString(), timeToGenerate: result.timeToGenerate, timeToFetch: result.timeToFetch});
  loadingData.set(false);
  console_log_conditional('result.createdAt.toLocaleString()', result.createdAt.toLocaleString());
}


let updateFilteredStudents = function() {
  let selected_filters = currentDemoFilters.get();
  let active_filters = !!selected_filters.map(filter => filter.selected.length).reduce((a, b) => a + b);
  console_log_conditional('active filteres', active_filters)
  if (active_filters) {
    $('.heatmap-report-wrapper').addClass('filters-active');
  }
  else {
    $('.heatmap-report-wrapper').removeClass('filters-active');
  }
  let student_boxes = $('.student-box');
  student_boxes.each(function(student_key) {
    let $student = $(student_boxes[student_key]);
    let student_data = students.get().find(student => student._id === $student.attr('id'))
    let allowed = selected_filters.map(function(filter) {
      if (filter.selected.length === 0) {
        return true;
      }
      console_log_conditional('student_data', student_data);
      if (!student_data) {
        return false;
      }
      return (filter.selected.indexOf(student_data.info.demographics[filter.label]) >= 0)
    }).reduce((a,b) => a && b);

    $student.removeClass('disabled-student');
    if (!allowed) {
      $student.addClass('disabled-student');
    }
  });
}

let updateTotalContribs = function(data) {
  let student_boxes = $('.student-box');

  if (student_boxes.length === 0) {
    setTimeout(function() {
      updateTotalContribs(data);
    }, 100);
    return;
  }
  let filters = currentDemoFilters.get();

  let allowed_students = [];

  student_boxes.each(function(student_key) {
    let $student = $(student_boxes[student_key]);
    let student_data = students.get().find(student => student._id === $student.attr('id'))
    if (!student_data) {
      return false;
    }
    // creates an array of boolean values for if the student matches each filter, then reduces it.
    let allowed = filters.map(function(filter) {
      if (filter.selected.length === 0) {
        return true;
      }
      return (filter.selected.indexOf(student_data.info.demographics[filter.label]) >= 0)
    }).reduce((a,b) => a && b);

    // $student.removeClass('disabled-student');
    if (!allowed) {
      // $student.addClass('disabled-student');
    }
    else {
      allowed_students.push($student.attr('id'))
    }
  })

  let full_count = data.filter(datum => allowed_students.indexOf(datum.studentId) >= 0).map(datum => datum.count).reduce((a, b) => a + b, 0);
  totalContributions.set(full_count);
};

let initHeatmapGraph = function(full_data, containerSelector) {
  let data;
  let d3 = require('d3');
  let d3Interpolate = require("d3-interpolate");

  data = full_data.contributions_dataset;

  let count_scale = d3.scaleSequential(d3Interpolate.interpolateRgb('#bbbbbb', '#cc0000'))
    .domain([0, d3.max(data, d => d.count)]);

  updateHeatmapKey('.heatmap-report__graph-key', count_scale);

  let g = d3.select('#heatmap-d3-wrapper');
  let boxes = g.selectAll(".student-box")
    .data(data);

  let new_boxes = boxes.enter()
    .append('div')
    .attr('id', d => d.studentId)
    .attr('data-x', d => d.student.data_x)
    .attr('data-y', d => d.student.data_y)
    .attr('data-quintile', d => d.quintile)
    .attr('data-contrib-count', d => d.count)
    .attr('class', d => 'dragger student-box c--observation__student-box-container ' + d.class)
    .html(function(d) {
      let count = d.show_count ? ' (' + d.count + ')' : '';
      return '<p class="c--observation__student-box">' + d.name + count +'</p>'
    });

  $('#heatmap-d3-wrapper').removeClass('subjects--fixed-height');
  if (heatmapReportSortType.get() === 'classroom') {
    new_boxes.style('transform', function(d) { return "translate(" + d.student.data_x + "px, " + d.student.data_y + "px)" })
    new_boxes.style('position', "absolute");
    $('#heatmap-d3-wrapper').addClass('subjects--fixed-height');
  }
  else {
    new_boxes.style('transform', "");
    new_boxes.style('position', "");
  }

  new_boxes.style('background-color', d => count_scale(d.count))
    .on('click', function() {
      selectStudentForModal($(this).attr('id'));
    });

  scale = d3.select()
};

let selectStudentForModal = function(studentId) {
  selectedStudent.set(Subjects.findOne({_id: studentId}));
}

let updateHeatmapGraph = function(full_data, containerSelector) {
  let data;

  let d3 = require('d3');
  let d3Interpolate = require("d3-interpolate");

  data = full_data.contributions_dataset;

  // initHeatmapGraph(full_data, containerSelector)

  let count_scale = d3.scaleSequential(d3Interpolate.interpolateRgb('#bbbbbb', '#cc0000'))
    .domain([0, d3.max(data, d => d.count)]);

  updateHeatmapKey('.heatmap-report__graph-key', count_scale);


  let g = d3.select('#heatmap-d3-wrapper');
  let boxes = g.selectAll(".student-box")
    .data(data);

  let new_boxes = boxes.enter()
    .append('div')
    .attr('id', d => d.studentId)
    .attr('data-x', d => d.student.data_x)
    .attr('data-y', d => d.student.data_y)
    .attr('data-quintile', d => d.quintile)
    .attr('class', d => 'dragger student-box c--observation__student-box-container ' + d.class)
    .html(function(d) {
      let count = d.show_count ? ' (' + d.count + ')' : '';
      return '<p class="c--observation__student-box">' + d.name + count +'</p>'
    })
    .merge(boxes)

  $('#heatmap-d3-wrapper').removeClass('subjects--fixed-height');
  if (heatmapReportSortType.get() === 'classroom') {
    new_boxes.style('transform', function(d) { return "translate(" + d.student.data_x + "px, " + d.student.data_y + "px)" })
    new_boxes.style('position', "absolute");
    $('#heatmap-d3-wrapper').addClass('subjects--fixed-height');
  }
  else {
    new_boxes.style('transform', "");
    new_boxes.style('position', "");
  }

  new_boxes
    .transition()
    .duration(500)
    .attr('data-contrib-count', d => d.count)
    .style('background-color', function(d){return count_scale(d.count)});

  new_boxes.on('click', function() {
      selectStudentForModal($(this).attr('id'));
    });
};



let updateHeatmapKey = function(selector, color_axis) {
  let d3 = require('d3');

  $(selector).html('<div class="heatmap-key"></div>');

  let key_height = 80;
  let key_width = 400;
  let margins = {top: 55, right: 10, bottom: 5, left: 10};

  let container = d3.select('.heatmap-key')
    .style("position", "relative")
    .style("width", key_width + "px")
    .style("height", key_height + "px");

  let canvas = container.append("canvas")
    .style("position", "absolute")
    .style("width", (key_width - margins.left - margins.right) + "px")
    .style("height", (key_height - margins.top - margins.bottom) + "px")
    .style("top", (margins.top) + "px")
    .style("left", (margins.left) + "px");

  let ctx = canvas.node().getContext("2d");

  let svg = container.append("svg")
    .style('overflow', 'visible')
    .style("position", "absolute")
    .style("width", (key_width - margins.left - margins.right) + "px")
    .style("height", (margins.top) + "px")
    .style("bottom", (key_height - margins.top) + "px")
    .style("left", (margins.left) + "px");

  let key_scale = d3.scaleLinear()
    .range([0, key_width - margins.left - margins.right])
    .domain(color_axis.domain());

  d3.range(0, 100, 0.001)
    .forEach(function (d) {
      ctx.beginPath();
      ctx.strokeStyle = color_axis(d * 1.28);
      ctx.moveTo(key_scale(d), 0);
      ctx.lineTo(key_scale(d), 500);
      ctx.stroke();
    });

  let key_axis = d3.axisTop(key_scale)
    // .tickSize(6)
    .ticks(d3.min([8, d3.max(color_axis.domain())]));

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + margins.top +")")
    .call(key_axis);
}


let getObsOptions = function(envId) {
  if (typeof envId === 'undefined') {
    envId = selectedEnvironment.get();
  }
  if (!!envId) {
    return Observations.find({envId: envId}).fetch();
  }
  else {
    return false;
  }
}

//
// Below this we have only the spotlight code
// This could be refactored by somehow attaching all the fields
// (students, selected student, env, observations) to the spotlight somehow.
//

let updateStudentContribGraph = function(refresh) {
  let selector = '.student-contributions-graph__graph';
  let $selector = $(selector);
  // Wait till the graph exists.
  if ($selector.length === 0) {
    setTimeout(function() {updateStudentContribGraph(refresh)}, 50);
    return;
  }

  let dimension = selectedSpotlightDimension.get();
  if (dimension === false) {
    return;
  }
  if (selectedObservations.get().length < 1) {
    return;
  }

  let student_contrib_params = {
    envId: selectedEnvironment.get(),
    obsIds: selectedObservations.get(),
    student: selectedStudent.get(),
    dimension: dimension,
    disc_opts: getDiscourseOptionsForDimension(selectedEnvironment.get(), dimension),
    students: students.get(),
  }

  loadingData.set(true)
  let currentDataRequest = Math.random()
  latestDataRequestStudentContrib.set(currentDataRequest)

  Meteor.call('getStudentContribData', student_contrib_params, refresh, function(err, result) {
    if (err) {
      console_log_conditional('error', err);
      return;
    }

    if (currentDataRequest !== latestDataRequestStudentContrib.get()) {
      return;
    }
    latestDataRequestStudentContrib.set(null)

    studentContribGraph(result.data, selector)

    cacheInfoStudentContrib.set({createdAt: result.createdAt.toLocaleString(), timeToGenerate: result.timeToGenerate, timeToFetch: result.timeToFetch, refresh_class_suffix: '-student-contrib'});
    loadingData.set(false);
    console_log_conditional('result.createdAt.toLocaleString()', result.createdAt.toLocaleString());
  });
};

let updateStudentTimeGraph = function (refresh) {
  let selector = '.student-participation-time__graph';
  let $selector = $(selector);
  // Wait till the graph exists.
  if ($selector.length === 0) {
    setTimeout(function() {updateStudentTimeGraph(refresh)}, 50);
    return;
  }

  let dimension = selectedSpotlightDimension.get();

  if (dimension === false) {
    return;
  }
  if (selectedObservations.get().length < 2) {
    return;
  }

  let student_time_params = {
    envId: selectedEnvironment.get(),
    obsIds: selectedObservations.get(),
    student: selectedStudent.get(),
    dimension: dimension,
    disc_opts: getDiscourseOptionsForDimension(selectedEnvironment.get(), dimension),
  }

  loadingData.set(true)
  let currentDataRequest = Math.random()
  latestDataRequestStudentTime.set(currentDataRequest)

  Meteor.call('getStudentTimeData', student_time_params, refresh, function(err, result) {
    if (err) {
      console_log_conditional('error', err);
      return;
    }

    if (currentDataRequest !== latestDataRequestStudentTime.get()) {
      return;
    }
    latestDataRequestStudentTime.set(null)

    studentTimeGraph(result.data, selector, selectedEnvironment.get(), dimension)

    cacheInfoStudentTime.set({createdAt: result.createdAt.toLocaleString(), timeToGenerate: result.timeToGenerate, timeToFetch: result.timeToFetch, refresh_class_suffix: '-student-time'});
    loadingData.set(false);
    console_log_conditional('result.createdAt.toLocaleString()', result.createdAt.toLocaleString());
  });
}

