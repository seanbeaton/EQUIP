/*
* JS file for view_data.js
*/

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
    makeDemGraphs(envId, dParams);
    makeContributionGraphs(obsIds, dParams, sParams);

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

   },
   //This should probably be a modal??
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
        tempLink.setAttribute('download', envName+'_CSV_export.csv');
        tempLink.click();
      } else {
        alert("Please select a classroom to export!")
      }
      
    }
});

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

        makeStackedBar(dataSlice, label);
    }
  }
}

function makePieChart(data, label) {

  var margins = 100, 
  width = 600 - margins, 
  height = 500 - margins,
  radius = Math.min(width, height) / 2;

  var svg = d3.select(".demo-plots")
            .append("svg")
            .attr('width', width)
            .attr('height', height);

  g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

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
      .text(function(d) { return d.data.key; });

  svg.append("text")
    .attr("transform", "translate("+width/2+","+(height-40)+")")
    .attr("font-size", "40px")
    .attr("text-anchor", "middle")
    .text(key);

}

function makeStackedBar(dataEnum, label) {


  var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 600 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    fullW = 600,
    fullH = 500;

  var svg = d3.select(".contribution-plots")
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
      .padding(0.05);

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

  y.domain([0, d3.max(dataEnum, function(d) { return d3.max(keys, function(key) { return d.value[key]; }); })]).nice();


  g.append("g")
    .selectAll("g")
    .data(dataEnum)
    .enter().append("g")
      .attr("transform", function(d) { return "translate(" + x0(d.key) + ",0)"; })
    .selectAll("rect")
    .data(function(d) { return keys.map(function(key) { val = d.value[key] || 0; return {key: key, value: val} }) })
    .enter().append("rect")
      .attr("x", function(d) { return x1(d.key); })
      .attr("y", function(d) { return y(d.value); })
      .attr("width", x1.bandwidth())
      .attr("height", function(d) { return height - y(d.value); })
      .attr("fill", function(d) { return z(d.key); });

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
      .text("# of Contributions");

  var legend = g.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 55)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z);

  legend.append("text")
      .attr("x", width - 60)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });

}
