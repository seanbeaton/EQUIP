import {setupSequenceParameters, setupSubjectParameters} from "/helpers/parameters";

import {getSequences} from "/helpers/sequences";
import {getStudents, getStudent} from "/helpers/students";
import {setupVis} from "/helpers/timeline";
import {getDiscourseOptionsForDimension, getObservations} from "/helpers/graphs";

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

Template.groupWorkReport.onCreated(function created() {
  this.autorun(() => {
    this.subscribe('observations');
    this.subscribe('environments');
    this.subscribe('sequences');
    this.subscribe('subjects');
    this.subscribe('subjectParameters');
    this.subscribe('sequenceParameters');
  })
});

Template.groupWorkReport.events({
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
    //console.log('disc-opt-select,', selected.val());
    selectedDiscourseOption.set(selected.val());
    updateGraph()
  },
  'click .graph-display-type__option': function(e) {
    e.preventDefault();
    groupDisplayType.set($(e.target).attr('data-display-graph-type'))
    updateGraph()
  },
});


Template.groupWorkReport.helpers({
  environments: function() {
    let envs = Environments.find().fetch();
    envs = envs.map(function(env) {
      let obsOpts = getObsOptions(env._id);
      console.log('obs_opts', obsOpts);
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
    return getDiscourseDimensions();
  },
})



let updateGraph = function() {
  let wrapper = $('.group-work-report-wrapper');
  let selector = '#group-work-d3-wrapper';

  if (selectedObservations.get().length < 1) {
    return;
  }

  let data = createData();

  if (!wrapper.hasClass('group-work-created')) {
    wrapper.addClass('group-work-created');

    initGroups(data, selector)
  }
  else {
    $('#heatmap-d3-wrapper').html('');
    updateGroups(data, selector)
  }
  // updateFilteredStudents()
}

let getStudentPadding = function(count, max) {
  let max_padding = 12;
  // the higher the count, the smaller the padding. max of 12 px.
  console.log('max, count', max ,count);
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
    console.log('student', student);
    console.log('disc_option_active', disc_option_active);
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
    console.log('group.seqs, selected dim', group.sequences, selectedDiscourseDimension.get(), disc_option_active)
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
  console.log('data', data);

  let markup = data.groups.map(function(group) {
    let total_group_contribs = getGroupTotalContribs(group);
    let highest_contribs = Math.max(...group.students.map(stud => getStudentTotalContribs(stud)));
    let markup = "";


    if (groupDisplayType.get() === 'blocks') {
      markup = "<div class='student-group'>" +
        "<div class='student-group__title'><strong>" + group.name + "</strong> - " + group.observationDate + " (n = " + total_group_contribs + ")</div>" +
        "<div class='student-group__students'>" +
        group.students.map(function(student) {
          console.log('student', student);

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

  console.log('color scale', color_scale);

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

  console.log('d3 graph', group);
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
      console.log('color for d ', d.info.demographics, 'v', d.info.demographics[selected_demo], 's', s, 'selected_demo', selected_demo)
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

let createData = function() {
  let ret = {
    groups: [],
  };

  let envId = selectedEnvironment.get();
  let observations = getObservations(selectedObservations.get());
  let obsIds = selectedObservations.get();
  let allStudents = getStudents(envId);

  ret.groups = observations.map(function(observation) {
    console.log('observation', observation);
    observation.sequences = getSequences(observation._id, envId);
    // let obs = getObs
    observation.students = observation.small_group.map(function(studId) {
      let student = getStudent(studId, envId);
      student.sequences = observation.sequences.filter(seq => seq.info.student.studentId === student._id);
      student.total_contributions = student.sequences.length;
      student.sorted_contributions = getDiscourseDimensions().map(function(dim) {
        // let sequences = student.sequences.filter(seq => console.log(seq));
        return {
          dim: dim.name,
          option_counts: dim.options.split(',')
            .map(function(opt) {return {name: opt.trim()}})
            .map(function(opt) {
              let filtered_seqs = student.sequences.filter(seq => seq.info.parameters[dim.name] === opt.name);
              console.log(opt, filtered_seqs);
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

  //
  // ret.students = allStudents.map(function(student) {
  //   return {
  //     name: student.info.name,
  //     studentId: student._id,
  //     class: '',
  //     student: student,
  //     count: 0,
  //     show_count: true,
  //     sort_first: false,
  //   }
  // });
  //
  //
  // allStudents.map(function(student) {
  //   for (let obsId_k in obsIds) {
  //
  //     if (!obsIds.hasOwnProperty(obsId_k)) continue;
  //     let obsId = obsIds[obsId_k];
  //
  //     let sequences = getSequences(obsId, envId);
  //     for (let sequence_k in sequences) {
  //       if (!sequences.hasOwnProperty(sequence_k)) continue;
  //       let sequence = sequences[sequence_k];
  //       let ds_index = ret.students.findIndex(datapoint => datapoint.studentId === student._id);
  //       if (sequence.info.student.studentId === student._id) {
  //         ret.students[ds_index].count += 1;
  //       }
  //     }
  //   }
  // });
  //
  //
  // let all_counts = ret.students.map(d => d.count);
  // ret.median = get_median(all_counts);
  // ret.average = (all_counts);
  // ret.quartiles = get_n_groups(all_counts, 4, true, 'Group'); //quartiles
  // ret.students.forEach(function(student) {
  //   student.median = get_median(all_counts);
  //   student.average = get_average(all_counts);
  // })
  //
  // ret.quartiles.forEach(function(quartile) {
  //   quartile.students = ret.students.filter(function(student) {
  //     return quartile.min_exclusive < student.count && student.count <= quartile.max_inclusive
  //   }).sort((a, b) => b.count - a.count)
  // })
  //
  // console.table(ret.students);
  // console.table(ret.quartiles);
  //
  // return ret
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


let clearGraph = function() {
  students.set([])
  selectedObservations.set([]);
  selectedStudent.set(false);
  $('.group-work-report-wrapper').removeClass('heatmap-created');
  $('#group-work-d3-wrapper').html('');
  $('.group-work-report__graph-key').html('');
}

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
  return {};
};

let studentContribGraph = function(data, selector) {

};

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
