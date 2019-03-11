import {setupSequenceParameters, setupSubjectParameters} from "../../../helpers/parameters";

let d3 = require('d3');
let d3ScaleChromatic = require("d3-scale-chromatic");
let d3Interpolate = require("d3-interpolate");
let chosen = require("chosen-js");
import vis from "vis";


import {getSequences} from "../../../helpers/sequences";
import {getStudents, getStudent} from "../../../helpers/students";

// const envSet = new ReactiveVar(false);
const obsOptions = new ReactiveVar([]);
const selectedEnvironment = new ReactiveVar(false);
const selectedObservations = new ReactiveVar([]);
const selectedDatasetType = new ReactiveVar('contributions');
const selectedDemographic = new ReactiveVar(false);
const students = new ReactiveVar([]);
const selectedStudent = new ReactiveVar(false);
const selectedSpotlightDimension = new ReactiveVar(false);

let timeline;



let setupVis = function() {
  // Intentionally duplicated to allow for easier customization on a per-report-type basis.
  let observations = obsOptions.get();
  // //console.log('observations', observations);
  let obs = observations.map(function(obs) {
    // console.log('obse', obs);
    return {
      id: obs._id,
      // content: obs.name + '<br/>(' + obs.observationDate + ')',
      content: obs.name + ' (' + obs.observationDate + ')',
      compare_date: new Date(obs.observationDate),
      start: obs.observationDate,
      className: getSequences(obs._id, obs.envId).length < 1 ? 'disabled' : ''
    }
  })
  let items = new vis.DataSet(obs);
  let container = document.getElementById('vis-container');
  $(container).html('');
  let options = {
    multiselect: true,
    zoomable: false,
  }
  timeline = new vis.Timeline(container, items, options);
  timeline.on('select', function(props) {
    if (props.event.firstTarget.classList.contains('vis-group')) {
      timeline.setSelection(selectedObservations.get());
      return;
    }
    if (props.items.length > 1) {
      selectedObservations.set(props.items);
    } else {
      let currentObs = selectedObservations.get();
      let obsIndex = currentObs.indexOf(props.items[0])
      if (obsIndex === -1) {
        currentObs.push(props.items[0])
      }
      else {
        currentObs.splice(obsIndex, 1)
      }
      selectedObservations.set(currentObs);
      timeline.setSelection(currentObs);
    }
    if (selectedObservations.get().length === 0) {
      selectedStudent.set(false);
    }

    updateStudentContribGraph();
    updateStudentTimeGraph();
    setTimeout(updateGraph, 200);
  });

  let recent_obs = obs.sort(function(a, b) {return a.compare_date - b.compare_date}).slice(Math.max(obs.length - 8, 1));
  let recent_obs_ids = recent_obs.map(obs => obs.id);
  timeline.focus(recent_obs_ids);

  return timeline
}



Template.histogramReport.events({
  'change #env-select': function(e) {
    let selected = $('option:selected', e.target);
    clearGraph();

    selectedEnvironment.set(selected.val());
    obsOptions.set(getObsOptions());
    students.set(getStudents(selectedEnvironment.get()));
    console.log('students', students.get());
    setTimeout(setupVis, 50);

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
    return getDiscourseDimensions();
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
  ret.quartiles = get_ntiles(all_counts, 4, true, 'quartile'); //quartiles
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
      name: '0',
      min_exclusive: -1,
      max_inclusive: 0,
    })
  }

  let max_value = Math.max(values);
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

let getObservations = function() {
  let obsIds = selectedObservations.get();
  return Observations.find({_id: {$in: obsIds}}).fetch();
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
  if (typeof opt === 'undefined') {
    return [];
  }
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

  let data = createStudentContribData();

  studentContribGraph(data, selector)
};

let createStudentContribData = function() {
  let ret = [];

  let envId = selectedEnvironment.get();
  let obsIds = selectedObservations.get();
  let student = selectedStudent.get();

  let dimension = selectedSpotlightDimension.get();
  let disc_opts = getDiscourseOptionsForDimension(dimension);
  // let demo_opts = getDemographicOptions();

  ret = disc_opts.map(function(opt) {
    return {
      name: opt.name,
      count: 0,
      all_students: students.get().map(stud => ({id: stud._id, count: 0})),
      class_total: 0,
    }
  });

  let all_students = students.get().map(stud => ({id: stud._id, count: 0}));

  for (let obsId_k in obsIds) {
    if (!obsIds.hasOwnProperty(obsId_k)) continue;
    let obsId = obsIds[obsId_k];
    let sequences = getSequences(obsId, envId);
    for (let sequence_k in sequences) {
      if (!sequences.hasOwnProperty(sequence_k)) continue;
      let sequence = sequences[sequence_k];
      disc_opts.map(function(opt) {
        if (sequence.info.parameters[dimension] === opt.name) {
          let ds_index = ret.findIndex(datapoint => datapoint.name === opt.name);
          ret[ds_index].class_total += 1;
          ret[ds_index].all_students.filter(stud => stud.id === sequence.info.student.studentId)[0].count += 1;
          all_students.filter(stud => stud.id === sequence.info.student.studentId)[0].count += 1;
          if (sequence.info.student.studentId === student._id) {
            ret[ds_index].count += 1;
            // total += 1;
          }
        }
      });
    }
  }


  let total = ret.map(d => d.count).reduce((a, b) => a + b, 0);

  let class_total = ret.map(d => d.class_total).reduce((a, b) => a + b, 0);

  let num_students = students.get().length;
  ret.forEach(function(opt) {
    let all_counts = opt.all_students.map(d => d.count);
    opt.median = get_median(all_counts);
    opt.average = get_average(all_counts);
  });

  ret.push({
    name: 'Total',
    count: total,
    class_total: class_total,
    average: class_total / num_students,
    median: get_median(all_students.map(d => d.count)),
  });

  return ret
};

function get_median(values) {
  if (values.length === 0) {
    return 0;
  }

  values.sort((a, b) => a - b);

  let mid_point = Math.floor(values.length / 2);

  if (values.length % 2) {
    return values[mid_point]
  }
  else {
    return (values[mid_point] + values[mid_point - 1]) / 2.;
  }
}
function get_average(values) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((a, b) => a + b, 0) / values.length
}

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
  // .range([0, width])
    .padding(0.10);

  let y = d3.scaleLinear()
    .rangeRound([height, 0]);

  let x_group = d3.scaleBand() // each group
    .rangeRound([0, width])
    .paddingInner(0.1);

  x_group.domain(data.map(d => d.name));
  x.domain(['value', 'median']).rangeRound([0, x_group.bandwidth()]);
  y.domain([0, d3.max(data, d => d.count)]);

  let median_color = '#999999ff';
  let total_color = '#555555ff';

  let key_colors = getLabelColors(data.map(d => d.name));
  key_colors.Total = total_color;
  key_colors.Median = median_color;
  let z = d3.scaleOrdinal()
    .range(Object.values(key_colors));
  updateStudentContribKey('.student-contributions-graph__graph-key', Object.keys(key_colors), z)

  let groups = g.append("g")
    .selectAll("bar")
    .data(data)
    .enter().append('g')
    .attr("transform", function(d) {
      return "translate(" + x_group(d.name) + ",0)"
    })
    .attr("class", 'bar-group')
    .selectAll('rect')
    .data(function(d) {
      return data.filter(i => i.name === d.name)
    })
    .enter();

  groups.append("rect")
    .style("fill", d => z(d.name))
    .attr("x", x("value"))
    .attr("width", x.bandwidth())
    .attr("y", function(d) { return y(d.count); })
    .attr("height", function(d) { return height - y(d.count); });

  groups.append("rect")
    .style("fill", z('Median'))
    .attr("x", x("median"))
    .attr("width", x.bandwidth())
    .attr("y", function(d) { return y(d.median); })
    .attr("height", function(d) { return height - y(d.median); });

  g.append('g')
  // .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x_group));

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

let updateStudentContribKey = function(key_wrapper, y_values, color_axis) {
  let key_chunks = y_values.map(function(label) {
    return `<span class="key--label"><span class="key--color" style="background-color: ${color_axis(label)}"></span><span class="key--text">${label}</span></span>`
  })

  let html = `${key_chunks.join('')}`;
  $(key_wrapper).html(html)
}

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

  let data = createStudentTimeData();

  studentTimeGraph(data, selector)
}

let createStudentTimeData = function() {

  let ret = {
    contributions_dataset: []
  };

  let student = selectedStudent.get();

  let dimension = selectedSpotlightDimension.get();
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
  let dim = selectedSpotlightDimension.get();
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

  updateStudentTimeKey('.student-participation-time__graph-key', discdims, z)

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
  });

  let ticks = data.map(datum => datum.d3date);

  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr('class', 'x-axis')
    .call(d3.axisBottom(x).tickValues(ticks));

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