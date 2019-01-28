import vis from 'vis';
let d3 = require('d3');

import '/node_modules/vis/dist/vis.min.css';
import {setupSequenceParameters, setupSubjectParameters} from "../../../helpers/parameters";
import {getSequences} from "../../../helpers/sequences";

// const envSet = new ReactiveVar(false);
const obsOptions = new ReactiveVar([]);
const selectedEnvironment = new ReactiveVar(false);
const selectedObservations = new ReactiveVar([]);
const selectedDemographic = new ReactiveVar(false);
const selectedDiscourseDimension = new ReactiveVar(false);
const selectedDiscourseOption = new ReactiveVar(false);
let timeline;

Template.timelineReportView.helpers({

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
    console.log('getDemographics', getDemographics());
    return getDemographics();
  },
  discourseparams: function() {
    return getDiscourseDimensions();
  },
  disc_options_available: function() {
    return !!selectedDiscourseDimension.get() ? '' : 'disabled'
  },
  selected_discourse_options: function() {
    return getDiscourseOptions();
  }
});


let getDemographics = function() {
  let envId = selectedEnvironment.get();
  return setupSubjectParameters(envId);
};

let getDiscourseDimensions = function() {
  let envId = selectedEnvironment.get();
  return setupSequenceParameters(envId);
};

let getDiscourseOptions = function() {
  let options = getDiscourseDimensions();
  let selected_disc_dim = selectedDiscourseDimension.get();
  console.log('options', options, 'selected_disc_dim', selected_disc_dim);
  let opt =  options.find(opt => opt.name === selected_disc_dim);
  console.log('opt', opt);
  return opt
    .options.split(',').map(function(opt) {return {name: opt.trim()}})
};


let getDemographicOptions = function() {
  let options = getDemographics();
  let selected_demo = selectedDemographic.get();
  let opt =  options.find(opt => opt.name === selected_demo);
  console.log('opt', opt);
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
  'click .option--environment': function(e) {
    let $target = $(e.target);
    if (!$target.hasClass('selected')) {
      $('.option--environment').removeClass('selected');
      $target.addClass('selected');
    }
    else {
      return;
    }
    calculateSlidePosition('obs');

    clearObservations();
    selectedEnvironment.set(getCurrentEnvId());
    obsOptions.set([]);
    obsOptions.set(getObsOptions());
    // console.log('obs options get', obsOptions.get());
    // envSet.set(!!getCurrentEnvId());
    setTimeout(setupVis, 50);
  },
  'change #disc-select': function(e) {
    let selected = $('option:selected', e.target);
    console.log('disc-select,', selected.val());
    selectedDiscourseDimension.set(selected.val());
    $('#disc-opt-select').val('')
    selectedDiscourseOption.set(false);
    updateGraph()
  },
  'change #demo-select': function(e) {
    let selected = $('option:selected', e.target);
    console.log('demo-select,', selected.val());
    selectedDemographic.set(selected.val());
    updateGraph()
  },
  'change #disc-opt-select': function(e) {
    let selected = $('option:selected', e.target);
    console.log('disc-opt-select,', selected.val());
    selectedDiscourseOption.set(selected.val());
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

  console.log('creating data for ', obsIds, demo, dimension, option);
  for (let obsId_k in obsIds) {

    if (!obsIds.hasOwnProperty(obsId_k)) continue;
    let obsId = obsIds[obsId_k];

    let sequences = getSequences(obsId, envId);
    for (let sequence_k in sequences) {
      if (!sequences.hasOwnProperty(sequence_k)) continue;
      let sequence = sequences[sequence_k];

      // console.log('sequence', sequence);

      if (!ret.contributions_dataset.find(datapoint => datapoint.obsId === obsId)) {
        // If it wasn't there:
        let obsers = getObservations();
        console.log('getObservations()', obsers);

        let obs = obsers.find(obs => obs._id === obsId);
        let parseTime = d3.timeParse('%Y-%m-%d');
        console.log('ob SEACH', obs);
        let datapoint = {
          obsId: obsId,
          d3date: parseTime(obs.observationDate),
          date: obs.observationDate,
          _total: 0,
        };
        let demo_opts = getDemographicOptions();
        demo_opts.forEach(function (opt) {
          datapoint[opt.name] = 0
        });

        ret.contributions_dataset.push(datapoint)
      }

      let seqDemoOption = sequence.info.student.demographics[demo];
      // console.log('seqDemoOption', seqDemoOption);


      let ds_index = ret.contributions_dataset.findIndex(datapoint => datapoint.obsId === obsId);

      if (sequence.info.parameters[dimension] === option) {
        ret.contributions_dataset[ds_index]._total += 1;
        ret.contributions_dataset[ds_index][seqDemoOption] += 1;
      }

    }
  }
  console.table(ret.contributions_dataset);


  return ret
};

let updateGraph = function() {
  let timeline_wrapper = $('.timeline-report-wrapper');
  let timeline_selector = '.timeline-report__graph';

  let demo = selectedDemographic.get();
  let dimension = selectedDiscourseDimension.get();
  let option = selectedDiscourseOption.get();

  if (demo === false || dimension === false || option === false) {
    return;
  }

  let data = createTimelineData();
  if (!timeline_wrapper.hasClass('timeline-created')) {
    initTimelineGraph(data, timeline_selector)
  }
  else {
    updateTimelineGraph(data, timeline_selector)
  }
}

let initTimelineGraph = function(full_data, containerSelector) {

  let data = full_data.contributions_dataset;

  console.log('data before');
  console.table(data);
  data = data.sort(function(a, b) {return a.d3date - b.d3date});
  console.log('data after');
  console.table(data);


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
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  let x = d3.scaleTime()
    .domain(d3.extent(data, d => d.d3date))
    .range([0, width]);

  let y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d._total)])
    .range([height, 0]);


  // let lines = [];
  let demos = getDemographicOptions();

  let total_line = d3.line()
    .x(function(d) { return x(d.d3date)})
    .y(function(d) { return y(d._total)});

  let lines = demos.map(function(demo) {
    let line = d3.line()
      .x(d => x(d.d3date))
      .y(d => y(d[demo.name]));
    console.log('demo', demo.name);
    // let line = d3.line()
    //   .x(function(d) { return x(d.d3date)})
    //   .y(function(d) { return y(d[demo.name])});

    return line;
  });
  //
  // let valLine = d3.line()
  //   .x(function(d) {return x(d.date)})
  //   .y(function(d) {return y(d.value)})


  g.append('path')
    .data([data])
    .attr('class', 'line')
    .style("stroke", "blue")
    .attr('d', total_line);

  lines.forEach(function(line) {
    console.log('data is', data);
    g.append('path')
      .data([data])
      .attr('class', 'line')
      .style("stroke", "red")
      .attr('d', line);
  });

  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add the Y Axis
  g.append("g")
    .call(d3.axisLeft(y));

};

let updateTimelineGraph = function(data, containerSelector) {
  initTimelineGraph(data, containerSelector)
};


Template.timelineReport.helpers({
  environments: function() {
    console.log('envs', Environments.find());
    return Environments.find();
  },
  environmentChosen: function() {
    return !!(selectedEnvironment.get());
  },
  observations: function() {
    return obsOptions.get()
  },
  observationChosen: function() {
    return !!(selectedObservations.get().length)
  }
})

let setupVis = function() {
  let observations = obsOptions.get();
  console.log('observations', observations);
  let items = new vis.DataSet(observations.map(function(obs) {
    return {
      id: obs._id,
      content: obs.name + '<br/>(' + obs.observationDate + ')',
      start: obs.observationDate,
    }
  }));
  let container = document.getElementById('vis-container');
  let options = {
    multiselect: true
  }
  timeline = new vis.Timeline(container, items, options)
  // console.log('timeline', timeline);
  timeline.on('select', function(props) {
    // console.log('selected items', props.items, 'props', props);
    selectedObservations.set(props.items);
    updateGraph();
  });
  return timeline
}

let getObsOptions = function() {
  let envId = getCurrentEnvId();
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
  console.log('calculateSlidePosition, going to slide', section);
  lastSlide.set(section);
  let slideSettings = possibleSlides[lastSlide.get()];
  let prevSlides = Object.keys(possibleSlides).filter(item => possibleSlides[item].pos < slideSettings.pos);
  console.log('prevsliders', prevSlides);

  let heights = prevSlides.map(prevSlide => $('.report-section[data-slide-id="' + prevSlide +'"]').height() + 40); // 40px margin
  let aboveItemsHeight = heights.reduce((a, b) => a + b, 0);  // sum
  let topMargin = `${aboveItemsHeight * -1}px`;

  $('.report-section-wrapper__slide').css('marginTop', topMargin)
}

let clearObservations = function() {
  console.log('TODO: CLEAN OBSERVATIONS');
  clearParameters();
  selectedObservations.set([]);
  $('.option--observation').removeClass('selected');

};

let clearParameters = function() {
  console.log('TODO: CLEAN PARAMS')
};

let getCurrentEnvId = function() {
  let selected = $(".option--environment.selected");
  if (selected.length !== 0) {
    return selected.attr('data-env-id');
  }
  else {
    return false
  }
};
