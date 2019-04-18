// Meteor.siteStats.events({
//
// });
let d3 = require('d3');

const stats = new ReactiveVar([]);
const statsLoaded = new ReactiveVar(false);
const total_color = new ReactiveVar('#F25F3D');
const month_color = new ReactiveVar('#999999');
// const numStatsLoaded = new ReactiveVar('0');

Template.siteStatsTime.helpers({
  stats: function() {
    console.log("stats start");
    return get_stats();
  },
  statsLoaded: function() {
    return statsLoaded.get();
  },
  totalNumStats: function() {
    return 5;
  }
});

let get_stats = function() {
  let current_stats = stats.get();
  if (!!current_stats && current_stats.length > 0) {
    return current_stats;
  }

  let _stats = [];
  console.log('start stats gen');
  // can't use reactive var cause the template won't reload while we're running data.

  _stats.push({selector: 'new_users_graph', group_label_prefix: new_total_guide(), group_label: 'users', months: users_over_time()});
  let stats_loaded_markup = $('.num-stats-loaded');
  stats_loaded_markup.html('1');
  console.log('1', stats_loaded_markup.html());

  _stats.push({selector: 'new_classrooms_graph', group_label_prefix: new_total_guide(), group_label: 'classrooms', months: classrooms_over_time()});
  stats_loaded_markup.html('2');
  console.log('2', stats_loaded_markup.html());

  _stats.push({selector: 'new_students_graph', group_label_prefix: new_total_guide(), group_label: 'students', months: students_over_time()});
  stats_loaded_markup.html('3');
  console.log('3', stats_loaded_markup.html());

  _stats.push({selector: 'new_observations_graph', group_label_prefix: new_total_guide(), group_label: 'observations', months: observations_over_time()});
  stats_loaded_markup.html('4');
  console.log('4', stats_loaded_markup.html());

  _stats.push({selector: 'new_sequences_graph', group_label_prefix: new_total_guide(), group_label: 'sequences', months: sequences_over_time()});
  stats_loaded_markup.html('5');
  console.log('5', stats_loaded_markup.html());

  stats.set(_stats);
  return _stats;
}

let new_total_guide = function() {
  return `<span class="key--label"><span class="key--color" style="background-color: ${total_color.get()}"></span><span class="key--text">Total</span></span>/<span class="key--label"><span class="key--color" style="background-color: ${month_color.get()}"></span><span class="key--text">New</span></span>&nbsp;`
}

Template.siteStatsTime.rendered = function() {
  statsLoaded.set(false);
  Meteor.defer(function() {
    let current_stats = get_stats();
    statsLoaded.set(true);
    console.log('current_stats', current_stats);
    $('.stats-container--graphs').html('');
    $('.stats-container--text').html('');
    current_stats.forEach(function(stat) {
      console.log('stat', stat);
      $('.stats-container--graphs').append('<div class="' + stat.selector + '"><h4>' + stat.group_label_prefix + stat.group_label + '</h4><div id="' + stat.selector + '"></div></div>')
      $('.stats-container--text').append('<div class="' + stat.selector + '"><h4>New/Total ' + stat.group_label + '</h4><div id="' + stat.selector + '--text">' + create_text(stat) + '</div></div>')
      create_graph(stat, "#" + stat.selector);

    })
  })
}

let create_graph = function(stats, selector) {
  let data = stats.months;

  let svg_tag = $('<svg width="718" height="500"></svg>');
  $(selector).html(svg_tag);

  let svg = d3.select(selector + " svg"),
    margin = {top: 30, right: 50, bottom: 40, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr('class', 'graph-container').attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  let x = d3.scaleTime()
    .domain(d3.extent(data, d => d.d3date))
    .range([0, width]);

  let y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)]).nice()
    .range([height, 0]);

  let y2 = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.total)]).nice()
    .range([height, 0]);



  g.append('path')
    .data([data])
    .attr('class', 'line line--stat')
    .style("stroke", total_color.get())
    .style("stroke-width", 2)
    .attr('d', d3.line()
      .x(d => x(d.d3date))
      .y(d => y2(d.total)));

  g.append('path')
    .data([data])
    .attr('class', 'line line--stat')
    .style("stroke", month_color.get())
    .style("stroke-width", 2)
    .attr('d', d3.line()
      .x(d => x(d.d3date))
      .y(d => y(d.value)));

  let ticks = data.map(d => d.d3date);

  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr('class', 'x-axis')
    .call(d3.axisBottom(x)
      .tickValues(ticks));

  // // Add the Y Axis
  // g.append("g")
  //   .attr('class', 'axis--y')
  //   .call(d3.axisLeft(y));

  g.append("g")
    .attr("class", "axis--y")
    .call(d3.axisLeft(y).tickFormat(function(e){
        if (Math.floor(e) !== e) {
          return;
        }
        return e;
      })
    )
  .append("text")
    .attr("x", 2)
    .attr("y", y(y.ticks().pop()) + 0.5)
    .attr("dy", "-3.4em")
    .attr("dx", height / -2)
    .attr("fill", "#000")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("New");

  g.append("g")
    .attr("transform", "translate(" + width + ", 0)")
    .attr("class", "axis--y axis--y--right")
    .call(d3.axisRight(y2).tickFormat(function(e){
        if (Math.floor(e) !== e) {
          return;
        }
        return e;
      })
    )
  .append("text")
    .attr("x", 2)
    .attr("y", y(y.ticks().pop()) + 0.5)
    .attr("dy", "-3.4em")
    .attr("dx", height / 2)
    .attr("fill", "#000")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(90)")
    .text("Total");
};

let create_text = function(stat) {

  let markup = `    
       <table>
       <thead><tr><th>Month</th><th>Count</th><th>Total</th></tr></thead>
           <tbody>`;

  if (stat.months.length === 0) {
    markup += `<tr><td colspan="3">No stats available for this month</td></tr>`;
  }

  stat.months.forEach(function(month) {
    markup += `<tr><td>${month.label}</td><td class="number-td">${month.value}</td><td class="number-td">${month.total}</td></tr>`
  })

  markup += `</tbody></table>`;
  return markup
}


let users_over_time = function() {
  return get_grouped_data(Meteor.users.find().fetch(), 'createdAt')
}

let classrooms_over_time = function() {
  return get_grouped_data(Environments.find({isExample: null, envName: {$ne: "Example Classroom"}}).fetch(), 'submitted')
}

let students_over_time = function() {
  return get_grouped_data(Subjects.find({origStudId: null}).fetch(), 'submitted')
}

let observations_over_time = function() {
  return get_grouped_data(Observations.find({origObsId: null}).fetch(), 'submitted')
}

let sequences_over_time = function() {
  return get_grouped_data(Sequences.find({origObsId: null}).fetch(), 'submitted')
}


let get_grouped_data = function(data, key) {
  let month_groups = group_by(data, key);
  let stats = [];
  Object.keys(month_groups).forEach(function(month_key) {
    stats.push({
      label: month_key,
      value: month_groups[month_key].length,
      d3date: d3.timeParse('%B %Y')(month_key)
    })
  })
  stats.sort(function(a, b) {
    // console.log('a, b', a , b);
    return (new Date(a.label) - new Date(b.label))
  })

  let running_total = 0;
  stats.forEach(function(stat) {
    running_total += stat.value;
    stat.total = running_total;
  })

  return stats;
};

let group_by = function(xs, key) {
  let locale = "en-us";
  return xs.reduce(function(rv, x) {
    let date_month;
    if (!x[key]) {
      date_month = 'Not recorded';
    } else {
      date_month = x[key].toLocaleString(locale, {month: 'long', year: 'numeric'});
    }
    (rv[date_month] = rv[date_month] || []).push(x);
    return rv;
  }, {});
};

