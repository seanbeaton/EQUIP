import {setupSequenceParameters, setupSubjectParameters} from "../../../../helpers/parameters";

let d3 = require('d3');
let d3ScaleChromatic = require("d3-scale-chromatic");
let d3Interpolate = require("d3-interpolate");
let chosen = require("chosen-js");
import vis from "vis";


import {getSequences} from "../../../../helpers/sequences";
import {getStudents, getStudent} from "../../../../helpers/students";
import {setupVis} from "/helpers/timeline";
import {
  createStudentContribData,
  createStudentTimeData, get_average, get_median,
  getDiscourseDimensions,
  getDiscourseOptionsForDimension, studentContribGraph,
  studentTimeGraph
} from "../../../../helpers/graphs";

// const envSet = new ReactiveVar(false);
const obsOptions = new ReactiveVar([]);
const selectedEnvironment = new ReactiveVar(false);
const selectedObservations = new ReactiveVar([]);
const selectedDatasetType = new ReactiveVar('contributions');
const selectedDemographic = new ReactiveVar(false);
const students = new ReactiveVar([]);
const selectedStudent = new ReactiveVar(false);
const selectedSpotlightDimension = new ReactiveVar(false);

Template.histogramReport.events({
  'change #env-select': function(e) {
    let selected = $('option:selected', e.target);
    clearGraph();

    selectedEnvironment.set(selected.val());
    obsOptions.set(getObsOptions());
    students.set(getStudents(selectedEnvironment.get()));
    console.log('students', students.get());
    setTimeout(function() {
      setupVis('vis-container', function() {
        if (selectedObservations.get().length === 0) {
          selectedStudent.set(false);
        }
        updateStudentContribGraph();
        updateStudentTimeGraph();
        setTimeout(updateGraph, 200);
      }, obsOptions, selectedObservations, 'whole_class');
    }, 50);


    $('#histogram-demographic').val('');
  },
  'change #histogram-demographic': function(e) {
    let selected = $('option:selected', e.target);
    selectedDemographic.set(selected.val());
    updateGraph();
  },
  'change #student-spotlight__discourse-select': function(e) {
    let selected = $('option:selected', e.target);
    selectedSpotlightDimension.set(selected.val());
    updateStudentContribGraph();
    updateStudentTimeGraph();
  },
  'click .student-spotlight__close': function() {
    selectedStudent.set(false);
  },
});


Template.histogramReport.helpers({
  environments: function() {
    let envs = Environments.find().fetch();
    envs = envs.map(function(env) {
      let obsOpts = getObsOptions(env._id);
      //console.log('obs_opts', obsOpts);
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
  environment: function() {
    return getEnvironment();
  },
  observations: function() {
    return getSelectedObservations();
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
})


Template.histogramReport.rendered = function(){

};


let clearGraph = function() {
  students.set([])
  selectedObservations.set([]);
  selectedStudent.set(false);
  $('.histogram-report-wrapper').removeClass('heatmap-created');
  $('#histogram-d3-wrapper').html('');
  $('.histogram-report__graph-key').html('');
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

let updateGraph = function() {
  let histogram_wrapper = $('.histogram-report-wrapper');
  let histogram_selector = '#histogram-d3-wrapper';

  if (selectedObservations.get().length < 1) {
    // heatmap_wrapper.html('');
    // heatmap_wrapper.removeClass('heatmap-created')
    return;
  }

  let data = createHistogramData();

  if (!histogram_wrapper.hasClass('histogram-created')) {
    histogram_wrapper.addClass('histogram-created');

    initHistogram(data, histogram_selector)
  }
  else {
    $('#heatmap-d3-wrapper').html('');
    updateHistogram(data, histogram_selector)
  }
  // updateFilteredStudents()
}

let createHistogramData = function() {
  let ret = {
    students: [],
    // groups: []
  };

  let envId = selectedEnvironment.get();
  let obsIds = selectedObservations.get();
  let allStudents = getStudents(envId);

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


  allStudents.map(function(student) {
    for (let obsId_k in obsIds) {

      if (!obsIds.hasOwnProperty(obsId_k)) continue;
      let obsId = obsIds[obsId_k];

      let sequences = getSequences(obsId, envId);
      for (let sequence_k in sequences) {
        if (!sequences.hasOwnProperty(sequence_k)) continue;
        let sequence = sequences[sequence_k];
        let ds_index = ret.students.findIndex(datapoint => datapoint.studentId === student._id);
        if (sequence.info.student.studentId === student._id) {
          ret.students[ds_index].count += 1;
        }
      }
    }
  });


  let all_counts = ret.students.map(d => d.count);
  ret.median = get_median(all_counts);
  ret.average = (all_counts);
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

  console.table(ret.students);
  console.table(ret.quartiles);

  return ret
}

let get_ntiles = function(values, n, zero_separate, ntile_name) {
  if (typeof ntile_name === 'undefined') {
    ntile_name = n + '-tile';
  }
  let ret = []
  if (zero_separate) {
    ret.push({
      name: 'No contributions',
      min_exclusive: -1,
      max_inclusive: 0,
    })
  }

  let max_value = Math.max(...values);
  if (n > max_value) {
    n = max_value;
  }
  let group_size = values.length / n;
  let min = -1;
  if (zero_separate) {
    min = 0
  }
  for (let i = 1; i <= n; i++) {
    let index = Math.min(Math.round(i * group_size), values.length - 1)
    let max = values[index];
    ret.push({
      name: get_ordinal_suffix(i) + '&nbsp;' + ntile_name,
      min_exclusive: min,
      max_inclusive: max
    });
    min = max;
  }
  return ret;
}

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
  console.log('values, ', values)
  console.log('step, ', step)
  for (let i = 1; i <= n; i++) {
    console.log('i', i);
    max = Math.ceil(step * i);
    console.log('min and max', min, max);
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

  console.log('rett', ret);
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

let selectStudentForModal = function(studentId) {
  selectedStudent.set(getStudent(studentId, selectedEnvironment.get()));
}

let initHistogram = function(data, selector) {
  let container = $(selector + '');
  let markup = data.quartiles.map(function(quartile) {
    let markup = "<div class='student-group'>" +
      "<div class='student-group__title'>" + quartile.name + "</div>" +
      "<div class='student-group__students'>" +
      quartile.students.map(function(student) {
        return '<div id="' + student.studentId + '" class="dragger student-box c--observation__student-box-container">' +
          '<p class="c--observation__student-box">' + student.name + (student.show_count ? ' (' + student.count + ')' : '') +'</p>' +
          '</div>'
      }).join('') +
      "</div>" +
      "</div>";
    return markup;
  }).join('');
  container.html(markup);

  $('.student-box').on('click', function() {
    selectStudentForModal($(this).attr('id'));
  });

  // let dim = selectedDemographic.get();
  let key_options = getDemographicOptions().map(demo_opt => demo_opt.name);

  if (key_options.length > 0) {
    let key_colors = getLabelColors(key_options);
    let color_scale = d3.scaleOrdinal()
      .range(Object.values(key_colors))

    updateHistogramDemoKey('.histogram-report__graph-key', key_options, color_scale);

    let all_students = students.get();
    let demo = selectedDemographic.get();
    let student_boxes = $('.student-box');
    student_boxes.each(function(box_index) {
      let $box = $($('.student-box')[box_index]);
      console.log('box', $box);
      console.log('getting students');
      let student = all_students.filter(stud => stud._id === $box.attr('id'))[0]
      console.log('student', student);
      $box.css('background-color', color_scale(student.info.demographics[demo]));
    })
  }
  else {
    $('.histogram-report__graph-key').html('');
  }

}

let updateHistogramDemoKey = function(key_wrapper, y_values, color_axis) {
  let key_chunks = y_values.map(function(label) {
    return `<span class="key--label"><span class="key--color" style="background-color: ${color_axis(label)}"></span><span class="key--text">${label}</span></span>`
  })

  let html = `${key_chunks.join('')}`;
  $(key_wrapper).html(html)
}

let updateHistogram = function(data, selector) {
  initHistogram(data, selector);
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

//
// Below this we have only the spotlight code
// This could be refactored by somehow attaching all the fields
// (students, selected student, env, observations) to the spotlight somehow.
//

let updateStudentContribGraph = function() {
  let selector = '.student-contributions-graph__graph';

  let dimension = selectedSpotlightDimension.get();

  if (dimension === false) {
    return;
  }
  if (selectedObservations.get().length < 1) {
    return;
  }

  let data = createStudentContribData(
    selectedEnvironment.get(),
    selectedObservations.get(),
    selectedStudent.get(),
    dimension,
    getDiscourseOptionsForDimension(selectedEnvironment.get(), dimension),
    students.get()
  );

  studentContribGraph(data, selector)
};

let updateStudentTimeGraph = function () {
  let selector = '.student-participation-time__graph';

  let $selector = $(selector);

  // Wait till the graph exists.
  if ($selector.length === 0) {
    setTimeout(updateStudentTimeGraph, 50);
    return;
  }

  let dimension = selectedSpotlightDimension.get();

  if (dimension === false) {
    return;
  }
  if (selectedObservations.get().length < 2) {
    return;
  }

  let data = createStudentTimeData(
    selectedEnvironment.get(),
    selectedObservations.get(),
    selectedStudent.get(),
    dimension,
    getDiscourseOptionsForDimension(selectedEnvironment.get(), dimension)
  );

  studentTimeGraph(data, selector, selectedEnvironment.get(), dimension)
}

