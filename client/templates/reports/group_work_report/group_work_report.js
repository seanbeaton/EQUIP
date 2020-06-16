import {setupSequenceParameters, setupSubjectParameters} from "/helpers/parameters";
import {console_log_conditional, console_table_conditional} from "/helpers/logging"

import {getSequences} from "/helpers/sequences";
import {getStudents, getStudent} from "/helpers/students";
import {setupVis} from "/helpers/timeline";
// import {getDiscourseOptionsForDimension, getObservations} from "/helpers/graphs";
import {
  getDiscourseDimensions, studentContribGraph,
  getDiscourseOptionsForDimension, getObservations,
  studentTimeGraph
} from "../../../../helpers/graphs";
import {heatmapReportSortDemoChosen, heatmapReportSortType} from "../selection_elements";

const obsOptions = new ReactiveVar([]);
const selectedEnvironment = new ReactiveVar(false);
const selectedObservations = new ReactiveVar([]);
const selectedDiscourseDimension = new ReactiveVar(false);
const selectedDiscourseOption = new ReactiveVar(false);
const selectedDemographic = new ReactiveVar(false);
const students = new ReactiveVar([]);
const selectedStudent = new ReactiveVar(false);
const selectedSpotlightDimension = new ReactiveVar(false);
const groupDisplayType = new ReactiveVar('blocks');
const latestDataRequest = new ReactiveVar();
const cachedDataRequests = new ReactiveVar({})

const cacheInfo = new ReactiveVar();
const cacheInfoStudentContrib = new ReactiveVar();
const cacheInfoStudentTime = new ReactiveVar();
const loadingData = new ReactiveVar(false);

Template.groupWorkReport.onCreated(function created() {
  this.autorun(() => {
    this.subscribe('subjects');
    this.subscribe('observations');
    this.subscribe('sequences');
    this.subscribe('subjectParameters');
    this.subscribe('sequenceParameters');
    this.subscribe('environments');
  })
});

Template.groupWorkReport.events({
  'change #env-select': function(e) {
    let selected = $('option:selected', e.target);
    clearGraph();

    selectedEnvironment.set(selected.val());
    obsOptions.set(getObsOptions());
    students.set(getStudents(selectedEnvironment.get(), true));
    console_log_conditional('students', students.get());
    setTimeout(function() {
      setupVis('vis-container', function() {
        if (selectedObservations.get().length === 0) {
          selectedStudent.set(false);
        }
        updateStudentContribGraph();
        updateStudentTimeGraph();
        setTimeout(updateGraph, 200);
      }, obsOptions, selectedObservations, 'small_group');
    }, 50);


    $('#group-work-demographic').val('');
  },
  'change #group-work-demographic': function(e) {
    let selected = $('option:selected', e.target);
    selectedDemographic.set(selected.val());
    updateGraph();
  },
  'change #student-spotlight__discourse-select': function(e) {
    let selected = $('option:selected', e.target);
    selectedSpotlightDimension.set(selected.val());
    updateStudentContribGraph();
    // updateStudentTimeGraph();
  },
  'click .student-spotlight__close': function() {
    selectedStudent.set(false);
    latestDataRequest.set(false)
    loadingData.set(false)
  },
  'change #disc-select': function(e) {
    let selected = $('option:selected', e.target);
    selectedDiscourseDimension.set(selected.val());
    $('#disc-opt-select').val('');
    // clearGraph();
    selectedDiscourseOption.set(false);
    updateGraph();
  },
  'change #disc-opt-select': function(e) {
    let selected = $('option:selected', e.target);
    //console_log_conditional('disc-opt-select,', selected.val());
    selectedDiscourseOption.set(selected.val());
    updateGraph()
  },
  'click .graph-display-type__option': function(e) {
    e.preventDefault();
    groupDisplayType.set($(e.target).attr('data-display-graph-type'))
    updateGraph()
  },
  'click .refresh-report': function(e) {
    e.preventDefault();
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
});


Template.groupWorkReport.helpers({
  environments: function() {
    let envs = Environments.find().fetch();
    envs = envs.map(function(env) {
      if (typeof env.envName === 'undefined') {
        env.envName = 'Loading...';
        env.disabled = 'disabled';
        return env;
      }
      let obsOpts = getObsOptions(env._id);
      console_log_conditional('obs_opts', obsOpts);
      if (obsOpts.length === 0) {
        env.envName += ' (no observations)';
        env.disabled = 'disabled';
      }
      else if (obsOpts.filter(obs => obs.observationType === 'small_group').length === 0) {
        env.envName += ' (no group work obs.)';
        env.disabled = 'disabled';
      }

      if (env.userId !== Meteor.userId()) {
        env.envName += ' (shared)';
      }
      return env
    });
    return envs;
  },
  disc_options_available: function() {
    setTimeout(function(){$(".chosen-select").trigger("chosen:updated");}, 100);  // makes these elements respect the disabled attr on their selects
    return !!selectedDiscourseDimension.get() && !!selectedEnvironment.get() && !!(selectedObservations.get().length >= 1) ? '' : 'disabled'
  },
  selected_discourse_options: function() {
    return getDiscourseOptionsForDimension(selectedEnvironment.get(), selectedDiscourseDimension.get());
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
  groupDisplayType: function() {
    return groupDisplayType.get()
  },
  environment: function() {
    return getEnvironment();
  },
  observations: function() {
    return getObservations(selectedObservations.get());
  },
  students: function() {
    return students.get();
  },
  selectedStudent: function() {
    return selectedStudent.get();
  },
  histogramDemoOptionSelected: function() {
    return !!(selectedDemographic.get())
  },
  demographics: function() {
    return getDemographics()
  },
  discourseparams: function() {
    return getDiscourseDimensions(selectedEnvironment.get());
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
})



let updateGraph = function(refresh) {
  if (selectedObservations.get().length < 1) {
    return;
  }

  let heatmap_params = {
    obsIds: selectedObservations.get(),
    envId: selectedEnvironment.get(),
  }

  loadingData.set(true)
  let currentDataRequest = Math.random()
  latestDataRequest.set(currentDataRequest)
  console.log(new Error().stack);
  console.log('setting latest data req', currentDataRequest)

  Meteor.call('getGroupWorkData', heatmap_params, refresh, function(err, result) {
    if (err) {
      console_log_conditional('error', err);
      return;
    }
    if (currentDataRequest !== latestDataRequest.get()) {
      latestDataRequest.set(null)
      console.log('currentDataRequest', currentDataRequest)
      console.log('latestDataRequest', latestDataRequest)
      console.log('cancelling data publishing for out of date request')
      return;
    }
    showData(result);
  });
}

let showData = function(result) {
  let wrapper = $('.group-work-report-wrapper');
  let selector = '#group-work-d3-wrapper';

  if (!wrapper.hasClass('group-work-created')) {
    wrapper.addClass('group-work-created');
    initGroups(result.data, selector)
  }
  else {
    $('#heatmap-d3-wrapper').html('');
    updateGroups(result.data, selector)
  }

  cacheInfo.set({createdAt: result.createdAt.toLocaleString(), timeToGenerate: result.timeToGenerate, timeToFetch: result.timeToFetch});
  loadingData.set(false);
  console_log_conditional('result.createdAt.toLocaleString()', result.createdAt.toLocaleString());
}

let getStudentPadding = function(count, max) {
  let max_padding = 12;
  // the higher the count, the smaller the padding. max of 12 px.
  console_log_conditional('max, count', max ,count);
  if (max === 0) {
    return max_padding + 'px';
  }
  let padding = ((max - count) / max * max_padding);
  return padding + 'px ' + (padding * 2) + 'px';
}

let getStudentTotalContribs = function(student) {
  let disc_option_active = selectedDiscourseOption.get();
  // false is not set, '' is "- All -"
  if (disc_option_active === false || disc_option_active === '') {
      return student.total_contributions
  }
  else {
    console_log_conditional('student', student);
    console_log_conditional('disc_option_active', disc_option_active);
    return student.sorted_contributions
      .find(c => c.dim === selectedDiscourseDimension.get())
      .option_counts
      .find(o => o.option === disc_option_active)
      .count;
  }
};
let getGroupTotalContribs = function(group) {
  let disc_option_active = selectedDiscourseOption.get();
  // false is not set, '' is "- All -"
  if (disc_option_active === false || disc_option_active === '') {
    return group.sequences.length
  }
  else {
    console_log_conditional('group.seqs, selected dim', group.sequences, selectedDiscourseDimension.get(), disc_option_active)
    return group.sequences
      .filter(c => c.info.parameters[selectedDiscourseDimension.get()] === disc_option_active)
      .length
      // .option_counts
      // .find(o => o.option === disc_option_active)
      // .count;
  }
};

let initGroups = function(data, selector) {
  let container = $(selector + '');
  let d3 = require('d3');
  console_log_conditional('data', data);

  let markup = data.groups.map(function(group) {
    let total_group_contribs = getGroupTotalContribs(group);
    let highest_contribs = Math.max(...group.students.map(stud => getStudentTotalContribs(stud)));
    let markup = "";


    if (groupDisplayType.get() === 'blocks') {
      markup = "<div class='student-group'>" +
        "<div class='student-group__title'><strong>" + group.name + "</strong> - " + group.observationDate + " (n = " + total_group_contribs + ")</div>" +
        "<div class='student-group__students'>" +
        group.students.map(function(student) {
          console_log_conditional('student', student);

          let student_count = getStudentTotalContribs(student);
          let padding = getStudentPadding(student_count, highest_contribs);
          return '<div id="' + student._id + '" class="dragger student-box student-box--scaling" style="padding: ' + padding + '">' +
            '<div class="student-box__wrapper"><p class="student-box__inner">' + student.info.name + ' (n=' + student_count + ', ' + Math.round(student_count / total_group_contribs * 1000) / 10 + '%)' +'</div>' +
            '</p></div>'
        }).join('') +
        "</div>" +
        "</div>";
    }
    else if (groupDisplayType.get() === 'bars') {
      group.d3_id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
      markup = "<div class='student-group'>" +
        "<div class='student-group__title'><strong>" + group.name + "</strong> - " + group.observationDate + " (n = " + total_group_contribs + ")</div>" +
        "<div class='student-group__students' id='" + group.d3_id + "'>" +
        "</div>" +
        "</div>";
    }
    else {
      markup = "Error - incorrect display type."
    }

    return markup;
  }).join('');
  container.html(markup);
  // let dim = selectedDemographic.get();
  let key_options = getDemographicOptions().map(demo_opt => demo_opt.name);

  let color_scale = function() {
    return '#898989'
  }
  if (key_options.length > 0) {
    let key_colors = getLabelColors(key_options);
    color_scale = d3.scaleOrdinal()
      .range(Object.values(key_colors));

    updateGroupWorkDemoKey('.group-work-report__graph-key', key_options, color_scale);

    let all_students = students.get();
    let demo = selectedDemographic.get();
    let student_boxes = $('.student-box');
    student_boxes.each(function(box_index) {
      let $box = $($('.student-box')[box_index]);
      let student = all_students.filter(stud => stud._id === $box.attr('id'))[0]
      $box.find('.student-box__wrapper').css('background-color', color_scale(student.info.demographics[demo]));
    })
  }
  else {
    $('.group-work-report__graph-key').html('');
  }

  console_log_conditional('color scale', color_scale);

  data.groups.forEach(function(group) {
    if (groupDisplayType.get() === 'bars') {
      d3GroupGraph('#' + group.d3_id, group, color_scale)
    }
  })

  $('.student-box, .student-vbar').on('click', function() {
    selectStudentForModal($(this).attr('id'));
  });


}

let d3GroupGraph = function(selector, group, color_scale) {
  let d3 = require('d3');
  let data = group.students

  data.forEach(student => {
    student.count = getStudentTotalContribs(student)
  });

  console_log_conditional('d3 graph', group);
  let svg_tag = $('<svg width="400" height="300"></svg>');
  $(selector).html(svg_tag);

  let svg = d3.select(selector + " svg"),
    margin = {top: 30, right: 20, bottom: 40, left: 20},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr('class', 'graph-container').attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  let x = d3.scaleBand()
    .domain(data.map(function(d) { return d._id; }))
    .range([0, width]);

  let y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)]).nice()
    .range([height, 0]);

  let x_axis = g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .append('g')
    .attr("class", "x-axis-labels")
    .call(d3.axisBottom(x).tickFormat(function(d) {
      return data.find(s => s._id === d).info.name
    }));

  x_axis
    .selectAll('.x-axis-labels text')
    .attr("text-anchor", "end")
    .attr('transform', 'rotate(-45,0,0)');

  x_axis
    .selectAll('.x-axis-labels line')
    .attr('transform', 'translate(3,0)');

  let selected_demo = selectedDemographic.get();
  g.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "student-vbar")
    .attr("id", d => d._id)
    .attr("x", function(d) {
      return x(d._id) + x.bandwidth() * 0.1;
    })
    .attr("y", function(d) { return y(d.count) })
    .attr("width", x.bandwidth() * 0.8)
    .attr("height", function(d) { return height - y(d.count); })
    .attr("fill", function(d) {
      let s = color_scale(d.info.demographics[selected_demo])
      console_log_conditional('color for d ', d.info.demographics, 'v', d.info.demographics[selected_demo], 's', s, 'selected_demo', selected_demo)
      return s;
    })

  let total_group_contribs = getGroupTotalContribs(group);
  g.selectAll(".bar")
    .data(data)
    .enter()
    .append("text")
    .text(function(d) { return '(n=' + d.count + ', ' + Math.round(d.count / total_group_contribs * 1000) / 10 + '%)'})
    .attr("text-anchor", "middle")
    .attr("x", function(d) {
      return x(d._id) + (x.bandwidth() / 2);
    })
    .attr("y", function(d) { return y(d.count) - 8; })
    .attr("font-family", "sans-serif")
    .attr("font-size", "12px")
    .attr("fill", "black")



}

let updateGroupWorkDemoKey = function(key_wrapper, y_values, color_axis) {
  let key_chunks = y_values.map(function(label) {
    return `<span class="key--label"><span class="key--color" style="background-color: ${color_axis(label)}"></span><span class="key--text">${label}</span></span>`
  })

  let html = `${key_chunks.join('')}`;
  $(key_wrapper).html(html)
}

let avail_colors_viridis = [
  "#440154ff", "#440558ff", "#450a5cff", "#450e60ff", "#451465ff", "#461969ff",
  "#461d6dff", "#462372ff", "#472775ff", "#472c7aff", "#46307cff", "#45337dff",
  "#433880ff", "#423c81ff", "#404184ff", "#3f4686ff", "#3d4a88ff", "#3c4f8aff",
  "#3b518bff", "#39558bff", "#37598cff", "#365c8cff", "#34608cff", "#33638dff",
  "#31678dff", "#2f6b8dff", "#2d6e8eff", "#2c718eff", "#2b748eff", "#29788eff",
  "#287c8eff", "#277f8eff", "#25848dff", "#24878dff", "#238b8dff", "#218f8dff",
  "#21918dff", "#22958bff", "#23988aff", "#239b89ff", "#249f87ff", "#25a186ff",
  "#25a584ff", "#26a883ff", "#27ab82ff", "#29ae80ff", "#2eb17dff", "#35b479ff",
  "#3cb875ff", "#42bb72ff", "#49be6eff", "#4ec16bff", "#55c467ff", "#5cc863ff",
  "#61c960ff", "#6bcc5aff", "#72ce55ff", "#7cd04fff", "#85d349ff", "#8dd544ff",
  "#97d73eff", "#9ed93aff", "#a8db34ff", "#b0dd31ff", "#b8de30ff", "#c3df2eff",
  "#cbe02dff", "#d6e22bff", "#e1e329ff", "#eae428ff", "#f5e626ff", "#fde725ff",
];


function shiftArrayToLeft(arr, places) {
  arr.push.apply(arr, arr.splice(0,places));
}

let getLabelColors = function(labels) {
  let local_colors = avail_colors_viridis.slice();

  let spacing = Math.max(Math.floor(avail_colors_viridis.length / labels.length), 1);

  let label_colors = {};
  let _ = labels.map(function(label) {
    if (typeof label_colors[label] === 'undefined') {
      let new_color = local_colors[0];
      local_colors.push(new_color);
      label_colors[label] = new_color;
      shiftArrayToLeft(local_colors, spacing);
    }
    else {

    }
  });
  return label_colors
}

let selectStudentForModal = function(studentId) {
  // Disabling the modal for now.
  // selectedStudent.set(getStudent(studentId, selectedEnvironment.get()));
}

let updateGroups = function(data, selector) {
  initGroups(data, selector);
}


let getDemographics = function() {
  let envId = selectedEnvironment.get();
  if (!envId) {
    return []
  }
  return setupSubjectParameters(envId);
};

let getDemographicOptions = function() {
  let options = getDemographics();
  let selected_demo = selectedDemographic.get();
  if (!selected_demo) {
    return [];
  }
  let opt = options.find(opt => opt.name === selected_demo);
  return opt
    .options.split(',').map(function(opt) {return {name: opt.trim()}})
};


let clearGraph = function() {
  students.set([])
  selectedObservations.set([]);
  selectedStudent.set(false);
  $('.group-work-report-wrapper').removeClass('heatmap-created');
  $('#group-work-d3-wrapper').html('');
  $('.group-work-report__graph-key').html('');
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
};


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
  latestDataRequest.set(currentDataRequest)

  Meteor.call('getStudentContribData', student_contrib_params, refresh, function(err, result) {
    if (err) {
      console_log_conditional('error', err);
      return;
    }
    if (currentDataRequest !== latestDataRequest.get()) {
      console.log('currentDataRequest', currentDataRequest)
      console.log('latestDataRequest', latestDataRequest)
      latestDataRequest.set(null)
      return;
    }

    studentContribGraph(result.data, selector)

    cacheInfoStudentContrib.set({createdAt: result.createdAt.toLocaleString(), timeToGenerate: result.timeToGenerate, timeToFetch: result.timeToFetch});
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
  latestDataRequest.set(currentDataRequest)

  Meteor.call('getStudentTimeData', student_time_params, refresh, function(err, result) {
    if (err) {
      console_log_conditional('error', err);
      return;
    }
    if (currentDataRequest !== latestDataRequest.get()) {
      latestDataRequest.set(null)
      console.log('currentDataRequest', currentDataRequest)
      console.log('latestDataRequest', latestDataRequest)
      return;
    }

    studentTimeGraph(result.data, selector, selectedEnvironment.get(), dimension)

    cacheInfoStudentTime.set({createdAt: result.createdAt.toLocaleString(), timeToGenerate: result.timeToGenerate, timeToFetch: result.timeToFetch});
    loadingData.set(false);
    console_log_conditional('result.createdAt.toLocaleString()', result.createdAt.toLocaleString());
  });
}

