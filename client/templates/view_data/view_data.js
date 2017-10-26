/*
* JS file for view_data.js
*/
var d3 = require('d3');
//Generate classroom buttons immediately
Template.viewData.rendered = function() {
  var envs = Environments.find({}).fetch();
  if ($.isEmptyObject(envs)) {
    $('.env-selection').append('<h2 class="subtitle is-2" style="color: red;">You must create classroom data before doing an analysis is possible.</h2>')
  } else {

    var classButtons = $('.env-selection');
    for (env in envs) {
      name = envs[env]['envName'];
      id = envs[env]['_id'];

      var button = $('<button>', {
        class: "button is-medium classroom-selection",
        text: name,
        data_id: id
      }).appendTo(classButtons);

      button.click(function (e) {
          e.preventDefault();

          $(this).siblings().removeClass('chosen');
          if ( $(this).hasClass('chosen') ){
            $(this).removeClass('chosen');
          } else {
            $(this).addClass('chosen');
          }
        });
    }
  }
}

Template.viewData.helpers({
   environment: function() {
      return Environments.find({}, {sort: {submitted: -1}});
   },
});

Template.viewData.helpers({
   sequences: function() {
      return Sequences.find();
   },
});

Template.viewData.helpers({
   subjects: function() {
      return Subjects.find();
   },
});



Template.viewData.events({

  'click .reset-button': function (e) {
    location.reload()
  },

  'click .help-button': function (e) {
    $('#help-env-modal').addClass("is-active");
  },
  'click #help-close-modal': function(e) {
    $('#help-env-modal').removeClass("is-active");
  },
  'click .modal-card-foot .button': function(e) {
    $('#help-env-modal').removeClass("is-active");
  },

  'click .generate-button': function (e) {
    // Get classroom, obs, and all params.
    obsIds = [];
    dParams = [];
    sParams = [];

    envId = $('.env-selection .chosen').attr('data_id');
    $('.obs-selection .chosen').each(function () { obsIds.push($(this).attr('data_id')) });
    $('.dparam-selection .chosen').each(function () { dParams.push($(this).attr('data_id')) });
    $('.sparam-selection .chosen').each(function () { sParams.push($(this).attr('data_id')) });
    // Start generating graphs
    demData = makeDemGraphs(envId, dParams);
    groupCData = makeContributionGraphs(obsIds, dParams, sParams);

    classStats(envId, sParams, obsIds, dParams);

    makeRatioGraphs(envId, groupCData, demData);
    makeIndividualGraphs(obsIds);

    $('.option-select').css('display', 'none');
    $('.report-body').css('visibility', 'visible');
  },

  'click .classroom-selection': function(e) {
    envId = $(e.target).attr('data_id');
    obs = Observations.find({"envId": envId}).fetch();
    dparams = SubjectParameters.findOne({'children.envId': envId});
    sparams = SequenceParameters.findOne({'children.envId': envId});

    $(".obs-selection").empty();
    $(".dparam-selection").empty();
    $(".sparam-selection").empty();

    var obsButtons = $('.obs-selection');
    for (ob in obs) {
      name = obs[ob]['name'];
      id = obs[ob]['_id'];

      var button = $('<button>', {
        class: "button is-medium option-selectors",
        text: name,
        data_id: id
      }).appendTo(obsButtons);

      button.click(function (e) {
          e.preventDefault();

          if ( $(this).hasClass('chosen') ){
            $(this).removeClass('chosen');
          } else {
            $(this).addClass('chosen');
          }
        });
    }

    var SA = $('<button>', {
        class: "button is-medium option-selectors",
        text: "Select All",
        data_id: 999
      }).appendTo(obsButtons);

    SA.click(function (e) {
      e.preventDefault();
      $(this).siblings().addClass('chosen');
    });

    var demButtons = $('.dparam-selection');
    dpairs = dparams['children']['parameterPairs'];
    for (var d = 0; d < dpairs; d++) {
      name = dparams['children']['label'+d];
      id = dparams['children']['label'+d];

      var button = $('<button>', {
        class: "button is-medium option-selectors",
        text: name,
        data_id: id
      }).appendTo(demButtons);

      button.click(function (e) {
          e.preventDefault();

          if ( $(this).hasClass('chosen') ){
            $(this).removeClass('chosen');
          } else {
            $(this).addClass('chosen');
          }
        });
    }

    var DSA = $('<button>', {
        class: "button is-medium option-selectors",
        text: "Select All",
        data_id: 999
      }).appendTo(demButtons);

    DSA.click(function (e) {
      e.preventDefault();
      $(this).siblings().addClass('chosen');
    });

    var seqButtons = $('.sparam-selection');
    spairs = sparams['children']['parameterPairs'];
    for (var s = 0; s < spairs; s++) {
      name = sparams['children']['label'+s];
      id = sparams['children']['label'+s];

      var button = $('<button>', {
        class: "button is-medium option-selectors",
        text: name,
        data_id: id
      }).appendTo(seqButtons);

      button.click(function (e) {
          e.preventDefault();

          if ( $(this).hasClass('chosen') ){
            $(this).removeClass('chosen');
          } else {
            $(this).addClass('chosen');
          }
        });
    }
    var SSA = $('<button>', {
        class: "button is-medium option-selectors",
        text: "Select All",
        data_id: 999
      }).appendTo(seqButtons);

    SSA.click(function (e) {
      e.preventDefault();
      $(this).siblings().addClass('chosen');
    });

   },
   //This should probably be a modal??
  'click .export-class-button': function(e){

    var envId = $('.env-selection .chosen').attr('data_id');
    if(envId)
     {
        var environment = Environments.findOne({"_id":envId});
        var envName = environment['envName'];
        var subjects=Subjects.find({"envId":envId}).fetch();
        var literalArray = []
        for (i=0;i<subjects.length;i++) {
          new_sub = subjects[i]['info'];
          new_sub['envName'] = envName;
          literalArray.push(new_sub);
        }
        var csv = Papa.unparse({
          data: literalArray,
        });
        var csvData = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
        var csvURL =  null;
        //IE download API for saving files client side
        if (navigator.msSaveBlob) {
            csvURL = navigator.msSaveBlob(csvData, 'download.csv');
        } else {
        //Everything else
            csvURL = window.URL.createObjectURL(csvData);
        }
        var tempLink = document.createElement('a');
        tempLink.href = csvURL;
        tempLink.setAttribute('download', envName+'_classroom_export.csv');
        tempLink.click();
      } else {
        alert("Please select a classroom to export!")
      }
  },
  'click .export-data-button': function(e) {

     var envId = $('.env-selection .chosen').attr('data_id');

     if(envId)
     {
        var environment = Environments.findOne({"_id":envId});
        var envName = environment['envName'];
        var sequences=Sequences.find({"envId":envId}).fetch();
        var literalArray = []
        for (i=0;i<sequences.length;i++) {
          new_seq = sequences[i]['info'];
          new_seq['time'] = sequences[i]['time'];
          new_seq['obsName'] = sequences[i]['obsName'];
          new_seq['envName'] = envName;
          literalArray.push(new_seq);
        }
        var csv = Papa.unparse({
          data: literalArray,
        });
        var csvData = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
        var csvURL =  null;
        //IE download API for saving files client side
        if (navigator.msSaveBlob) {
            csvURL = navigator.msSaveBlob(csvData, 'download.csv');
        } else {
        //Everything else
            csvURL = window.URL.createObjectURL(csvData);
        }
        var tempLink = document.createElement('a');
        tempLink.href = csvURL;
        tempLink.setAttribute('download', envName+'_sequence_export.csv');
        tempLink.click();
      } else {
        alert("Please select a classroom to export!")
      }

    }
});

function renderStats(stats, data, name, total) {
  // var sumValues = obj => Object.values(obj).reduce((a, b) => a + b);
  //
  // if (!data) {
  //   return;
  // }
  //
  // var totalValue = sumValues(data);

  var rowTwo = $('<div/>', {
    class: "category-list",
  }).appendTo(stats);

  var sh = $('<h3/>', {
    class: "stat-head title is-5",
    text: name
  }).appendTo(rowTwo);
  var bullets4 = $('<ul/>', {
    class: "stat-list"
  }).appendTo(rowTwo);
  for (key in data) {
    // var pct = (data[key] / totalValue) * 100;
    var ac = $('<li/>', {
      text: ""+key+": " + data[key], // + " / "+ parseFloat(pct.toFixed(2)) + "%",
      class: "single-stat"
    }).appendTo(bullets4)
  }
}


function classStats(envId, sParams, obsId) {
  var studs = Subjects.find({"envId": envId}).fetch();
  var conts = Sequences.find({'envId': envId}).fetch();
  var totalStuds = studs.length;
  var studTrack = new Set();
  var totalCont = conts.length;
  var stats = $('.class-stats');

  var filteredResults = conts.filter(function(result) {
      for (var i = 0; i < obsId.length; i++ ) {
        if (obsId[i] === result.obsId) {
          return result;
        }
      }
  });

  var classRoomSummary = $('<div/>', {
      class: "category-summary",
  }).appendTo(stats);
  var fh = $('<h3/>', {
    class: "stat-head title is-5",
    text: "Classroom Summary"
  }).appendTo(classRoomSummary);

  sParams.map(function(param) {
    var newObject = {};
    for (con in filteredResults) {
      var next = filteredResults[con]['info'];
      studTrack.add(next['studentId']);
      if (next[param]) {
        if (next[param] in newObject) {
          newObject[next[param]] += 1;
        } else {
          newObject[next[param]] = 1;
        }
      }
    }
    var total = studTrack.size;
    renderStats(stats, newObject, param, total);
    newObject = {};
  });

  var bullets = $('<ul/>', {
    class: "stat-list"
  }).appendTo(classRoomSummary);
  var tc = $('<li/>', {
    text: "Students who Contributed: "+studTrack.size,
    class: "single-stat"
  }).appendTo(bullets)
  var ts = $('<li/>', {
    text: "Total Students: "+totalStuds,
    class: "single-stat"
  }).appendTo(bullets)
  var perc = parseFloat(studTrack.size/totalStuds).toFixed(2);
  var pp = $('<li/>', {
    text: "Percent Contributing: "+parseFloat(perc*100).toFixed(2)+" %",
    class: "single-stat"
  }).appendTo(bullets)
  var ac = $('<li/>', {
    text: "Total Contributions: "+totalCont,
    class: "single-stat"
  }).appendTo(bullets)
  var ps = $('<li/>', {
    text: "Contributions per student: "+parseFloat(totalCont/studTrack.size).toFixed(2),
    class: "single-stat"
  }).appendTo(bullets)
}

function makeDemGraphs(env, dparams) {
  var subs = Subjects.find({"envId": env}).fetch();
  var data = {}
  for (p in dparams) {
    data[dparams[p]] = {}
    for (s in subs) {
      var val = subs[s]['info'][dparams[p]]
      if (val && val in data[dparams[p]]) {
        data[dparams[p]][val] += 1;
      } else if (val) {
        data[dparams[p]][val] = 1;
      }
    }
  }

  for (key in data){
    makePieChart(d3.entries(data[key]), key);
  }


  return data;

}

function makeContributionGraphs(obsIds, dp, sp) {
  data = {};
  for (d in dp) {
    data[dp[d]] = {};
  }

  for (id in obsIds) {
    var seqs = Sequences.find({"obsId" : obsIds[id]}).fetch();
    for (seq in seqs) {
      var studId = seqs[seq]['info']['studentId'];
      var student = Subjects.findOne({"_id": studId});
      for (s in sp) {
        var param = sp[s];
        var value = seqs[seq]['info'][param];
        if (!value) {continue; }
        for (d in dp) {
          var dem = dp[d];
          var demVal = student['info'][dem]
          if (!demVal) {continue; }
          if (!(param in data[dp[d]])) { data[dem][param] = {}; }
          if (!(value in data[dem][param])) { data[dem][param][value] = {}; }
          if (demVal in data[dem][param][value]) {
            data[dem][param][value][demVal] += 1;
          } else {
            data[dem][param][value][demVal] = 1;
          }
        }

      }
    }
  }

  for (demp in data) {
    for (param in data[demp]) {
      var label = ""+param+" by "+demp;
      var dataSlice = d3.entries(data[demp][param]);
        //Commenting out until final decision
        //No need for now!!
        //makeStackedBar(dataSlice, label, ".contribution-plots", "# of Contributions");
    }
  }

  return data;

}

function makeRatioGraphs(envId, cData, dData) {
  var statData = {};
  var total = d3.sum(d3.values(dData[d3.keys(dData)[0]]))
  var allParams = SubjectParameters.findOne({"children.envId": envId});

  for (key in dData) {
    statData[key] = dData[key];
    d3.keys(statData[key]).map(function (k, i) { statData[key][k] /= total });
  }

  var ratioData = {}

  for (demo in cData) {
    ratioData[demo] = cData[demo];
    for (param in cData[demo]) {
      for (c in cData[demo][param]) {
        var totalCat = d3.sum(d3.values(cData[demo][param][c]));
        d3.keys(ratioData[demo][param][c]).map(function (k, i) { ratioData[demo][param][c][k] /= totalCat });
        d3.keys(ratioData[demo][param][c]).map(function (k, i) { ratioData[demo][param][c][k] /= (statData[demo][k]) });
      }
    }
  }

  for (demp in ratioData) {
    for (param in ratioData[demp]) {
      var label = ""+param+" by "+demp;
      var dataSlice = d3.entries(data[demp][param]);
      //new
        for (obj in dataSlice) {
          for (var x=0; x < allParams['children']['parameterPairs']; x++) {
            if (allParams['children']['label'+x] == demp) {
              selection = allParams['children']['parameter'+x];
              listedParams = selection.split(',');
              for (p in listedParams) {
                if (listedParams[p] in dataSlice[obj].value) {
                  continue;
                } else {
                  dataSlice[obj]['value'][listedParams[p]] = 0.0;
                }
              }
            }
          }
        }
        makeStackedBar(dataSlice, label, ".ratio-plots", "Equity Ratio");
    }
  }

}

function makeIndividualGraphs(oIds) {
  var contribs = {};
  for (id in oIds) {
    var nc = Sequences.find({"obsId": oIds[id]}).fetch();
    for (c in nc) {
      if (contribs[nc[c]['info']["Name"]]) {
        contribs[nc[c]['info']["Name"]] += 1;

      } else {
        contribs[nc[c]['info']["Name"]] = 1;
      }
    }
  }

  data = d3.entries(contribs);
  data = _(data).sortBy('value')

  var margin = {top: 50, right: 20, bottom: 30, left: 40},
    width = 900 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    fullW = 900,
    fullH = 500;

  var svg = d3.select(".individual-plots")
            .append("svg")
            .attr('width', fullW)
            .attr('height', fullH);


  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleBand().rangeRound([0, fullW]).padding(0.5),
    y = d3.scaleLinear().rangeRound([height, 0]);


  x.domain(data.map(function(d) { return d.key.slice(0,10); }));
  y.domain([0, d3.max(data, function(d) { return d.value; })]);

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks())
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Frequency");

  g.selectAll(".bar")
    .data(data)
    .enter().append("rect")
      .attr("class", "single-bar")
      .attr("x", function(d) { return x(d.key.slice(0,10)); })
      .attr("y", function(d) { return y(d.value); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d.value); });

  g.append("text")
      .attr("x", width/2)
      .attr("y", -20)
      .attr("dy", "0.32em")
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .text("Contributions over Students");

}

function makePieChart(data, label) {

  var margin = {header: 100, top: 50, right: 50, bottom: 50, left: 50},
  width = 600 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom - margin.header,
  fullW = 500,
  fullH = 500,
  radius = Math.min(width, height) / 2;

  var svg = d3.select(".demo-plots")
            .append("svg")
            .attr('width', fullW)
            .attr('height', fullH);

  g = svg.append("g").attr("transform", "translate(" + (fullW/2) + "," + (fullH/2)+ ")");

  var color = d3.scaleOrdinal()
    .range(["#F15854", "#DECF3F", "#B276B2", "#B2912F", "#F17CB0", "#60BD68", "#FAA43A"]);

  var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.value; });

  var path = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

  var label = d3.arc()
    .outerRadius(radius - 40)
    .innerRadius(radius - 70);

  var arc = g.selectAll('.arc')
      .data(pie(data))
      .enter().append("g")
        .attr('class', 'arc');

  arc.append("path")
    .attr('d', path)
    .attr('fill', function (d) { return color(d.data.key); });

  arc.append("text")
      .attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
      .attr("dy", "0.35em")
      .attr("font-size", "1.25em")
      .text(function(d) { return d.data.key; });

  svg.append("text")
    .attr("transform", "translate("+fullW/2+","+40+")")
    .attr("font-size", "40px")
    .attr("text-anchor", "middle")
    .text(key);

}

function makeStackedBar(dataEnum, label, selector, yLabel) {

  var margin = {top: 50, right: 20, bottom: 30, left: 40},
    width = 600 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    fullW = 600,
    fullH = 500;

  var svg = d3.select(selector)
            .append("svg")
            .attr('width', fullW)
            .attr('height', fullH);

  g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // BarChart Axes
  var x0 = d3.scaleBand()
      .rangeRound([0, width])
      .paddingInner(0.1);

  // Grouping Axis
  var x1 = d3.scaleBand()
      .padding(0.5);

  // Bars
  var y = d3.scaleLinear()
      .rangeRound([height, 0]);

  //Colors
  var z = d3.scaleOrdinal()
      .range(["#F17CB0", "#60BD68", "#FAA43A", "#F15854", "#DECF3F", "#B276B2", "#B2912F"]);

  //Set Keys

  sample = dataEnum[0].value;
  keys = [];
  for (bit in sample) {
    keys.push(bit);
  }
  x0.domain(dataEnum.map(function(d) { return d.key; }));
  x1.domain(keys).rangeRound([0, x0.bandwidth()]);

  y.domain([0, 1.25*d3.max(dataEnum, function(d) { return d3.max(keys, function(key) { return d.value[key]; }); })]).nice();

  g.append("g")
    .selectAll("g")
    .data(dataEnum)
    .enter().append("g")
      .attr("transform", function(d) { return "translate(" + x0(d.key) + ",0)"; })
      .attr('class', "bar-chart")
    .selectAll("rect")
    .data(function(d) { return keys.map(function(key) { val = d.value[key] || .01; return {key: key, value: val} }) })
    .enter().append("rect")
      .attr('class', 'rect')
      .attr("x", function(d) { return x1(d.key); })
      .attr("y", function(d) { return y(d.value); })
      .attr("width", x1.bandwidth())
      .attr("height", function(d) { return height - y(d.value); })
      .attr("fill", function(d) { return z(d.key); })
      .enter().append("g")
      .attr("font-size", "20px")
      .data(function(d) { return keys.map(function(key) { val = d.value[key] || 0; return {key: key, value: val} }) })
      .enter().append("text")
      .text(function(d) { if (d.value == 0) return d.value })
        .attr("width", x1.bandwidth())
        .attr("x", function(d) { return x1(d.key) + ((x1.bandwidth() / 2) - 3); })
        .attr("y", function(d) { return y(d.value) - 10; })

  g.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x0));

  g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
      .attr("x", -5)
      .attr("y", y(y.ticks().pop()) - 10)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text(yLabel);

  g.append("line")
    .style("stroke", "black")
    .attr("x1", 0)
    .attr("y1", y(1.0))
    .attr("x2", width)
    .attr("y2", y(1.0));

  var legend = g.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 25)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z);

  legend.append("text")
      .attr("x", width - 30)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });

    g.append("text")
      .attr("x", fullW/2)
      .attr("y", -20)
      .attr("dy", "0.32em")
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("font-size", 24)
      .text(label);

}
