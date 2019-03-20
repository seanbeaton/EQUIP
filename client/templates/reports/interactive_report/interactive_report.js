import {setupSequenceParameters, setupSubjectParameters} from "../../../helpers/parameters";
import {getSequences} from "../../../helpers/sequences";
import {getStudent, getStudents} from "../../../helpers/students";
import {Sidebar} from '../../../helpers/graph_sidebar';
import vis from "vis";

let timeline;

const obsOptions = new ReactiveVar([]);
const selectedEnvironment = new ReactiveVar(false);
const selectedObservations = new ReactiveVar([]);
const selectedXParameter = new ReactiveVar(false);
const selectedYParameter = new ReactiveVar(false);
const selectedDatasetType = new ReactiveVar('contributions');


Template.interactiveReport.helpers({
  environments: function() {
    let envs = Environments.find().fetch();
    // let default_set = false;
    envs = envs.map(function(env) {
      let obsOpts = getObsOptions(env._id);
      //console.log('obs_opts', obsOpts);
      if (obsOpts.length === 0) {
        env.envName += ' (no observations)';
        env.disabled = 'disabled';
      }
      // else if (obsOpts.length < 2) {
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
    observations: function() {
        // //console.log('obsOptions', obsOptions);
        return obsOptions.get()
    },
    observationChosen: function() {
        // //console.log('observationChosen', obsOptions.get(), !!(obsOptions.get()));

        return !!(selectedObservations.get().length)
    },
  demographics: function() {
    //console.log('getDemographics', getDemographics());
    return getDemographics();
  },
  discourseparams: function() {
    return getDiscourseDimensions();
  },
  demo_available: function() {
    setTimeout(function(){$(".chosen-select").trigger("chosen:updated");}, 100);
    return !!selectedEnvironment.get() && !!(selectedObservations.get().length >= 1) ? '' : 'disabled'
  },
  disc_available: function() {
    setTimeout(function(){$(".chosen-select").trigger("chosen:updated");}, 100);
    return !!selectedEnvironment.get() && !!(selectedObservations.get().length >= 1) ? '' : 'disabled'
  },
  dataset_types: function() {
    return [
      {
        id: 'contributions',
        name: 'Contributions',
        selected: 'selected'
      },
      {
        id: 'equity',
        name: 'Equity Ratio',
        selected: ''
      },
    ]
  },
  selectedDatasetType: function() {
    return selectedDatasetType.get();
  }
});


let clearGraph = function() {
  //console.log('clearing-graph');
  let timeline_selector = '.interactive-report__graph';
  $(timeline_selector + ' svg').remove();
}


var clearObservations = function() {
  clearParameters();
  selectedObservations.set([]);
  $('.option--observation').removeClass('selected');
  clearGraph();

};

var clearParameters = function() {
  selectedXParameter.set(false);
  selectedYParameter.set(false);
  $('.option--discourse').removeClass('selected');
  $('.option--demographic').removeClass('selected');
  $('.swappable').removeClass('swapped')
};

Template.interactiveReport.events({
  'change #env-select': function(e) {

    let selected = $('option:selected', e.target);
    //console.log('env-select,', selected.val());
    selectedEnvironment.set(selected.val());
    clearGraph();
    clearObservations();
    obsOptions.set(getObsOptions());
    setTimeout(setupVis, 50);

    $('#disc-select').val('');
    $('#demo-select').val('');
    $('#disc-opt-select').val('');
  },
    // 'click .option--all-observations': function(e) {
    //   selectedObservations.set([])
    //   $('.option--observation').removeClass('selected').click()
    //
    // },
    // 'click .option--observation': function(e) {
    //   // clearParameters();
    //   let $target = $(e.target);
    //   if (!$target.hasClass('selected')) {
    //     // $('.option--observation').removeClass('selected');
    //     $target.addClass('selected');
    //   }
    //   else {
    //     $target.removeClass('selected');
    //   }
    //
    //   let clickedObservationId = $(e.target).attr('data-obs-id');
    //
    //   let currentObsIds = selectedObservations.get();
    //
    //   if (currentObsIds.find(id => id === clickedObservationId)) {
    //     currentObsIds.splice(currentObsIds.indexOf(clickedObservationId), 1);
    //   }
    //   else {
    //     currentObsIds.push(clickedObservationId);
    //   }
    //
    //   selectedObservations.set(currentObsIds);
    //   updateReport();
    //   // setTimeout(function(){$(window).trigger('updated-filters')}, 100) // We're also forcing a graph update when you select new observations, not just changing params
    // },
  'change #dataset-type-select': function(e) {
    let selected = $('option:selected', e.target);
    selectedDatasetType.set(selected.val());
    $(window).trigger('updated-filters') // We're also forcing a graph update when you select new observations, not just changing params
  },
  'change .select__wrapper select': function(e) {
    selectedXParameter.set(getXAxisSelection());
    selectedYParameter.set(getYAxisSelection());
    $(window).trigger('updated-filters')
  },
  'click .swappable__button': function(e) {
    let $target = $(e.target);
    if (!$target.hasClass('.swappable__button')) {
      $target = $target.parents('.swappable__button');
    }
    $target.parents('.swappable').toggleClass('swapped');

    selectedXParameter.set(getXAxisSelection());
    selectedYParameter.set(getYAxisSelection());
    $(window).trigger('updated-filters');
  },
});


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

// let getCurrentEnvId = function() {
//     let selected = $(".option--environment.selected");
//     if (selected.length !== 0) {
//         return selected.attr('data-env-id');
//     }
//     else {
//         return false
//     }
// }


let getDemographics = function() {
  let envId = selectedEnvironment.get();
  if (!envId) {
    return []
  }
  return setupSubjectParameters(envId);
};

let getDiscourseDimensions = function() {
  let envId = selectedEnvironment.get();
  if (!envId) {
    return []
  }
  return setupSequenceParameters(envId);
};

let getEnvironment = function() {
  let envId = selectedEnvironment.get();
  return Environments.findOne({_id: envId})
}

let getSelectedObservations = function() {
  let obsIds = selectedObservations.get();
  return Observations.find({_id: {$in: obsIds}}).fetch();
}

//
// Template.interactiveReportView.helpers({
//   isSelectedIndex: function(index) {
//     return parseInt(index) === 0;
//   },
//   discourseDimensions: function() {
//     return getDiscourseDimensions()
//   },
//   demographics: function() {
//     return getDemographics()
//   },
//   environment: function() {
//     return getEnvironment();
//   },
//   observations: function() {
//     return getObservations();
//   },
//   observationNames: function() {
//     let observations = getObservations();
//     let obsNames = observations.map(obs => obs.name);
//
//     if (obsNames.length >= 3) {
//       return obsNames.slice(0,-1).join(', ') + ', and ' + obsNames[obsNames.length - 1]
//     }
//     else if (obsNames.length === 2) {
//       return obsNames.join(' and ');
//     }
//     else {
//       return obsNames[0]
//     }
//   }
// });

var d3 = require('d3');

let getCurrentDiscourseSelection = function() {
  let selected = $('.param-select-form-item[data-param-type="discourse"] option:selected');
  if (selected.val()) {
    return selected.val();
  }
  else {
    return false
  }
}

let getCurrentDemographicSelection = function() {
  let selected = $('.param-select-form-item[data-param-type="demographics"] option:selected');
  if (selected.val()) {
    return selected.val();
  }
  else {
    return false
  }
};

let getXAxisSelection = function() {
  return getAxisSelection('X');
};

let getYAxisSelection = function() {
  return getAxisSelection('Y');
};

let xor = function(a, b) {
  return (a || b) && !(a && b);
};

let getAxisSelection = function(axis) {
  let $swappable = $('.swappable');
  let select_list;

  let swapped = $swappable.hasClass('swapped');
  let isXAxis = (axis === 'x' || axis === 'X');
  // Could totally refactor this to a ternary expression, but those are kinda hard to read/maintain.
  if (xor(swapped, isXAxis)) {
    select_list = $swappable.find('.select__wrapper:first-child select');
  }
  else {
    select_list = $swappable.find('.select__wrapper:last-child select');
  }
  let selected = $('option:selected', select_list);

  if (!selected.val()) {
    return false;
  }

  let selected_value = selected.val();
  let param_type = select_list.attr('data-param-type');
  let options = getParamOptions(param_type);
  let selected_option = options.filter(opt => opt.name === selected_value)[0];

  selected_option.option_list = selected_option.options.split(',').map(function(i) {return i.trim()})

  let ret = {
    selected_value: selected_value,
    selected_option: selected_option,
    param_type: param_type,
    options: options,
  }
  //console.log('ret in ', axis, ' axis', ret);
  return ret
}


let getParamOptions = function(param_type) {
  if (param_type === "discourse") {
    return getDiscourseDimensions()
  }
  else {
    return getDemographics()
  }
};

let allParamsSelected = function () {
  let demo_select = getCurrentDemographicSelection();
  let disc_select = getCurrentDiscourseSelection();
  return (!!demo_select && !!disc_select)
};


$(window).on('updated-filters', function() {
  if (allParamsSelected()) {
    updateReport()
  }
});

let sidebar;
let updateReport = function() {

  let report_wrapper = $('.interactive-report-wrapper');
  if (!getXAxisSelection() || !getYAxisSelection()) {
    return;
  }

  if (selectedObservations.get().length < 1) {
    clearGraph();
    return;
  }

  report_wrapper.removeClass('inactive');
  if (!report_wrapper.hasClass('timeline-created')) {
    report_wrapper.addClass('timeline-created');
    let sidebarLevels = {
      0: 'start',
      1: 'bar_tooltip',
    }
    sidebar = new Sidebar('.interactive-report__sidebar', sidebarLevels);
    sidebar.setSlide('start', 'Hover a bar (or tap on mobile) to see more information', '')
  }
  // updateReportTitle()
  sidebar.setCurrentPanel('start');
  updateKey('.interactive-report__graph-key');
  updateGraph();

  // update the report values
}

let updateGraph = function() {
  let envId = getEnvironment()._id;
  let obsIds = getSelectedObservations().map(obs => obs._id); // todo allow passing the full obs object so we don't need to create it later
  let xParams = getXAxisSelection();
  let yParams = getYAxisSelection();

  // let graphData = getContributionData(obsIds, xParams, yParams, envId);
  // let demData = makeDemGraphs(envId, xParams, envId);
  // makeRatioGraphs(envId, graphData, demData);
  // //console.log('graphData', graphData);


  let contribData = compileContributionData(obsIds, xParams, yParams, envId);

  // options are 'contributions' or 'equity'
  createGraph(contribData, '.interactive-report__graph', selectedDatasetType.get())


};

let createGraph = function(contribData, containerSelector, dataset) {
  let data,
    y_label = '';
  if (selectedDatasetType.get() === 'contributions') {
    data = contribData.y_axis;
    y_label = "Contributions";
  }
  else {
    data = contribData.equity_ratio_data;
    y_label = "Equity Ratio";
  }

  svg = $('<svg width="718" height="580">' +
    '<defs>\n' +
    '  <style type="text/css">\n' +
    '    @font-face {\n' +
    '      font-family: Roboto;\n' +
    '      @import url(\'https://fonts.googleapis.com/css?family=Roboto:300,400,700\');\n' +
    '    }\n' +
    '  </style>\n' +
    '</defs>' +
    '</svg>');
  $(containerSelector).html(svg);

  var svg = d3.select(containerSelector + " svg"),
    margin = {top: 30, right: 20, bottom: 80, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x0 = d3.scaleBand() // each group
    .rangeRound([0, width])
    .paddingInner(0.1);

  var x1 = d3.scaleBand() // inside each group
    .padding(0.10);

  var y = d3.scaleLinear()
    .rangeRound([height, 0]);

  // var keys = data.column_keys.slice(1);
  var keys = contribData.column_keys;


  let color_function;
  console.log('contribData', contribData);
  if (contribData.y_axis_param_type === 'demographics') {
    color_function = d3.interpolateViridis
  }
  else {
    color_function = d3.interpolatePlasma
  }
  let key_colors = getLabelColors(keys, color_function);
  var z = d3.scaleOrdinal()
    .range(Object.values(key_colors));

  x0.domain(data.map(function(d) { return d.column_name; }));
  x1.domain(keys).rangeRound([0, x0.bandwidth()]);
  y.domain([0, Math.max(2, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); }))]).nice();

  g.append("g")
    .selectAll("g")
    .data(data)
    .enter().append("g")
    .attr("transform", function(d) { return "translate(" + x0(d.column_name) + ",0)"; })
    .attr("class", 'bar-group')
    .attr("data-bar-group", function(d) { return d.column_name })
    .attr("data-bar-group-type", function(d) { return contribData.x_axis_param_type })
    .selectAll("rect")
    .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
    .enter().append("rect")
    .attr("x", function(d) { return x1(d.key); })
    .attr("y", function(d) { return y(d.value); })
    .attr("width", x1.bandwidth())
    .attr("height", function(d) { return height - y(d.value); })
    .attr("fill", function(d) { return z(d.key); })
    .attr("class", 'hover-bar')
    .attr("data-bar-x", function(d) { return d.key })
    .attr("data-bar-x-type", function(d) { return contribData.y_axis_param_type })
    .on('mouseover', function() {
      // hover on
      let group = $(this).parent().attr('data-bar-group');
      let group_type = $(this).parent().attr('data-bar-group-type');
      let bar = $(this).attr('data-bar-x');
      let bar_type = $(this).attr('data-bar-x-type');
      buildBarTooltipSlide(group, group_type, bar, bar_type, contribData)
    })
    .on('mouseout', function() {
        // sidebar.setCurrentPanel('start', 250)
      // hover out

    })
    // text labels for 0s

  g.selectAll('g.bar-group')
    .selectAll('text')
    .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
    .enter()
    .append('text')
    .text(function(d) {
      if (d.value === 0) {
        return '0';
      }
    })
    .attr("text-anchor", "middle")
    .attr("x", function(d) {
      return x1(d.key) + x1.bandwidth() / 2;
    })
    .attr("y", function(d) {
      return y(d.value) - 6;
    })
    .attr("font-family", "sans-serif")
    .attr("font-size", "16px")
    .attr("fill", "black");

  let xAxis = d3.axisBottom(x0)
    .tickFormat(function(d, i) {
      if (contribData.y_axis_param_type === 'demographics') {
        return `${d}(n = ${contribData.x_axis_n_values[d].n})`
      }
      else {
        return `${d}`
      }
    })
    // .attr('n', function(d) {return contribData.x_axis_n_values[d].n});

  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    //
    .selectAll('.tick text')
    .call(function(text) {
      text.each(function () {
        let tick_text = d3.select(this),
            y = tick_text.attr("y"),
            dy = parseFloat(tick_text.attr("dy"));
        let text = tick_text.text();
        let rows = /(^.+)(\(n = \d+\)$)/.exec(text);

        if (rows) {
          tick_text.text(null)
          tick_text.append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em').text(rows[1]);
          tick_text.append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 1.1 + 'em').text(rows[2]).attr('class', 'n-value');
        }
      });
      text.each(function() {
        let $this = $(this);
        if (x0.bandwidth() < $this[0].getBBox().width) {
          $('.axis--x .tick text').attr('font-size', '14px');
        }
        if (x0.bandwidth() < $this[0].getBBox().width) {
          let text_tags = $('.axis--x .tick text');
          text_tags.attr('transform', 'rotate(-45)');
          text_tags.attr('text-anchor', 'end');
        }
        if (Math.sqrt(($this[0].getBBox().height ** 2) + ($this[0].getBBox().width ** 2)) > 80) {
          let text_tags = $('.axis--x .tick text');
          text_tags.attr('font-size', '11px');
        }
      })
    });

  let y_a;
  if (dataset === 'contributions') {
    y_a =
      g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).tickFormat(function(e){
            if(Math.floor(e) !== e) {
              return;
            }
            return e;
          })
        )
  }
  else {
    y_a = g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(null, "s")
      )
  }

  y_a.append("text")
    .attr("x", 2)
    .attr("y", y(y.ticks().pop()) + 0.5)
    .attr("dy", "-2.4em")
    .attr("dx", height / -2)
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle" +
      "")
    .attr("transform", "rotate(-90)")
    .text(y_label);

  let toggleTickDirection = function(tick) {
    if ($(tick).attr('x2') === "-6") {
      $(tick).attr('x2', width)
    }
    else {
      $(tick).attr('x2', "-6")
    }
  };

  if (selectedDatasetType.get() === 'equity') {
    let center_line = $('.axis--y g').filter((idx, item) => parseFloat($('text', item).text()) === 1.);
    // toggleTickDirection($('line', center_line[0]));
    $(center_line[0]).on('click', function(tick) {
      toggleTickDirection($('line', center_line[0]));
    });
    $(center_line[0]).addClass('clickable-tick')
  }



  // We're creating the legend separately in the key/sidebar area.

  // var legend = g.append("g")
  //     .attr("font-family", "sans-serif")
  //     .attr("font-size", 10)
  //     .attr("text-anchor", "end")
  //     .selectAll("g")
  //     .data(keys.slice().reverse())
  //     .enter().append("g")
  //     .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
  //
  // legend.append("rect")
  //     .attr("x", width - 19)
  //     .attr("width", 19)
  //     .attr("height", 19)
  //     .attr("fill", z);
  //
  // legend.append("text")
  //     .attr("x", width - 24)
  //     .attr("y", 9.5)
  //     .attr("dy", "0.32em")
  //     .text(function(d) { return d; });

}


let buildBarTooltipSlide = function(group, group_type, bar, bar_type, contribData) {
  let title = `<span class="group">${group}</span> <span class="deemphasize">x</span> <span class="bar">${bar}</span>`;

  let chosen_demo = (group_type === 'demographics') ? group : bar;
  let chosen_discourse = (bar_type === 'discourse') ? bar : group;

  let students_in_demo = contribData.students.filter(student => student.info.demographics[contribData.selected_demographic] === chosen_demo);

  let students_in_demo_contribs_updated = students_in_demo.map(function(student) {
    student.relevant_contributions = student.contributions.filter(contrib => contrib[contribData.selected_discourse_dimension] === chosen_discourse);
    return student;
  });

  let contributing_students = students_in_demo_contribs_updated.filter(student => student.relevant_contributions.length > 0);

  let non_contributing_students = students_in_demo_contribs_updated.filter(student => student.relevant_contributions.length === 0);

  let max_contribs_contributing = Math.max(...contributing_students.map(student => student.relevant_contributions.length));
  let contributing_students_html = contributing_students.sort((a, b) => b.relevant_contributions.length - a.relevant_contributions.length).map(function(student) {
    let max_contribs_percent = (student.relevant_contributions.length / max_contribs_contributing) * 100 + '%';
    return `<span class="student-bar student-bar--contributor" style="background: linear-gradient(to right, rgba(15,129,204,0.15) 0%, rgba(15,129,204,0.15) ${max_contribs_percent}, rgba(15,129,204,0.02) ${max_contribs_percent}, rgba(15,129,204,0.02) 100%)">
    ${student.info.name} (${student.relevant_contributions.length})
    </span>`
  }).join('');

  let non_contributing_students_html = non_contributing_students.map(function(student) {
    return `<span class="student-bar student-bar--non-contributor">${student.info.name} (0)</span>`
  }).join('');

  let html = `
    <div class="stat-leadin">Number of contributions</div>
    <div class="stat stat--barchart">${contributing_students_html}${non_contributing_students_html}</div>
  `;

  sidebar.setSlide('bar_tooltip', html, title)
}

let compileContributionData = function(obsIds, xParams, yParams, envId) {

  // let contrib_data_model = {
  //   y_axis: [
  //     {column_name: "Boy", "Yes": 4, "No": 1}, // X axis items inside each group
  //     {column_name: "Girl", "Yes": 3, "No": 3}, // X axis items inside each group
  //     {column_name: "Nonbinary", "Yes": 2, "No": 2}, // X axis items inside each group
  //     {column_name: "Other", "Yes": 3, "No": 6},
  //   ],
  //   axis_title: 'Explicit Evaluation',
  // };
  // contrib_data_model.y_axis["columns"] = [
  //   "Gender",
  //   "Yes",
  //   "No",
  // ];
  let contrib_data = {
    y_axis: [],
    y_axis_selected: yParams.selected_value,
    x_axis_selected: xParams.selected_value,
    y_axis_param_type: yParams.param_type,
    x_axis_param_type: xParams.param_type,
  };

  if (yParams.param_type === 'demographics') {
    contrib_data.selected_demographic = yParams.selected_value;
    contrib_data.selected_discourse_dimension = xParams.selected_value;
  }
  else {
    contrib_data.selected_demographic = xParams.selected_value;
    contrib_data.selected_discourse_dimension = yParams.selected_value;
  }

  // Add each coulumn of X

  let defaultXAxisObj = {};
  let studentContributionsXAxisObj = {};

  // Init each "group" with 0 across all values.
  for (let y_axis_item_key in yParams.selected_option.option_list) {
    if (!yParams.selected_option.option_list.hasOwnProperty(y_axis_item_key)) continue;
    let y_axis_item = yParams.selected_option.option_list[y_axis_item_key];
    defaultXAxisObj[y_axis_item] = 0;
    studentContributionsXAxisObj[y_axis_item] = {};
  }

  // Create each group with the correct title
  for (let x_axis_item_key in xParams.selected_option.option_list) {
    if (!xParams.selected_option.option_list.hasOwnProperty(x_axis_item_key)) continue;
    let x_axis_item = xParams.selected_option.option_list[x_axis_item_key];
    let x_axis_obj = JSON.parse(JSON.stringify(defaultXAxisObj)); // Clone the obj
    x_axis_obj["column_name"] = x_axis_item;
    x_axis_obj["student_contributions"] = JSON.parse(JSON.stringify(studentContributionsXAxisObj));
    // add item after extending the default x axis obj
    contrib_data.y_axis.push(x_axis_obj)
  }

  // Create by-student data structure
  let students = getStudents(envId);
  contrib_data.students = students.map(function(student) {
    student.contributions = [];
    return student;
  });

  // Record contributions
  // //console.log('obsIds', obsIds);

  for (let obsId_k in obsIds) {

    if (!obsIds.hasOwnProperty(obsId_k)) continue;
    let obsId = obsIds[obsId_k];

    let sequences = getSequences(obsId, envId);
    for (let sequence_k in sequences) {
      if (!sequences.hasOwnProperty(sequence_k)) continue;
      let sequence = sequences[sequence_k];
      // //console.log('sequence', sequence);

      let sequence_y;
      if (yParams.param_type === 'demographics') {
        sequence_y = sequence.info.student.demographics[yParams.selected_value];
      }
      else {
        sequence_y = sequence.info.parameters[yParams.selected_value];
      }

      let sequence_x;
      if (xParams.param_type === 'demographics') {
        sequence_x = sequence.info.student.demographics[xParams.selected_value];
      }
      else {
        sequence_x = sequence.info.parameters[xParams.selected_value];
      }

      let student_index = contrib_data.students.findIndex(function(student) { return student._id === sequence.info.student.studentId });
      contrib_data.students[student_index].contributions.push(sequence.info.parameters);

      increaseValueForAxes(contrib_data.y_axis, sequence_y, sequence_x);
      increaseValueForStudent(contrib_data.y_axis, sequence_y, sequence_x, sequence.info.student);

    }
  }

  // Set up columns
  contrib_data.column_keys = yParams.selected_option.option_list;

  // Get n values for groups
  contrib_data.x_axis_n_values = {};

  contrib_data.y_axis.forEach(function(y_item) {
    // get values of the column group
    let values = Object.keys(y_item).map(function(key) {if (key !== 'column_name') return y_item[key]}).filter(item => !isNaN(item));
    // total above values
    let column_n_values = Object.assign({}, y_item);
    delete column_n_values['column_name'];
    delete column_n_values['student_contributions'];

    contrib_data.x_axis_n_values[y_item.column_name] = {
      n: values.reduce((a, b) => a + b, 0),
      columns: column_n_values
    }
  });

  // Get n values for totaled graphs (y)

  contrib_data.y_axis_n_values = {};

  contrib_data.y_axis.forEach(function(y_item) {
    let y_axis_items = Object.assign({}, y_item);
    delete y_axis_items['column_name'];
    delete y_axis_items['student_contributions'];
    Object.keys(y_axis_items).forEach(function(key) {
      if (typeof contrib_data.y_axis_n_values[key] !== 'undefined') {
        contrib_data.y_axis_n_values[key] += y_axis_items[key]
      }
      else {
        contrib_data.y_axis_n_values[key] = y_axis_items[key]
      }
    })

  });

  // Calculate equity ratios. These are done by taking
  // (num_contributions_by_value/total_contributions) / (num_subjects_with_value/total_subjects)

  // num_students_by_y_value

  // to make equity ratios not count students that were missing for
  // a class or two (and were marked as such, once that's possible),
  // we'll need to update how this is calculated, perhaps by doing it
  // by observation, then calculating the equity ratio per observation.
  // all equity ratios across all observations would then need to be averaged.

  // Students were already created earlier.
  let demographics = getDemographics();
  let currentDemo = getCurrentDemographicSelection();
  let currentDemoOptions = demographics.filter(demo => demo.name === currentDemo)[0]
    .options.split(',').map(opt => opt.trim());

  contrib_data.student_body_demographic_ratios = {}

  currentDemoOptions.forEach(function(demo) {
    contrib_data.student_body_demographic_ratios[demo] =
      students.filter(student => student.info.demographics[currentDemo] === demo).length / students.length
  });

  contrib_data.equity_ratio_data = contrib_data.y_axis.map(function(y) {

    let column_values = Object.assign({}, y);
    delete column_values['column_name'];
    delete column_values['student_contributions'];
    let equity_ratios = {}
    Object.keys(column_values).forEach(function(key) {
      // //console.log('contrib_data', contrib_data, 'key', key);

      let demo_key = (yParams.param_type === 'demographics') ? key : y.column_name;
      // let param_key = (yParams.param_type === 'discourse') ? key: y.column_name;

      let percent_of_demo = contrib_data.student_body_demographic_ratios[demo_key];
      if (isNaN(percent_of_demo)) percent_of_demo = 0;

      let contrib_axis_n_value = (yParams.param_type === 'demographics') ? contrib_data.x_axis_n_values[y.column_name].n : contrib_data.y_axis_n_values[key];

      //console.log('column_values ', column_values);
      let percent_of_contribs = (column_values[key] / contrib_axis_n_value);
      if (isNaN(percent_of_contribs)) percent_of_contribs = 0;

      //console.log('percent of contribs', percent_of_contribs);
      //console.log('percent_of_demo', percent_of_demo);
      equity_ratios[key] = percent_of_contribs / percent_of_demo
    });
    equity_ratios['column_name'] = y['column_name'];
    // equity_ratios['student_contributions'] = y['student_contributions'];
    return equity_ratios;
  });

  // and we're done

  //console.log('contrib_data', contrib_data);

  return contrib_data;
}

let increaseValueForAxes = function(data, y, x) {
  // x matches to data[n].column_name
  // y matches to a key in data[n]
  // search for the key that matches x, then increment the value of key y.

  for (let x_row_k in data) {
    if (!data.hasOwnProperty(x_row_k)) continue;
    let x_row = data[x_row_k];
    if (x_row.column_name !== x) continue;
    x_row[y]++
  }
}

let increaseValueForStudent = function(data, y, x, student) {
  // similar to increaseValueForAxes. used to count contribs by students inside a certain x y combo

  for (let x_row_k in data) {
    if (!data.hasOwnProperty(x_row_k)) continue;
    let x_row = data[x_row_k];
    if (x_row.column_name !== x) continue;

    if (typeof x_row['student_contributions'][y][student.studentId] === 'undefined') {
      x_row['student_contributions'][y][student.studentId] = {
        student: student,
        contributionsOfType: 1
      }
    }
    else {
      x_row['student_contributions'][y][student.studentId].contributionsOfType++
    }
  }
}

// let updateReportTitle = function() {
//   let title = `${getYAxisSelection().selected_value} <span class="deemphasize">by</span> ${getXAxisSelection().selected_value}`
//   $('.interactive-report__title').html(title)
// }

let updateKey = function(key_wrapper) {
  let y_axis = getYAxisSelection();
  let color_function;
  if (y_axis.param_type === 'demographics') {
    color_function = d3.interpolateViridis
  }
  else {
    color_function = d3.interpolatePlasma
  }
  let label_colors = getLabelColors(y_axis.selected_option.option_list, color_function);
  let key_chunks = Object.keys(label_colors).map(function(label) {
    let color = label_colors[label]
    return `<span class="key--label"><span class="key--color" style="background-color: ${color}"></span><span class="key--text">${label}</span></span>`
  })

  let html = `${key_chunks.join('')}`;
  $(key_wrapper).html(html)
}



let available_colors = [
  "#003f5c",
  "#2f4b7c",
  "#665191",
  "#a05195",
  "#d45087",
  "#f95d6a",
  "#ff7c43",
  "#ffa600"
];


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

// let getLabelColors = function(labels) {
//   let local_colors = avail_colors_viridis.slice();
//
//   let spacing = Math.max(Math.floor(avail_colors_viridis.length / labels.length), 1);
//
//   let label_colors = {};
//   let _ = labels.map(function(label) {
//     if (typeof label_colors[label] === 'undefined') {
//       let new_color = local_colors[0];
//       local_colors.push(new_color);
//       label_colors[label] = new_color;
//       shiftArrayToLeft(local_colors, spacing);
//     }
//     else {
//
//     }
//   });
//   return label_colors
// }
let getLabelColors = function(labels, color_function) {
  if (typeof color_function === 'undefined') {
    color_function = d3.interpolateViridis;
  }

  let spacing = 1 / labels.length;

  let label_colors = {};
  let _ = labels.map(function(label, index) {
    if (typeof label_colors[label] === 'undefined') {
      label_colors[label] = color_function(index * spacing);
    }
    else {

    }
  });
  return label_colors
}
//
// let createReport = function(report_wrapper) {
//   let disc_select = '<select class="param-select-form-item" name="parameter-select" data-param-type="discourse">' +
//     getDiscourseDimensions().map(function(disc) {
//       return `<option value="${disc.name}">${disc.name}</option>`
//     }).join('')
//     + '</select>';
//   let demo_select = '<select class="param-select-form-item" name="demographic-select" data-param-type="demographics">' +
//     getDemographics().map(function(demo) {
//       return `<option value="${demo.name}">${demo.name}</option>`
//     }).join('')
//     + '</select>';
//
//
//   let report_structure = $('<div class="interactive-report">' +
//     '<div class="interactive-report__top-left"></div>' +
//     '<div class="interactive-report__y-scale"></div>' +
//     '<div class="interactive-report__title">' +
//
//       '<div class="x-axis-label param-selector-wrapper swappable">' +
//
//       '<div class="select__wrapper select__wrapper--demo"><span class="explanation-text demographics-color">Demographic</span>' + demo_select + '</div>' +
//       '<span class="center_text"><span class="swappable__button"><i class="fas fa-exchange-alt"></i></span></span>' +
//     '<div class="select__wrapper select__wrapper--disc"><span class="explanation-text discourse-color">Discourse Dimension</span>' + disc_select + '</div>' +
//
//     // disc_select +
//
//       '</div>' +
//     '</div>' +
//     // '<div class="interactive-report__graph-type">Showing: <span class="graph-type-toggle-wrapper"><span class="toggle--graph-type" data-graph-type="' + selectedDatasetType.get() + '">Equity Ratio</span> <span class="change-graph-type-link">Change</span></span></div>' +
//     '<div class="interactive-report__graph" data-graph-type="' + selectedDatasetType.get() + '"></div>' +
//     '<div class="interactive-report__graph-key"></div>' +
//     '<div class="interactive-report__sidebar"></div>' +
//     '</div>')
//   report_wrapper.append(report_structure);
//   //console.log('created report structure');
// }



let setupVis = function() {
  // Intentionally duplicated to allow for easier customization on a per-report-type basis.
  let observations = obsOptions.get();
  let obs = observations.map(function(obs) {
    return {
      id: obs._id,
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
  timeline = new vis.Timeline(container, items, options)

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

    $(window).trigger('updated-filters');
  });

  let recent_obs = obs.sort(function(a, b) {return a.compare_date - b.compare_date}).slice(-8);
  let recent_obs_ids = recent_obs.map(obs => obs.id);
  timeline.focus(recent_obs_ids);

  return timeline
}