import {setupSequenceParameters, setupSubjectParameters} from "../../../helpers/parameters";

let d3 = require('d3');
let d3ScaleChromatic = require("d3-scale-chromatic");
let chosen = require("chosen-js");

import {getSequences} from "../../../helpers/sequences";
import {getStudents, getStudent} from "../../../helpers/students";
import {clone_object} from "../../../helpers/objects";

// const envSet = new ReactiveVar(false);
const obsOptions = new ReactiveVar([]);
const selectedEnvironment = new ReactiveVar(false);
const selectedObservations = new ReactiveVar([]);
const selectedDatasetType = new ReactiveVar('contributions');
const students = new ReactiveVar([]);
const selectedStudent = new ReactiveVar(false);
const selectedStudentContribDimension = new ReactiveVar(false);
const selectedStudentTimeDimension = new ReactiveVar(false);
const totalContributions = new ReactiveVar(0);

const currentDemoFilters = new ReactiveVar(false);

// const selectedDemographic = new ReactiveVar(false);
// const selectedDiscourseDimension = new ReactiveVar(false);
// const selectedDiscourseOption = new ReactiveVar(false);
// let timeline;

Template.heatmapReport.helpers({
  environments: function() {
    // //console.log('envs', Environments.find());
    let envs = Environments.find().fetch();
    //console.log('envs', envs);
    // let default_set = false;
    envs = envs.map(function(env) {
      let obsOpts = getObsOptions(env._id);
      //console.log('obs_opts', obsOpts);
      if (obsOpts.length === 0) {
        env.envName += ' (no observations)';
        env.disabled = 'disabled';
      }
      // else if (obsOpts.length < 1) {
      //   env.envName += ' (' + obsOpts.length + ')';
      //   env.disabled = 'disabled';
      // }
      // else if (!default_set) {
        // default_set = true;
        // env.default = 'selected';
      // }
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
    return getSelectedObservations();
  },
  observationsOptions: function() {
    return obsOptions.get();
  },
  observationNames: function() {
    let observations = getSelectedObservations();
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
      demo_opt.options = demo_opt.options.split(',').map(function(item) { return item.trim() });
      return demo_opt;
    });

    console.log('demo_options', demo_options);

    return demo_options;
  },
  discourseparams: function() {
    return getDiscourseDimensions();
  },
  showFilters: function() {
    return (students.get().length > 0) && (selectedObservations.get().length > 0);
  },
  demo_available: function() {
    setTimeout(function(){$(".chosen-select").trigger("chosen:updated");}, 100);
    return !!selectedEnvironment.get() && !!(selectedObservations.get().length >= 2) ? '' : 'disabled'
  },
  disc_available: function() {
    setTimeout(function(){$(".chosen-select").trigger("chosen:updated");}, 100);
    return !!selectedEnvironment.get() && !!(selectedObservations.get().length >= 2) ? '' : 'disabled'
  },
  disc_options_available: function() {
    setTimeout(function(){$(".chosen-select").trigger("chosen:updated");}, 100);
    return !!selectedDiscourseDimension.get() && !!selectedEnvironment.get() && !!(selectedObservations.get().length >= 2) ? '' : 'disabled'
  },
  selected_discourse_options: function() {
    return getDiscourseOptions();
  },
  dataset_types: function() {
    return [
      // {
      //   id: 'equity',
      //   name: 'Equity Ratio',
      //   default: 'default'
      // },
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
  selectedStudent: function() {
    return selectedStudent.get();
  },
  arrayify: function(obj) {
    let result = [];
    for (let key in obj) {
      result.push({name:key,value:obj[key]});
    }
    return result;
  },
  totalContributions: function() {
    return totalContributions.get()
  }
});


let getDemographics = function() {
  let envId = selectedEnvironment.get();
  if (!envId) {
    return []
  }
  return setupSubjectParameters(envId);
};
//
// let getDiscourseDimensions = function() {
//   let envId = selectedEnvironment.get();
//   if (!envId) {
//     return []
//   }
//   return setupSequenceParameters(envId);
// };
//
// let getDiscourseOptions = function() {
//   let options = getDiscourseDimensions();
//   let selected_disc_dim = selectedDiscourseDimension.get();
//   if (selected_disc_dim === false) {
//     return [];
//   }
//   // console.log('options', options, 'selected_disc_dim', selected_disc_dim);
//   let opt = options.find(opt => opt.name === selected_disc_dim);
//   // console.log('opt', opt);
//   return opt
//     .options.split(',').map(function(opt) {return {name: opt.trim()}})
// };

//
// let getDemographicOptions = function() {
//   let options = getDemographics();
//   let selected_demo = selectedDemographic.get();
//   let opt =  options.find(opt => opt.name === selected_demo);
//   //console.log('opt', opt);
//   return opt
//     .options.split(',').map(function(opt) {return {name: opt.trim()}})
// };
//

let getEnvironment = function() {
  let envId = selectedEnvironment.get();
  return Environments.findOne({_id: envId})
}

let getSelectedObservations = function() {
  let obsIds = selectedObservations.get();
  // console.log('getSelectedObservations', obsIds);
  return Observations.find({_id: {$in: obsIds}}).fetch();
}


Template.heatmapReport.events({
  'change #env-select': function(e) {

    let selected = $('option:selected', e.target);
    //console.log('env-select,', selected.val());
    clearGraph();

    selectedEnvironment.set(selected.val());
    // selectedDiscourseOption.set(false);
    clearObservations();
    obsOptions.set(getObsOptions());
    students.set(getStudents(selectedEnvironment.get()));
    // setTimeout(setupVis, 50);

    $('#disc-select').val('');
    $('#demo-select').val('');
    $('#disc-opt-select').val('');

    let blank_filters = getDemographics().map(function(demo) {
      return {
        name: demo.name,
        selected: []
      }
    })
    currentDemoFilters.set(blank_filters);
  },

  'change #student-contributions-graph__disc-select': function(e) {
    let selected = $('option:selected', e.target);
    selectedStudentContribDimension.set(selected.val());
    updateStudentContribGraph()
  },
  'change #student-participation-time__disc-select': function(e) {
    let selected = $('option:selected', e.target);
    selectedStudentTimeDimension.set(selected.val());
    updateStudentTimeGraph()
  },
  'change #dataset-type-select': function(e) {
    let selected = $('option:selected', e.target);
    selectedDatasetType.set(selected.val());
    updateGraph();
    updateStudentContribGraph();
    updateStudentTimeGraph();
  },
  'click .option--all-observations': function(e) {
    selectedObservations.set([]);
    $('.option--observation').removeClass('selected').click()

  },
  'click .option--observation': function(e) {
    let $target = $(e.target);
    if (!$target.hasClass('selected')) {
      $target.addClass('selected');
    }
    else {
      $target.removeClass('selected');
    }

    let clickedObservationId = $(e.target).attr('data-obs-id');
    let currentObsIds = selectedObservations.get();

    if (currentObsIds.find(id => id === clickedObservationId)) {
      currentObsIds.splice(currentObsIds.indexOf(clickedObservationId), 1);
    }
    else {
      currentObsIds.push(clickedObservationId);
    }

    selectedObservations.set(currentObsIds);

    if (currentObsIds.length === 0) {
      selectedStudent.set(false);
      // students.set([]);
    }

    updateGraph();

    updateStudentContribGraph();
    updateStudentTimeGraph();
    // setTimeout(function(){$(window).trigger('updated-filters')}, 100) // We're also forcing a graph update when you select new observations, not just changing params
  },
  'click .student-spotlight__close': function() {
    selectedStudent.set(false);
  },
  'change .filters__wrapper .filter': function() {
    let selected_filters = getDemographics().map(function(demo) {
      let selected_options = $('.filters__wrapper .filter[data-filter-demo-name="' + demo.name + '"] option:selected');
      let opts = []
      selected_options.each(function(key) {
        opts.push($(selected_options[key]).val());
      })
      return {
        name: demo.name,
        selected: opts
      }
    })
    currentDemoFilters.set(selected_filters);
    let student_boxes = $('.student-box');
    student_boxes.each(function(student_key) {
      let $student = $(student_boxes[student_key]);
      let student_data = students.get().find(student => student._id === $student.attr('id'))

      let allowed = selected_filters.map(function(filter) {
        if (filter.selected.length === 0) {
          return true;
        }
        return (filter.selected.indexOf(student_data.info[filter.name]) >= 0)
      }).reduce((a,b) => a && b);

      $student.removeClass('disabled-student');
      if (!allowed) {
        $student.addClass('disabled-student');
      }
    })
    updateGraph()
  }
})


let createHeatmapData = function() {
  let ret = {
    contributions_dataset: []
  };

  let envId = selectedEnvironment.get();
  let obsIds = selectedObservations.get();
  // let demo = selectedDemographic.get();
  // let dimension = selectedDiscourseDimension.get();
  // let option = selectedDiscourseOption.get();
  let allStudents = getStudents(envId);
  // let demo_opts = getDemographicOptions();

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
      studentId: student._id,
      student: student,
      data_x: student.data_x,
      data_y: student.data_y,
      count: 0,
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

  return ret
};

let sidebar;

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

let updateGraph = function() {
  let heatmap_wrapper = $('.heatmap-report-wrapper');
  let heatmap_selector = '.heatmap-report__graph';

  if (selectedObservations.get().length < 1) {
    // heatmap_wrapper.html('');
    // heatmap_wrapper.removeClass('heatmap-created')
    return;
  }

  let data = createHeatmapData();
  updateTotalContribs(data.contributions_dataset);

  if (!heatmap_wrapper.hasClass('heatmap-created')) {
    heatmap_wrapper.addClass('heatmap-created');

    initHeatmapGraph(data, heatmap_selector)
  }
  else {
    updateHeatmapGraph(data, heatmap_selector)
  }
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

    // creates an array of boolean values for if the student matches each filter, then reduces it.
    let allowed = filters.map(function(filter) {
      if (filter.selected.length === 0) {
        return true;
      }
      return (filter.selected.indexOf(student_data.info[filter.name]) >= 0)
    }).reduce((a,b) => a && b);

    $student.removeClass('disabled-student');
    if (!allowed) {
      $student.addClass('disabled-student');
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

  data = full_data.contributions_dataset;

  let count_scale = d3.scaleSequential(d3.interpolateViridis)
    .domain([0, d3.max(data, d => d.count)]);

  updateHeatmapKey('.heatmap-report__graph-key', count_scale);

  let g = d3.select('#heatmap-d3-wrapper');
  let boxes = g.selectAll(".student-box")
    .data(data);

  boxes.enter()
    .append('div')
    .attr('id', d => d.studentId)
    .attr('data-x', d => d.student.data_x)
    .attr('data-y', d => d.student.data_y)
    .attr('data-contrib-count', d => d.count)
    .attr('class', 'dragger student-box c--observation__student-box-container')
    .html(d => '<p class="c--observation__student-box">' + d.student.info.name + ' (' + d.count + ')</p>')
    .style('transform', function(d) { return "translate(" + d.student.data_x + "px, " + d.student.data_y + "px)" })
    .style('background-color', d => count_scale(d.count))
    .on('click', function() {
      selectStudentForModal($(this).attr('id'));
    });

  scale = d3.select()
};

let selectStudentForModal = function(studentId) {
  selectedStudent.set(getStudent(studentId, selectedEnvironment.get()));
}

let updateHeatmapGraph = function(full_data, containerSelector) {
  let data;

  data = full_data.contributions_dataset;

  // initHeatmapGraph(full_data, containerSelector)

  let count_scale = d3.scaleSequential(d3.interpolateViridis)
    .domain([0, d3.max(data, d => d.count) * 1.2]);

  updateHeatmapKey('.heatmap-report__graph-key', count_scale);


  let g = d3.select('#heatmap-d3-wrapper');
  let boxes = g.selectAll(".student-box")
    .data(data);

  boxes.enter()
    .append('div')
    .attr('id', d => d.studentId)
    .attr('data-x', d => d.student.data_x)
    .attr('data-y', d => d.student.data_y)
    .attr('class', 'dragger student-box c--observation__student-box-container')
    // .html(d => '<p class="c--observation__student-box">' + d.student.info.name + ' (' + d.count + ')</p>')
    .style('transform', function(d) { return "translate(" + d.student.data_x + "px, " + d.student.data_y + "px)" })
    .merge(boxes)
    .html(d => '<p class="c--observation__student-box">' + d.student.info.name + ' (' + d.count + ')</p>')
    .transition()
    .duration(500)
    .attr('data-contrib-count', d => d.count)
    .style('background-color', function(d){return count_scale(d.count)});
};



let updateHeatmapKey = function(selector, color_axis) {
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

let getObsOptions = function(envId) {
  if (typeof envId === 'undefined') {
    envId = selectedEnvironment.get();
  }
  if (!!envId) {
    let obs = Observations.find({envId: envId}).fetch();
    return obs;
  }
  else {
    return false;
  }
}

let clearObservations = function() {
  //console.log('TODO: CLEAN OBSERVATIONS');
  clearParameters();
  selectedObservations.set([]);
  $('.option--observation').removeClass('selected');

};

let clearParameters = function() {
  //console.log('TODO: CLEAN PARAMS')
};


let getObservations = function() {
  let obsIds = selectedObservations.get();
  return Observations.find({_id: {$in: obsIds}}).fetch();
}


let getDiscourseDimensions = function() {
  let envId = selectedEnvironment.get();
  if (!envId) {
    return []
  }
  return setupSequenceParameters(envId);
};

let getDiscourseOptionsForDimension = function(dimension) {
  let options = getDiscourseDimensions();
  if (dimension === false) {
    return [];
  }
  let opt = options.find(opt => opt.name === dimension);
  // console.log('opt', opt);
  return opt
    .options.split(',').map(function(opt) {return {name: opt.trim()}})
};


let updateStudentContribGraph = function () {
  let selector = '.student-contributions-graph__graph';

  let dimension = selectedStudentContribDimension.get();

  if (dimension === false) {
    return;
  }
  if (selectedObservations.get().length < 1) {
    return;
  }

  let data = createStudentContribData();

  studentContribGraph(data, selector)
};

let createStudentContribData = function() {
  let ret = [];

  let envId = selectedEnvironment.get();
  let obsIds = selectedObservations.get();
  let student = selectedStudent.get();

  let dimension = selectedStudentContribDimension.get();
  let disc_opts = getDiscourseOptionsForDimension(dimension);
  // let demo_opts = getDemographicOptions();
  ret = disc_opts.map(function(opt) {
    return {
      name: opt.name,
      count: 0,
    }
  });

  for (let obsId_k in obsIds) {
    if (!obsIds.hasOwnProperty(obsId_k)) continue;
    let obsId = obsIds[obsId_k];
    let sequences = getSequences(obsId, envId);
    for (let sequence_k in sequences) {
      if (!sequences.hasOwnProperty(sequence_k)) continue;
      let sequence = sequences[sequence_k];
      disc_opts.map(function(opt) {
        if (sequence.info.parameters[dimension] === opt.name &&
          sequence.info.student.studentId === student._id) {
          let ds_index = ret.findIndex(datapoint => datapoint.name === opt.name);
          ret[ds_index].count += 1;
          // total += 1;
        }
      });
    }
  }

  let total = 0;
  ret.forEach(function(opt) {
    total += opt.count;
  });

  ret.push({
    name: 'Total',
    count: total,
  });

  return ret
};
let studentContribGraph = function(data, selector) {
  svg = $('<svg width="718" height="400">' +
    '<defs>\n' +
    '  <style type="text/css">\n' +
    '    @font-face {\n' +
    '      font-family: Roboto;\n' +
    '      @import url(\'https://fonts.googleapis.com/css?family=Roboto:300,400,700\');\n' +
    '    }\n' +
    '  </style>\n' +
    '</defs>' +
    '</svg>');
  $(selector).html(svg);

  let container = d3.select(selector + ' svg'),
    margin = {top: 30, right: 20, bottom: 80, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = container.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  let x = d3.scaleBand() // inside each group
    .range([0, width])
    .padding(0.10);

  let y = d3.scaleLinear()
    .rangeRound([height, 0]);

  x.domain(data.map(d => d.name))
  y.domain([0, d3.max(data, d => d.count)]);

  g.selectAll("bar")
    .data(data)
    .enter().append("rect")
    .style("fill", "steelblue")
    .attr("x", function(d) { return x(d.name); })
    .attr("width", x.bandwidth())
    .attr("y", function(d) { return y(d.count); })
    .attr("height", function(d) { return height - y(d.count); });

  g.append('g')
    // .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  g.append("g")
    // .attr("class", "axis axis--y")
    .call(d3.axisLeft(y).tickFormat(function(e){
        if(Math.floor(e) !== e) {
          return;
        }
        return e;
      })
    )
};

let updateStudentTimeGraph = function () {
  let selector = '.student-participation-time__graph';

  let dimension = selectedStudentTimeDimension.get();

  if (dimension === false) {
    return;
  }
  if (selectedObservations.get().length < 2) {
    return;
  }

  let data = createStudentTimeData();

  studentTimeGraph(data, selector)
}

let createStudentTimeData = function() {

  let ret = {
    contributions_dataset: []
  };

  let student = selectedStudent.get();

  let dimension = selectedStudentTimeDimension.get();
  let disc_opts = getDiscourseOptionsForDimension(dimension);

  let envId = selectedEnvironment.get();
  let obsIds = selectedObservations.get();


  for (let obsId_k in obsIds) {

    if (!obsIds.hasOwnProperty(obsId_k)) continue;
    let obsId = obsIds[obsId_k];

    let sequences = getSequences(obsId, envId);
    for (let sequence_k in sequences) {
      if (!sequences.hasOwnProperty(sequence_k)) continue;
      let sequence = sequences[sequence_k];

      if (!ret.contributions_dataset.find(datapoint => datapoint.obsId === obsId)) {
        // If it wasn't there:
        let obsers = getObservations();

        let obs = obsers.find(obs => obs._id === obsId);
        let parseTime = d3.timeParse('%Y-%m-%d');
        let datapoint = {
          obsId: obsId,
          d3date: parseTime(obs.observationDate),
          obsName: obs.name,
          date: obs.observationDate,
          _total: 0,
        };

        disc_opts.forEach(function (opt) {
          datapoint[opt.name] = 0
        });

        ret.contributions_dataset.push(datapoint)
      }

      if (sequence.info.student.studentId !== student._id) {
        continue;
      }

      let seq_disc_opt = sequence.info.parameters[dimension];
      let ds_index = ret.contributions_dataset.findIndex(datapoint => datapoint.obsId === obsId);

      ret.contributions_dataset[ds_index]._total += 1;
      ret.contributions_dataset[ds_index][seq_disc_opt] += 1;

    }
  }

  ret.contributions_dataset.forEach(function(obs) {
    obs.max = obs._total;
  });

  console.table(ret.contributions_dataset);
  return ret.contributions_dataset

}
let studentTimeGraph = function(data, selector) {

  data = data.sort(function(a, b) {return a.d3date - b.d3date});

  svg = $('<svg width="718" height="500">' +
    '<defs>\n' +
    '  <style type="text/css">\n' +
    '    @font-face {\n' +
    '      font-family: Roboto;\n' +
    '      @import url(\'https://fonts.googleapis.com/css?family=Roboto:300,400,700\');\n' +
    '    }\n' +
    '  </style>\n' +
    '</defs>' +
    '</svg>');
  $(selector).html(svg);

  let svg = d3.select(selector + " svg"),
    margin = {top: 30, right: 20, bottom: 40, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr('class', 'graph-container').attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  let x = d3.scaleTime()
    .domain(d3.extent(data, d => d.d3date))
    .range([0, width]);

  let y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.max)])
    .range([height, 0]);


  // let lines = [];
  let dim = selectedStudentTimeDimension.get();
  let discdims = getDiscourseOptionsForDimension(dim);

  let total_line = d3.line()
    .x(function(d) { return x(d.d3date)})
    .y(function(d) { return y(d._total)});

  let lines = discdims.map(function(dim) {
    let line = d3.line()
      .x(d => x(d.d3date))
      .y(d => y(d[dim.name]));

    return {line: line, dim: dim};
  });


  //
  // let valLine = d3.line()
  //   .x(function(d) {return x(d.date)})
  //   .y(function(d) {return y(d.value)})


  g.append('path')
    .data([data])
    .attr('class', 'line line--total')
    .style("stroke-width", 2)
    .attr('d', total_line);

  let key_colors = getLabelColors(getDiscourseOptionsForDimension(dim).map(demo_opt => demo_opt.name));
  let z = d3.scaleOrdinal()
    .range(Object.values(key_colors));

  updateStudentTimeKey('.student-participation-time__graph_key', discdims, z)

  lines.forEach(function(line) {

    g.append('path')
      .data([data])
      .attr('class', 'line line--discdim')
      .style("stroke", z(line.dim.name))
      .style("stroke-width", 2)
      .attr('d', line.line);

    g.append('g')
      .attr('class', 'dot-container')
      .selectAll('dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('r', 3)
      .attr('class', 'dot')
      .attr('cx', d => x(d.d3date))
      .attr('cy', d => y(d[line.dim.name]))
      .attr('data-dim-name', line.dim.name)
      .style("fill", z(line.dim.name))
      // .on('mouseover', function(d) {
        // d['line_name'] = line.dim.name;
        // let data = [];
        // let circles = g.selectAll('circle[cx="' + x(d.d3date) + '"][cy="' + y(d[line.dim.name]) + '"]');
        // if (circles.size() > 1) {
        //   //console.log('more than one circle');
        //   //console.log('d', d);
        //   //console.log('this', this);
        //   //console.log('circles', circles);
        //   circles.each(function(d) {
        //     let datum = clone_object(d);
        //     datum.line_name = $(this).attr('data-demo-name');
        //     data.push(datum)
        //   });
        // }
        // else {
        //   data = [d];
        // }

        //console.log('abut to use data', data);

        // buildBarTooltipSlide(data, z)
      // })
      // .on('mouseout', function() {
      //   sidebar.setCurrentPanel('start', 250)
      // });

  });

  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr('class', 'x-axis')
    .call(d3.axisBottom(x));

  // Add the Y Axis
  g.append("g")
    .attr('class', 'y-axis')
    .call(d3.axisLeft(y));

}

let updateStudentTimeKey = function(key_wrapper, y_values, color_axis) {
  let key_chunks = y_values.map(function(label) {
    let color = color_axis(label.name)
    return `<span class="key--label"><span class="key--color" style="background-color: ${color}"></span><span class="key--text">${label.name}</span></span>`
  })

  let html = `${key_chunks.join('')}`;
  $(key_wrapper).html(html)
}