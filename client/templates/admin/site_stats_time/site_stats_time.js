// Meteor.siteStats.events({
//
// });
let d3 = require('d3');

const stats = new ReactiveVar([]);
const statsLoaded = new ReactiveVar(false);
const total_color = new ReactiveVar('#F25F3D');
const month_color = new ReactiveVar('#999999');
const stat_gen_time = new ReactiveVar('');
// const numStatsLoaded = new ReactiveVar('0');

Template.siteStatsTime.helpers({
  statsLoaded: function() {
    return statsLoaded.get();
  },
  totalNumStats: function() {
    return 5;
  },
  stat_gen_time: function() {
    return stat_gen_time.get()
  }
});

Template.siteStatsTime.events({
  'click .refresh-site-stats': function(e) {
    $(e.target).attr("disabled", true)
    $('.refresh-site-stats-text').html('Refreshing...');
    updateStats(true, function() {
      $(e.target).attr("disabled", false)
      $('.refresh-site-stats-text').html('Refreshed!');
    })
  }
})


Template.siteStatsTime.rendered = function() {
  statsLoaded.set(false);
  Meteor.defer(function() {
    updateStats(false);
  })
}

let updateStats = function(refresh, callback) {
  Meteor.call('getStatsTime', refresh, function(err, res) {
    if (!err) {
      $('.stats-container--graphs').html('');
      $('.stats-container--text').html('');
      res.stats.forEach(function(stat) {
        console.log('stat', stat);
        $('.stats-container--graphs').append('<div class="' + stat.selector + '"><h4>' + stat.group_label_prefix + stat.group_label + '</h4><div id="' + stat.selector + '"></div></div>')
        $('.stats-container--text').append('<div class="' + stat.selector + '"><h4>New/Total ' + stat.group_label + '</h4><div id="' + stat.selector + '--text">' + create_text(stat) + '</div></div>')
        create_graph(stat, "#" + stat.selector);
      })
      statsLoaded.set(true);
      console.log('res', res);
      stat_gen_time.set(res.createdAt.toLocaleString())
      if (typeof callback === 'function') {
        callback()
      }
    }
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

  // let ticks = data.map(d => d.d3date);

  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr('class', 'x-axis')
    .call(d3.axisBottom(x).tickFormat(function(date){
      if (d3.timeYear(date) < date) {
        return d3.timeFormat('%b')(date);
      } else {
        return d3.timeFormat('%Y')(date);
      }
    }));

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

