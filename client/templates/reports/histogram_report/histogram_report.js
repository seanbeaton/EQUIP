import {console_log_conditional} from "/helpers/logging"
import {setupVis} from "/helpers/timeline";
import {
  getDiscourseDimensions,
  getDiscourseOptionsForDimension,
  getObservations,
  studentContribGraph,
  studentTimeGraph
} from "../../../../helpers/graphs";
import {getEnvironments, getObsOptions} from "../../../../helpers/environments";

// const envSet = new ReactiveVar(false);
const obsOptions = new ReactiveVar([]);
const selectedEnvironment = new ReactiveVar(false);
const selectedObservations = new ReactiveVar([]);
const selectedDatasetType = new ReactiveVar('contributions');
const selectedDemographic = new ReactiveVar(false);
const students = new ReactiveVar([]);
const selectedStudent = new ReactiveVar(false);
const selectedSpotlightDimension = new ReactiveVar(false);

const cacheInfo = new ReactiveVar();
const cacheInfoStudentContrib = new ReactiveVar();
const latestDataRequestStudentContrib = new ReactiveVar();

const cacheInfoStudentTime = new ReactiveVar();
const latestDataRequestStudentTime = new ReactiveVar();
const loadingData = new ReactiveVar(false);

Template.histogramReport.onCreated(function created() {
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

Template.histogramReport.events({
  'change #env-select': function (e) {
    let selected = $('option:selected', e.target);
    clearGraph();

    selectedEnvironment.set(selected.val());
    obsOptions.set(getObsOptions(selectedEnvironment));
    students.set(Subjects.find({envId: selectedEnvironment.get()}).fetch());
    console_log_conditional('students', students.get());
    setTimeout(function () {
      setupVis('vis-container', function () {
        if (selectedObservations.get().length === 0) {
          selectedStudent.set(false);
        }
        updateStudentContribGraph();
        updateStudentTimeGraph();
        updateGraph()
      }, obsOptions, selectedObservations, 'whole_class');
    }, 50);


    $('#histogram-demographic').val('');
  },
  'change #histogram-demographic': function (e) {
    let selected = $('option:selected', e.target);
    selectedDemographic.set(selected.val());
    updateGraph();
  },
  'change #student-spotlight__discourse-select': function (e) {
    let selected = $('option:selected', e.target);
    selectedSpotlightDimension.set(selected.val());
    updateStudentContribGraph();
    updateStudentTimeGraph();
  },
  'click .student-spotlight__close': function () {
    selectedStudent.set(false);
  },
  'click .refresh-report': function (e) {
    e.preventDefault();
    updateGraph(true)
  },
  'click .refresh-report-student-contrib': function (e) {
    e.preventDefault();
    updateStudentContribGraph(true)
  },
  'click .refresh-report-student-time': function (e) {
    e.preventDefault();
    updateStudentTimeGraph(true)
  },
});


Template.histogramReport.helpers({
  environments: function () {
    return getEnvironments(selectedEnvironment)
  },

  environmentChosen: function () {
    return !!(selectedEnvironment.get());
  },
  observationChosen: function () {
    return !!(selectedObservations.get().length >= 1)
  },
  multipleObservationsChosen: function () {
    return !!(selectedObservations.get().length >= 2)
  },
  environment: function () {
    return getEnvironment();
  },
  observations: function () {
    return getObservations(selectedObservations.get());
  },
  students: function () {
    return students.get();
  },
  selectedStudent: function () {
    return selectedStudent.get();
  },
  histogramDemoOptionSelected: function () {
    return !!(selectedDemographic.get())
  },
  demographics: function () {
    return getDemographics()
  },
  discourseparams: function () {
    return getDiscourseDimensions(selectedEnvironment.get());
  },
  cache_info: function () {
    return cacheInfo.get();
  },
  cache_info_student_time: function () {
    return cacheInfoStudentTime.get();
  },
  cache_info_student_contrib: function () {
    return cacheInfoStudentContrib.get();
  },
  loadingDataClass: function () {
    return loadingData.get();
  },
})


Template.histogramReport.rendered = function () {

};


let clearGraph = function () {
  students.set([])
  selectedObservations.set([]);
  selectedStudent.set(false);
  $('.histogram-report-wrapper').removeClass('heatmap-created');
  $('#histogram-d3-wrapper').html('');
  $('.histogram-report__graph-key').html('');
}

let updateGraph = function (refresh) {
  let histogram_wrapper = $('.histogram-report-wrapper');
  let histogram_selector = '#histogram-d3-wrapper';

  if (selectedObservations.get().length < 1) {
    // heatmap_wrapper.html('');
    // heatmap_wrapper.removeClass('heatmap-created')
    return;
  }


  let histogram_params = {
    obsIds: selectedObservations.get(),
    envId: selectedEnvironment.get(),
  }

  loadingData.set(true);
  Meteor.call('getHistogramData', histogram_params, refresh, function (err, result) {
    if (err) {
      console_log_conditional('error', err);
      return;
    }


    if (!histogram_wrapper.hasClass('histogram-created')) {
      histogram_wrapper.addClass('histogram-created');

      initHistogram(result.data, histogram_selector)
    }
    else {
      $('#heatmap-d3-wrapper').html('');
      updateHistogram(result.data, histogram_selector)
    }


    cacheInfo.set({
      createdAt: result.createdAt.toLocaleString(),
      timeToGenerate: result.timeToGenerate,
      timeToFetch: result.timeToFetch
    });
    loadingData.set(false);
    console_log_conditional('result.createdAt.toLocaleString()', result.createdAt.toLocaleString());
  });
}

let selectStudentForModal = function (studentId) {
  selectedStudent.set(Subjects.findOne({_id: studentId}));
}

let initHistogram = function (data, selector) {
  let d3 = require('d3');
  let container = $(selector + '');
  let markup = data.quartiles.map(function (quartile) {
    let markup = "<div class='student-group'>" +
      "<div class='student-group__title'>" + quartile.name + "</div>" +
      "<div class='student-group__students'>" +
      quartile.students.map(function (student) {
        return '<div id="' + student.studentId + '" class="dragger student-box c--observation__student-box-container">' +
          '<p class="c--observation__student-box">' + student.name + (student.show_count ? ' (' + student.count + ')' : '') + '</p>' +
          '</div>'
      }).join('') +
      "</div>" +
      "</div>";
    return markup;
  }).join('');
  container.html(markup);

  $('.student-box').on('click', function () {
    selectStudentForModal($(this).attr('id'));
  });

  // let dim = selectedDemographic.get();
  let key_options = getDemographicOptions().map(demo_opt => demo_opt);

  if (key_options.length > 0) {
    let key_colors = getLabelColors(key_options);
    let color_scale = d3.scaleOrdinal()
      .range(Object.values(key_colors))

    updateHistogramDemoKey('.histogram-report__graph-key', key_options, color_scale);

    let all_students = students.get();
    let demo = selectedDemographic.get();
    let student_boxes = $('.student-box');
    student_boxes.each(function (box_index) {
      let $box = $($('.student-box')[box_index]);
      console_log_conditional('box', $box);
      console_log_conditional('getting students');
      let student = all_students.filter(stud => stud._id === $box.attr('id'))[0]
      console_log_conditional('student', student);
      console.log('color_scale(student.info.demographics[demo])', color_scale(student.info.demographics[demo]));
      $box.attr('style', `background-color: ${color_scale(student.info.demographics[demo])}`);
    })
  }
  else {
    $('.histogram-report__graph-key').html('');
  }

}

let updateHistogramDemoKey = function (key_wrapper, y_values, color_axis) {
  let key_chunks = y_values.map(function (label) {
    return `<span class="key--label"><span class="key--color" style="background-color: ${color_axis(label)}"></span><span class="key--text">${label}</span></span>`
  })

  let html = `${key_chunks.join('')}`;
  $(key_wrapper).html(html)
}

let updateHistogram = function (data, selector) {
  initHistogram(data, selector);
}


let getDemographics = function () {
  let envId = selectedEnvironment.get();
  if (!envId) {
    return []
  }
  return SubjectParameters.findOne({envId: envId}).parameters;
};

let getDemographicOptions = function () {
  let options = getDemographics();
  let selected_demo = selectedDemographic.get();
  if (!selected_demo) {
    return [];
  }
  let opt = options.find(opt => opt.label === selected_demo);
  return opt.options
};

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
  arr.push.apply(arr, arr.splice(0, places));
}

let getLabelColors = function (labels) {
  let local_colors = avail_colors_viridis.slice();

  let spacing = Math.max(Math.floor(avail_colors_viridis.length / labels.length), 1);

  let label_colors = {};
  let _ = labels.map(function (label) {
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

//
// Below this we have only the spotlight code
// This could be refactored by somehow attaching all the fields
// (students, selected student, env, observations) to the spotlight somehow.
//

let updateStudentContribGraph = function (refresh) {
  let selector = '.student-contributions-graph__graph';
  let $selector = $(selector);
  // Wait till the graph exists.
  if ($selector.length === 0) {
    setTimeout(function () {
      updateStudentContribGraph(refresh)
    }, 50);
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

  Meteor.call('getStudentContribData', student_contrib_params, refresh, function (err, result) {
    if (err) {
      console_log_conditional('error', err);
      return;
    }

    if (currentDataRequest !== latestDataRequestStudentContrib.get()) {
      return;
    }
    latestDataRequestStudentContrib.set(null)

    studentContribGraph(result.data, selector)

    cacheInfoStudentContrib.set({
      createdAt: result.createdAt.toLocaleString(),
      timeToGenerate: result.timeToGenerate,
      timeToFetch: result.timeToFetch,
      refresh_class_suffix: '-student-contrib'
    });
    loadingData.set(false);
    console_log_conditional('result.createdAt.toLocaleString()', result.createdAt.toLocaleString());
  });
};

let updateStudentTimeGraph = function (refresh) {
  let selector = '.student-participation-time__graph';
  let $selector = $(selector);
  // Wait till the graph exists.
  if ($selector.length === 0) {
    setTimeout(function () {
      updateStudentTimeGraph(refresh)
    }, 50);
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

  Meteor.call('getStudentTimeData', student_time_params, refresh, function (err, result) {
    if (err) {
      console_log_conditional('error', err);
      return;
    }
    if (currentDataRequest !== latestDataRequestStudentTime.get()) {
      return;
    }
    latestDataRequestStudentTime.set(null)

    studentTimeGraph(result.data, selector, selectedEnvironment.get(), dimension)

    cacheInfoStudentTime.set({
      createdAt: result.createdAt.toLocaleString(),
      timeToGenerate: result.timeToGenerate,
      timeToFetch: result.timeToFetch,
      refresh_class_suffix: '-student-time'
    });
    loadingData.set(false);
    console_log_conditional('result.createdAt.toLocaleString()', result.createdAt.toLocaleString());
  });
}

