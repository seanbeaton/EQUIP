import vis from 'vis';
import {Sidebar} from '../../../helpers/graph_sidebar';
let d3 = require('d3');

import '/node_modules/vis/dist/vis.min.css';
import {setupSequenceParameters, setupSubjectParameters} from "../../../helpers/parameters";
import {getSequences} from "../../../helpers/sequences";
import {getStudents} from "../../../helpers/students";
import {convertISODateToUS} from "../../../helpers/dates";
import {clone_object} from "../../../helpers/objects";

// const envSet = new ReactiveVar(false);
const obsOptions = new ReactiveVar([]);
const selectedEnvironment = new ReactiveVar(false);
const selectedObservations = new ReactiveVar([]);
const selectedDemographic = new ReactiveVar(false);
const selectedDiscourseDimension = new ReactiveVar(false);
const selectedDiscourseOption = new ReactiveVar(false);
const selectedDatasetType = new ReactiveVar('contributions');
let timeline;


Template.timelineReport.rendered = function(){
  $('.timeline-param-select.chosen-select')
    .filter(':not(.chosen--processed)').addClass('chosen--processed')
    .chosen({disable_search_threshold: 10, width: "300px"});
  // $(".param-select-form-item.chosen-select").trigger("chosen:updated");   // update chosen to take the updated values into account
};


Template.timelineReport.helpers({
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
      else if (obsOpts.length < 2) {
        env.envName += ' (' + obsOpts.length + ')';
        env.disabled = 'disabled';
      }
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
    return getObservations();
  },
  observationNames: function() {
    let observations = getObservations();
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
    //console.log('getDemographics', getDemographics());
    return getDemographics();
  },
  discourseparams: function() {
    return getDiscourseDimensions();
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
      {
        id: 'contributions',
        name: 'Contributions',
        selected: 'selected'
      },
      {
        id: 'equity',
        name: 'Equity Ratio',
        selected: ''
      }
    ]
  }
});


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

let getDiscourseOptions = function() {
  let options = getDiscourseDimensions();
  let selected_disc_dim = selectedDiscourseDimension.get();
  if (selected_disc_dim === false) {
    return [];
  }
  // console.log('options', options, 'selected_disc_dim', selected_disc_dim);
  let opt = options.find(opt => opt.name === selected_disc_dim);
  // console.log('opt', opt);
  return opt
    .options.split(',').map(function(opt) {return {name: opt.trim()}})
};


let getDemographicOptions = function() {
  let options = getDemographics();
  let selected_demo = selectedDemographic.get();
  let opt =  options.find(opt => opt.name === selected_demo);
  //console.log('opt', opt);
  return opt
    .options.split(',').map(function(opt) {return {name: opt.trim()}})
};


let getEnvironment = function() {
  let envId = selectedEnvironment.get();
  return Environments.findOne({_id: envId})
}

let getObservations = function() {
  let obsIds = selectedObservations.get();
  return Observations.find({_id: {$in: obsIds}}).fetch();
}


Template.timelineReport.events({
  'change #env-select': function(e) {

    let selected = $('option:selected', e.target);
    //console.log('env-select,', selected.val());
    selectedEnvironment.set(selected.val());
    clearGraph();
    selectedDiscourseOption.set(false);
    clearObservations();
    obsOptions.set(getObsOptions());
    setTimeout(setupVis, 50);

    $('#disc-select').val('');
    $('#demo-select').val('');
    $('#disc-opt-select').val('');
    if (typeof sidebar !== 'undefined') {
      sidebar.setCurrentPanel('start');
    }
  },
  'change #disc-select': function(e) {
    let selected = $('option:selected', e.target);
    //console.log('disc-select,', selected.val());
    selectedDiscourseDimension.set(selected.val());
    $('#disc-opt-select').val('')
    clearGraph();
    selectedDiscourseOption.set(false);
    updateGraph();
  },
  'change #demo-select': function(e) {
    let selected = $('option:selected', e.target);
    //console.log('demo-select,', selected.val());
    selectedDemographic.set(selected.val());
    updateGraph()
  },
  'change #disc-opt-select': function(e) {
    let selected = $('option:selected', e.target);
    //console.log('disc-opt-select,', selected.val());
    selectedDiscourseOption.set(selected.val());
    updateGraph()
  },
  'change #dataset-type-select': function(e) {
    let selected = $('option:selected', e.target);
    //console.log('dataset-type-select,', selected.val());
    selectedDatasetType.set(selected.val());
    updateGraph()
  },
})


let createTimelineData = function() {
  let ret = {
    contributions_dataset: []
  };

  let envId = selectedEnvironment.get();
  let obsIds = selectedObservations.get();
  let demo = selectedDemographic.get();
  let dimension = selectedDiscourseDimension.get();
  let option = selectedDiscourseOption.get();
  let allStudents = getStudents(envId);
  let demo_opts = getDemographicOptions();



  let students_by_demo = demo_opts.map(function(demo_opt) {
    //console.log('demo_opt', demo_opt);
    return {
      name: demo_opt.name,
      count: 0
    };
  });

  allStudents.forEach(function(student) {
    let demoCountIndex = students_by_demo.findIndex(demoopt => demoopt.name === student.info.demographics[demo])
    students_by_demo[demoCountIndex].count++;
  });

  students_by_demo.forEach(function(demographic) {
    demographic.percent = demographic.count / students_by_demo.reduce((t, d) => d.count + t, 0)
  });



  //console.log('creating data for ', obsIds, demo, dimension, option);
  for (let obsId_k in obsIds) {

    if (!obsIds.hasOwnProperty(obsId_k)) continue;
    let obsId = obsIds[obsId_k];

    let sequences = getSequences(obsId, envId);
    for (let sequence_k in sequences) {
      if (!sequences.hasOwnProperty(sequence_k)) continue;
      let sequence = sequences[sequence_k];

      // //console.log('sequence', sequence);

      if (!ret.contributions_dataset.find(datapoint => datapoint.obsId === obsId)) {
        // If it wasn't there:
        let obsers = getObservations();
        //console.log('getObservations()', obsers);

        let obs = obsers.find(obs => obs._id === obsId);
        let parseTime = d3.timeParse('%Y-%m-%d');
        //console.log('ob SEACH', obs);
        let datapoint = {
          obsId: obsId,
          d3date: parseTime(obs.observationDate),
          obsName: obs.name,
          date: obs.observationDate,
          studentsByDemo: students_by_demo,
          _total: 0,
        };

        demo_opts.forEach(function (opt) {
          datapoint[opt.name] = 0
        });

        ret.contributions_dataset.push(datapoint)
      }

      let seqDemoOption = sequence.info.student.demographics[demo];

      let ds_index = ret.contributions_dataset.findIndex(datapoint => datapoint.obsId === obsId);

      if (sequence.info.parameters[dimension] === option) {
        ret.contributions_dataset[ds_index]._total += 1;
        ret.contributions_dataset[ds_index][seqDemoOption] += 1;
      }

    }
  }

  ret.equity_dataset = [];

  //console.log('allStudents', allStudents);

  ret.equity_dataset = ret.contributions_dataset.map(function(observation) {
    //console.log('obs', observation)
    let obs_equity = {
      _total: 1,
      obsId: observation.obsId,
      obsName: observation.obsName,
      d3date: observation.d3date,
      date: observation.date,
      studentsByDemo: students_by_demo,
      contribsByDemo: [],
    }
    demo_opts.forEach(function(demo_opt) {
      let percent_of_contribs = observation[demo_opt.name] / observation._total;
      // console.log('percent_of_contribs', percent_of_contribs);
      if (isNaN(percent_of_contribs)) {
        percent_of_contribs = 0;
      }

      obs_equity.contribsByDemo.push({
        name: demo_opt.name,
        percent: percent_of_contribs,
        count: observation[demo_opt.name],
        total: observation._total
      });
      let percent_of_students = students_by_demo.find(demo => demo.name === demo_opt.name).percent;
      if (isNaN(percent_of_students)) {
        percent_of_students = 0;
      }

      if (percent_of_students === 0) {
        obs_equity[demo_opt.name] = 0;
      }
      else {
        let equity_ratio = percent_of_contribs / percent_of_students;
        obs_equity[demo_opt.name] = isNaN(equity_ratio) ? 0 : equity_ratio;
      }
    });
    return obs_equity
  })

  ret.contributions_dataset.forEach(function(obs) {
    // obs.max = obs._total;
    let vals = demo_opts.map(demo_opt => obs[demo_opt.name]);
    //console.log('vals', vals);
    obs.max = Math.max.apply(null, vals);
  });
  ret.equity_dataset.forEach(function(obs) {
    let vals = demo_opts.map(demo_opt => obs[demo_opt.name]);
    //console.log('vals', vals);
    obs.max = Math.max.apply(null, vals);
  })

  console.table(ret.contributions_dataset);
  console.table(ret.equity_dataset);
  return ret
};

let sidebar;

let clearGraph = function() {
  //console.log('clearing-graph');
  let timeline_selector = '.timeline-report__graph';
  $(timeline_selector + ' svg').remove();
}

let updateGraph = function() {
  let timeline_wrapper = $('.timeline-report-wrapper');
  let timeline_selector = '.timeline-report__graph';

  let demo = selectedDemographic.get();
  let dimension = selectedDiscourseDimension.get();
  let option = selectedDiscourseOption.get();

  if (demo === false || dimension === false || option === false) {
    return;
  }

  if (selectedObservations.get().length < 2) {
    return;
  }


  let data = createTimelineData();
  if (!timeline_wrapper.hasClass('timeline-created')) {
    timeline_wrapper.addClass('timeline-created');
    let sidebarLevels = {
      0: 'start',
      1: 'bar_tooltip',
    };
    sidebar = new Sidebar('.timeline-report__sidebar', sidebarLevels);
    sidebar.setSlide('start', 'Hover a point (or tap on mobile) to see more information', '')
    initTimelineGraph(data, timeline_selector)
  }
  else {
    sidebar.setCurrentPanel('start');
    updateTimelineGraph(data, timeline_selector)
  }
}



let initTimelineGraph = function(full_data, containerSelector) {
  let data;

  let dataset = selectedDatasetType.get();
  if (dataset === 'contributions') {
    data = full_data.contributions_dataset;
  }
  else {
    data = full_data.equity_dataset;
  }

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
  $(containerSelector).html(svg);

  let svg = d3.select(containerSelector + " svg"),
    margin = {top: 30, right: 20, bottom: 40, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr('class', 'graph-container').attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  let x = d3.scaleTime()
    .domain(d3.extent(data, d => d.d3date))
    .range([0, width]);

  let y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.max)]).nice()
    .range([height, 0]);


  // let lines = [];
  let demos = getDemographicOptions();

  // let total_line = d3.line()
  //   .x(function(d) { return x(d.d3date)})
  //   .y(function(d) { return y(d._total)});


  let lines = demos.map(function(demo) {
    let line = d3.line()
      .x(d => x(d.d3date))
      .y(d => y(d[demo.name]));
    //console.log('demo', demo.name);
    // let line = d3.line()
    //   .x(function(d) { return x(d.d3date)})
    //   .y(function(d) { return y(d[demo.name])});

    return {line: line, demo: demo};
  });


  //
  // let valLine = d3.line()
  //   .x(function(d) {return x(d.date)})
  //   .y(function(d) {return y(d.value)})


  // g.append('path')
  //   .data([data])
  //   .attr('class', 'line line--total')
  //   .style("stroke-width", 2)
  //   .attr('d', total_line);

  let key_colors = getLabelColors(getDemographicOptions().map(demo_opt => demo_opt.name));
  let z = d3.scaleOrdinal()
    .range(Object.values(key_colors));

  updateKey('.timeline-report__graph-key', demos, z)

  //console.log('key_colors', key_colors);

  lines.forEach(function(line) {
    //console.log('data is', data);
    //console.log('z(line.demo)', z(line.demo.name), line.demo.name);


    g.append('path')
      .data([data])
      .attr('class', 'line line--demo')
      .style("stroke", z(line.demo.name))
      .style("stroke-width", 4)
      .attr('d', line.line);

    g.append('g')
      .attr('class', 'dot-container')
      .selectAll('dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('r', 6)
      .attr('class', 'dot')
      .attr('cx', d => x(d.d3date))
      .attr('cy', d => y(d[line.demo.name]))
      .attr('data-demo-name', line.demo.name)
      .style("fill", z(line.demo.name))
      .on('mouseover', function(d) {
        d['line_name'] = line.demo.name;
        let data = [];
        let circles = g.selectAll('circle[cx="' + x(d.d3date) + '"][cy="' + y(d[line.demo.name]) + '"]');
        if (circles.size() > 1) {
          //console.log('more than one circle');
          //console.log('d', d);
          //console.log('this', this);
          //console.log('circles', circles);
          circles.each(function(d) {
            let datum = clone_object(d);
            datum.line_name = $(this).attr('data-demo-name');
            data.push(datum)
          });
        }
        else {
          data = [d];
        }

        //console.log('abut to use data', data);

        buildBarTooltipSlide(data, z)
      })
      .on('mouseout', function() {
        // sidebar.setCurrentPanel('start', 250)
      });

  });

  let ticks = data.map(datum => datum.d3date);

  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr('class', 'x-axis')
    .call(d3.axisBottom(x)
      .tickValues(ticks));

  // // Add the Y Axis
  // g.append("g")
  //   .attr('class', 'axis--y')
  //   .call(d3.axisLeft(y));

  let y_a;
  if (dataset === 'contributions') {
    y_a =
      g.append("g")
        .attr("class", "axis--y")
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
      .attr("class", "axis--y")
      .call(d3.axisLeft(y).ticks(null, "s")
      )
  }

  // y_a.append("text")
  //   .attr("x", 2)
  //   .attr("y", y(y.ticks().pop()) + 0.5)
  //   .attr("dy", "-2.4em")
  //   .attr("dx", height / -2)
  //   .attr("fill", "#000")
  //   .attr("font-weight", "bold")
  //   .attr("text-anchor", "middle" +
  //     "")
  //   .attr("transform", "rotate(-90)")




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

};


let updateTimelineGraph = function(full_data, containerSelector) {
  // console.log('updating timeline graph');
  initTimelineGraph(full_data, containerSelector)

  // Disabling on the fly d3 updating due to some complications with
  // figuring out which items need to be reassigned. When the parameters that create the data
  // change whenever the graph needs to be updated, it's hard to make it work.
  // Only time it could work is when you add a new observation, but that doesn't work
  // as of yet.
  // For now, we're going to rebuild the graph each time the parameters are updated.


  // let data;
  //
  // if (selectedDatasetType.get() === 'contributions') {
  //   data = full_data.contributions_dataset;
  // }
  // else {
  //   data = full_data.equity_dataset;
  // }
  //
  // data = data.sort(function(a, b) {return a.d3date - b.d3date});
  // //
  // // svg = $('<svg width="718" height="500">' +
  // //   '<defs>\n' +
  // //   '  <style type="text/css">\n' +
  // //   '    @font-face {\n' +
  // //   '      font-family: Roboto;\n' +
  // //   '      @import url(\'https://fonts.googleapis.com/css?family=Roboto:300,400,700\');\n' +
  // //   '    }\n' +
  // //   '  </style>\n' +
  // //   '</defs>' +
  // //   '</svg>');
  // // $(containerSelector).html(svg);
  //
  // let svg = d3.select(containerSelector + " svg"),
  //   margin = {top: 30, right: 20, bottom: 40, left: 50},
  //   width = +svg.attr("width") - margin.left - margin.right,
  //   height = +svg.attr("height") - margin.top - margin.bottom,
  //   // g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  //   g = svg.select("g.graph-container")
  //
  // let x = d3.scaleTime()
  //   .domain(d3.extent(data, d => d.d3date))
  //   .range([0, width]);
  //
  // let y = d3.scaleLinear()
  //   .domain([0, d3.max(data, d => d.max)])
  //   .range([height, 0]);
  //
  //
  // // let lines = [];
  // let demos = getDemographicOptions();
  //
  // let total_line = d3.line()
  //   .x(function(d) { return x(d.d3date)})
  //   .y(function(d) { return y(d._total)});
  //
  //
  // let lines = demos.map(function(demo) {
  //   let line = d3.line()
  //     .x(d => x(d.d3date))
  //     .y(d => y(d[demo.name]));
  //   //console.log('demo', demo.name);
  //   // let line = d3.line()
  //   //   .x(function(d) { return x(d.d3date)})
  //   //   .y(function(d) { return y(d[demo.name])});
  //
  //   return {line: line, demo: demo};
  // });
  //
  //
  // //
  // // let valLine = d3.line()
  // //   .x(function(d) {return x(d.date)})
  // //   .y(function(d) {return y(d.value)})
  //
  //
  // g.select('path.line--total')
  //   .data([data])
  //   .attr('class', 'line line--total')
  //   .style("stroke-width", 2)
  //   .attr('d', total_line);
  //
  // let key_colors = getLabelColors(getDemographicOptions().map(demo_opt => demo_opt.name));
  // let z = d3.scaleOrdinal()
  //   .range(Object.values(key_colors));
  //
  // updateKey('.timeline-report__graph-key', demos, z)
  //
  // //console.log('key_colors', key_colors);
  //
  // lines.forEach(function(line) {
  //   //console.log('data is', data);
  //   //console.log('z(line.demo)', z(line.demo.name), line.demo.name);
  //
  //
  //   let d3line = g.selectAll('path.line--demo')
  //     .data([data]);
  //
  //   d3line.enter()
  //     .append('path')
  //     .attr('class', 'line line--demo')
  //     .style("stroke", z(line.demo.name))
  //     .style("stroke-width", 2)
  //     .attr('d', line.line)
  //     .merge(d3line)
  //     .transition()
  //     .duration(500)
  //     .attr('d', line.line)
  //
  //   g.selectAll('dot')
  //     .data(data)
  //     .enter()
  //     .transition()
  //     // .append('circle')
  //     .attr('r', 3)
  //     .attr('class', 'dot')
  //     .attr('cx', d => x(d.d3date))
  //     .attr('cy', d => y(d[line.demo.name]))
  //     .attr('data-demo-name', line.demo.name)
  //     .style("fill", z(line.demo.name))
  //     .on('mouseover', function(d) {
  //       d['line_name'] = line.demo.name;
  //       let data = [];
  //       let circles = g.selectAll('circle[cx="' + x(d.d3date) + '"][cy="' + y(d[line.demo.name]) + '"]');
  //       if (circles.size() > 1) {
  //         //console.log('more than one circle');
  //         //console.log('d', d);
  //         //console.log('this', this);
  //         //console.log('circles', circles);
  //         circles.each(function(d) {
  //           let datum = clone_object(d);
  //           datum.line_name = $(this).attr('data-demo-name');
  //           data.push(datum)
  //         });
  //       }
  //       else {
  //         data = [d];
  //       }
  //
  //       //console.log('abut to use data', data);
  //
  //       buildBarTooltipSlide(data, z)
  //     })
  //     .on('mouseout', function() {
  //       // sidebar.setCurrentPanel('start', 250)
  //     });
  //
  // });
  //
  // g.select("g.x-axis")
  //   .transition()
  //   .attr("transform", "translate(0," + height + ")")
  //   .call(d3.axisBottom(x));
  //
  // // Add the Y Axis
  // g.select("g.y-axis")
  //   .transition()
  //   .call(d3.axisLeft(y));

};

let updateKey = function(key_wrapper, y_values, color_axis) {
  let key_chunks = y_values.map(function(label) {
    let color = color_axis(label.name)
    return `<span class="key--label"><span class="key--color" style="background-color: ${color}"></span><span class="key--text">${label.name}</span></span>`
  })

  let html = `${key_chunks.join('')}`;
  $(key_wrapper).html(html)
}

let buildBarTooltipSlide = function(data, demo_color_axis) {
  let title = '',
    html = '';

  if (data.length > 1) {
    title = 'Multiple datapoints'
  } else {
    title = `${data[0].obsName} <br/> ${convertISODateToUS(data[0].date)}`;
  }

  //console.log('buidling sidebar, ', data);
  if (selectedDatasetType.get() === 'contributions') {
    html = data.map(function(datum) {
      let ret = '';
      if (data.length > 1) {
          ret += `<h4 class="panel-section__title">${datum.obsName} <br/> ${convertISODateToUS(datum.date)}</h4>`
      }
      ret += `
    <div class="stat-group">
      <div class="stat-leadin">Demographic "${datum.line_name}" <span class="key--color" style="background-color: ${demo_color_axis(datum.line_name)}"></div>
    </div>
    <div class="stat-group stat-group--vert-centered">
      <div class="stat-leadin stat-leadin--large">Number of Contributions</div>
      <div class="stat stat--large-value">${datum[datum.line_name]}</div>
    </div>
  `;
      return ret;
    }).join('');
  }
  else {
    html = data.map(function(datum) {
      let ret = '';
      if (data.length > 1) {
        ret += `<h4 class="panel-section__title">${datum.obsName} </br> ${convertISODateToUS(datum.date)}</h4>`
      }
      ret += `
        <div class="stat-group">
        <div class="stat-leadin">Demographic "${datum.line_name}" <span class="key--color" style="background-color: ${demo_color_axis(datum.line_name)}"></span></div>
      </div>
      <div class="stat-group stat-group--vert-centered">
        <div class="stat-leadin stat-leadin--large">Equity ratio</div>
      <div class="stat stat--large-value">${(datum[datum.line_name]).toFixed(2)}</div>
        </div>
        <div class="stat stat--double">
        <div class="stat-group stat-group--vert-centered">
        <div class="stat stat--val stat--percent">${(datum.contribsByDemo.find(d => d.name === datum.line_name).percent * 100).toFixed(2)}%</div>
          <div class="stat-leadin--small">of all contribs</div>
        <div class="stat-leadin">Actual</div>
      </div>
      <div class="stat-separator">/</div>
        <div class="stat-group stat-group--vert-centered">
        <div class="stat stat--val stat--percent">${(datum.studentsByDemo.find(d => d.name === datum.line_name).percent * 100).toFixed(2)}%</div>
        <div class="stat-leadin--small">of all students</div>
        <div class="stat-leadin">Expected</div>
      </div>
      </div>
        `;
      return ret;
    }).join('');
  }


  sidebar.setSlide('bar_tooltip', html, title)
};


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
    console.log('items', props);
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
    updateGraph();
  });

  let recent_obs = obs.sort(function(a, b) {return a.compare_date - b.compare_date}).slice(-8);
  let recent_obs_ids = recent_obs.map(obs => obs.id);
  timeline.focus(recent_obs_ids);

  return timeline
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

const possibleSlides = {
  env: {
    show: 'env',
    pos: 1,
  },
  obs: {
    show: 'obs',
    pos: 2,
  },
  params: {
    show: 'params',
    pos: 3,
  }
};

const lastSlide = new ReactiveVar('env');

let calculateSlidePosition = function(section) {
  //console.log('calculateSlidePosition, going to slide', section);
  lastSlide.set(section);
  let slideSettings = possibleSlides[lastSlide.get()];
  let prevSlides = Object.keys(possibleSlides).filter(item => possibleSlides[item].pos < slideSettings.pos);
  //console.log('prevsliders', prevSlides);

  let heights = prevSlides.map(prevSlide => $('.report-section[data-slide-id="' + prevSlide +'"]').height() + 40); // 40px margin
  let aboveItemsHeight = heights.reduce((a, b) => a + b, 0);  // sum
  let topMargin = `${aboveItemsHeight * -1}px`;

  $('.report-section-wrapper__slide').css('marginTop', topMargin)
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

// let getCurrentEnvId = function() {
//   let selected = $(".option--environment.selected");
//   if (selected.length !== 0) {
//     return selected.attr('data-env-id');
//   }
//   else {
//     return false
//   }
// };