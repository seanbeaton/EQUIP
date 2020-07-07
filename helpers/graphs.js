import {getStudents} from "./students";
import {console_log_conditional} from "./logging";

let d3 = require('d3');


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

let createStudentTimeData = function(params) {
  let {envId, obsIds, student, dimension, disc_opts} = params

  let ret = {
    contributions_dataset: []
  };

  for (let obsId_k in obsIds) {

    if (!obsIds.hasOwnProperty(obsId_k)) continue;
    let obsId = obsIds[obsId_k];

    // let sequences = .fetch()
    let selected_observations = getObservations(obsIds);

    Sequences.find({obsId: obsId}).forEach(function(sequence) {

      if (!ret.contributions_dataset.find(datapoint => datapoint.obsId === obsId)) {
        // If it wasn't there:

        let obs = selected_observations.find(obs => obs._id === obsId);
        let parseTime = d3.timeParse('%Y-%m-%d');
        let datapoint = {
          obsId: obsId,
          d3date: parseTime(obs.observationDate),
          obsName: obs.name,
          date: obs.observationDate,
          _total: 0,
        };

        disc_opts.forEach(function (opt) {
          datapoint[opt] = 0
        });

        ret.contributions_dataset.push(datapoint)
      }

      if (sequence.info.student.studentId !== student._id) {
        return;
      }

      let seq_disc_opt = sequence.info.parameters[dimension];
      let ds_index = ret.contributions_dataset.findIndex(datapoint => datapoint.obsId === obsId);

      ret.contributions_dataset[ds_index]._total += 1;
      ret.contributions_dataset[ds_index][seq_disc_opt] += 1;
    })
  }

  ret.contributions_dataset.forEach(function(obs) {
    obs.max = obs._total;
  });

  return ret.contributions_dataset

}

let studentTimeGraph = function(data, selector, envId, dim) {

  data = data.sort(function(a, b) {return a.d3date - b.d3date});

  let svg_tag = $('<svg width="718" height="500">' +
    '<defs>\n' +
    '  <style type="text/css">\n' +
    '    @font-face {\n' +
    '      font-family: Roboto;\n' +
    '      @import url(\'https://fonts.googleapis.com/css?family=Roboto:300,400,700\');\n' +
    '    }\n' +
    '  </style>\n' +
    '</defs>' +
    '</svg>');
  $(selector).html(svg_tag);

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
  let discdims = getDiscourseOptionsForDimension(envId, dim);

  let total_line = d3.line()
    .x(function(d) { return x(d.d3date)})
    .y(function(d) { return y(d._total)});

  let lines = discdims.map(function(dim) {
    let line = d3.line()
      .x(d => x(d.d3date))
      .y(d => y(d[dim]));

    return {line: line, dim: dim};
  });


  //
  // let valLine = d3.line()
  //   .x(function(d) {return x(d.date)})
  //   .y(function(d) {return y(d.value)})
  let total_color = '#555555ff';


  g.append('path')
    .data([data])
    .attr('class', 'line line--total')
    .style("stroke-width", 2)
    .style('stroke', total_color)
    .attr('d', total_line);

  let key_colors = getLabelColors(discdims);

  key_colors.Total = total_color;

  let z = d3.scaleOrdinal()
    .range(Object.values(key_colors));

  updateStudentTimeKey('.student-participation-time__graph-key', Object.keys(key_colors), z)

  lines.forEach(function(line) {

    g.append('path')
      .data([data])
      .attr('class', 'line line--discdim')
      .style("stroke", z(line.dim))
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
      .attr('cy', d => y(d[line.dim]))
      .attr('data-dim-name', line.dim)
      .style("fill", z(line.dim))
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
    let color = color_axis(label)
    return `<span class="key--label"><span class="key--color" style="background-color: ${color}"></span><span class="key--text">${label}</span></span>`
  })

  let html = `${key_chunks.join('')}`;
  $(key_wrapper).html(html)
}

let createStudentContribData = function(params) {
  let {envId, obsIds, student, dimension, disc_opts, students} = params
  let ret = [];

  ret = disc_opts.map(function(opt) {
    return {
      label: opt,
      count: 0,
      all_students: students.map(stud => ({id: stud._id, count: 0})),
      class_total: 0,
    }
  });

  let all_students = students.map(stud => ({id: stud._id, count: 0}));

  for (let obsId_k in obsIds) {
    if (!obsIds.hasOwnProperty(obsId_k)) continue;
    let obsId = obsIds[obsId_k];
    // let sequences = Sequences.find({obsId: obsId}).fetch();
    Sequences.find({obsId: obsId}).forEach(function(sequence) {
      disc_opts.map(function(opt) {
        if (sequence.info.parameters[dimension] === opt) {
          let ds_index = ret.findIndex(datapoint => datapoint.label === opt);
          ret[ds_index].class_total += 1;
          ret[ds_index].all_students.filter(stud => stud.id === sequence.info.student.studentId)[0].count += 1;
          all_students.filter(stud => stud.id === sequence.info.student.studentId)[0].count += 1;
          if (sequence.info.student.studentId === student._id) {
            ret[ds_index].count += 1;
          }
        }
      });
    })
  }

  let total = ret.map(d => d.count).reduce((a, b) => a + b, 0);

  let class_total = ret.map(d => d.class_total).reduce((a, b) => a + b, 0);

  let num_students = students.length;
  ret.forEach(function(opt) {
    let all_counts = opt.all_students.map(d => d.count);
    opt.median = get_median(all_counts);
    opt.average = get_average(all_counts);
  });

  ret.push({
    label: 'Total (Student)',
    count: total,
    class_total: class_total,
    average: class_total / num_students,
    median: get_median(all_students.map(d => d.count)),
  });

  return ret;
}

let studentContribGraph = function(data, selector) {
  let svg_tag = $('<svg width="718" height="400">' +
    '<defs>\n' +
    '  <style type="text/css">\n' +
    '    @font-face {\n' +
    '      font-family: Roboto;\n' +
    '      @import url(\'https://fonts.googleapis.com/css?family=Roboto:300,400,700\');\n' +
    '    }\n' +
    '  </style>\n' +
    '</defs>' +
    '</svg>');
  $(selector).html(svg_tag);

  let container = d3.select(selector + ' svg'),
    margin = {top: 30, right: 20, bottom: 80, left: 50},
    width = +container.attr("width") - margin.left - margin.right,
    height = +container.attr("height") - margin.top - margin.bottom,
    g = container.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  let x = d3.scaleBand() // inside each group
  // .range([0, width])
    .padding(0.10);

  let y = d3.scaleLinear()
    .rangeRound([height, 0]);

  let x_group = d3.scaleBand() // each group
    .rangeRound([0, width])
    .paddingInner(0.1);

  x_group.domain(data.map(d => d.label));
  x.domain(['value', 'median']).rangeRound([0, x_group.bandwidth()]);
  y.domain([0, d3.max(data, d => Math.max(d.count, d.median))]);

  let median_color = '#c8c8c8ff';
  let total_color = '#555555ff';

  let key_colors = getLabelColors(data.map(d => d.label));
  key_colors["__BREAK__"] = '#ffffffff';
  delete key_colors["Total (Student)"];
  key_colors["Total (Student)"] = total_color;
  key_colors["Median (Class)"] = median_color;
  let z = d3.scaleOrdinal()
    .range(Object.values(key_colors));
  updateStudentContribKey('.student-contributions-graph__graph-key', Object.keys(key_colors), z)

  let groups = g.append("g")
    .selectAll("bar")
    .data(data)
    .enter().append('g')
    .attr("transform", function(d) {
      return "translate(" + x_group(d.label) + ",0)"
    })
    .attr("class", 'bar-group')
    .selectAll('rect')
    .data(function(d) {
      return data.filter(i => i.label === d.label)
    })
    .enter();

  groups.append("rect")
    .style("fill", d => z(d.label))
    .attr("x", x("value"))
    .attr("width", x.bandwidth())
    .attr("y", function(d) { return y(d.count); })
    .attr("height", function(d) { return height - y(d.count); });

  groups.append("rect")
    .style("fill", z('Median (Class)'))
    .attr("x", x("median"))
    .attr("width", x.bandwidth())
    .attr("y", function(d) { return y(d.median); })
    .attr("height", function(d) { return height - y(d.median); });

  // 0s on 0 values for the counts
  groups.append('text')
    .text(function(d) {
      if (d.count === 0) {
        return '0';
      }
    })
    .attr("text-anchor", "middle")
    .attr("x", function(d) {
      return x('value') + x.bandwidth() / 2;
    })
    .attr("y", function(d) {
      return y(d.count) - 6;
    })
    .attr("font-family", "sans-serif")
    .attr("font-size", "16px")
    .attr("fill", "black");

  // 0s on 0 values for the medians
  groups.append('text')
    .text(function(d) {
      if (d.median === 0) {
        return '0';
      }
    })
    .attr("text-anchor", "middle")
    .attr("x", function(d) {
      return x('median') + x.bandwidth() / 2;
    })
    .attr("y", function(d) {
      return y(d.median) - 6;
    })
    .attr("font-family", "sans-serif")
    .attr("font-size", "16px")
    .attr("fill", "black");


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
    if (label === '__BREAK__') {
      // it looks like even if the axis value isn't used, it applies it to the next item if you don't call this function.
      let _ = color_axis(label);
      return `<br />`;
    }
    return `<span class="key--label"><span class="key--color" style="background-color: ${color_axis(label)}"></span><span class="key--text">${label}</span></span>`
  })

  let html = `${key_chunks.join('')}`;
  $(key_wrapper).html(html)
}

let getObservations = function(obsIds) {
  return Observations.find({_id: {$in: obsIds}}, {reactive: false}).fetch();
}

let getDiscourseDimensions = function(envId) {
  if (typeof envId === 'undefined' || !envId) {
    return []
  }
  return SequenceParameters.findOne({envId:envId}).parameters;
};

let getDiscourseOptionsForDimension = function(envId, dimension) {
  let options = getDiscourseDimensions(envId);
  if (dimension === false) {
    return [];
  }
  let opt = options.find(opt => opt.label === dimension);

  if (typeof opt === 'undefined') {
    return [];
  }
  return opt.options
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


const createHeatmapData = function(params, sequences) {
  let {envId, obsIds, selectedDemo, heatmapReportSortType} = params

  if (typeof sequences === 'undefined') {
    sequences = Sequences.find({obsId: {$in: obsIds}})
  }

  let ret = {
    contributions_dataset: []
  };

  let start_1 = new Date().getTime();

  let allStudents = getStudents(envId);

  console_log_conditional(new Date().getTime() - start_1, 'start_1')
  let start_2 = new Date().getTime();

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
      name: student.info.name,
      studentId: student._id,
      class: '',
      student: student,
      data_x: student.data_x,
      data_y: student.data_y,
      count: 0,
      show_count: true,
      sort_first: false,
    }
  });

  ret.contributions_dataset_obj = {};

  console.log(new Date().getTime() - start_2, 'start_2')
  let start_3 = new Date().getTime();

  sequences.forEach(function(sequence) {
    let ds_index = ret.contributions_dataset.findIndex(datapoint => datapoint.studentId === sequence.info.student.studentId);
    ret.contributions_dataset[ds_index].count += 1;
  });

  console.log(new Date().getTime() - start_3, 'start_3')
  let start_4 = new Date().getTime();

  let highest_count = ret.contributions_dataset.reduce((acc, student) => student.count > acc ? student.count : acc, 1);

  console.log(new Date().getTime() - start_4, 'start_4')
  let start_5 = new Date().getTime();

  ret.contributions_dataset = ret.contributions_dataset.map(function(datum) {
    datum.quintile = Math.ceil(datum.count * 4 / highest_count);
    return datum
  });

  console.log(new Date().getTime() - start_5, 'start_5')
  let start_6 = new Date().getTime();

  if (heatmapReportSortType === 'buckets') {
    let selected_demo_options = SubjectParameters.findOne({envId: envId}).parameters.filter(d => d.label === selectedDemo)[0];
    let opts;
    if (selected_demo_options) {
      opts = selected_demo_options.options
    }
    else {
      opts = [];
    }
    ret.contributions_dataset = ret.contributions_dataset.map(datum => {datum.selected_demo_value = datum.student.info.demographics[selectedDemo]; return datum})

    opts.map(opt => ret.contributions_dataset.push({
      name: opt,
      studentId: opt + '-label',
      selected_demo_value: opt,
      class: opt + '-label demo-label',
      student: {},
      data_x: 0,
      data_y: 0,
      count: 0,
      show_count: false,
      sort_first: true,
    }));

    let sortDemo = function(a, b) {
      let a_demo = a.selected_demo_value;
      let b_demo = b.selected_demo_value;
      if (a_demo > b_demo) {
        return 1
      }
      else if (a_demo === b_demo) {
        // return b.sort_first - a.sort_first;
        if (a.sort_first) {
          return -1;
        }
        else if (b.sort_first) {
          return 1
        }
        else {
          return b.count - a.count;
        }
      }
      else {
        return -1
      }
    };
    ret.contributions_dataset = ret.contributions_dataset.sort(sortDemo);
  }

  console.log(new Date().getTime() - start_6, 'start_6')

  return ret
};



export {createStudentTimeData, createHeatmapData, createStudentContribData, getObservations, getDiscourseOptionsForDimension, getDiscourseDimensions, studentTimeGraph, studentContribGraph, get_average, get_median}