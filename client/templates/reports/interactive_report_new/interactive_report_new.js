import {Sidebar} from '../../../../helpers/graph_sidebar';
import {setupVis} from '../../../../helpers/timeline';
import {clearGraph, clearObservations, clearParameters, getLabelColors, xor} from '../../../../helpers/graphsv2';
import {console_log_conditional} from "/helpers/logging"
import {getEnvironments, getObsOptions, getDiscourseDimensions, getParamOptions, getDemographics, getSelectedObservations} from "../../../../helpers/environmentsv2";

// const obsOptions = new ReactiveVar([]);
// const selectedEnvironment = new ReactiveVar(false);
// const selectedObservations = new ReactiveVar([]);
// const selectedXParameter = new ReactiveVar(false);
// const selectedYParameter = new ReactiveVar(false);
// const selectedDatasetType = new ReactiveVar('contributions');

// const cacheInfo = new ReactiveVar();
// const loadingData = new ReactiveVar(false);

Template.interactiveReportNew.onCreated(function created() {
  this.autorun(() => {
    this.subscribe('observations');
    this.subscribe('groupObservations');
    this.subscribe('subjects');
    this.subscribe('groupSubjects');
    this.subscribe('subjectParameters');
    this.subscribe('groupSubjectParameters');
    this.subscribe('sequenceParameters');
    this.subscribe('groupSequenceParameters');
    this.subscribe('environments');
    this.subscribe('groupEnvironments');
  })
  this.state = new ReactiveDict();
  this.state.setDefault({
    selectedXParameter: false,
    selectedYParameter: false,
    selectedEnvironment: false,
    selectedObservationIds: [],
    selectedDatasetType: 'contributions',
    obsOptions: false,
    isLoadingData: false,
    cacheInfo: undefined,
  });

  this.clearGraph = () => {
    clearGraph.call({
      instance: this,
      graphSelector: '.interactive-report__graph',
    });
  };
  this.clearObservations = () => {
    clearObservations.call({
      instance: this
    });
  };
  this.clearParameters = () => {
    clearParameters.call({
      instance: this
    });
  };
  //
  // this.setupVis = (visContainerId, selectionCallback, obsOptions, selectedObservations, class_type) => {
  //   return setupVis.call({
  //     instance: this
  //   }, visContainerId, selectionCallback, obsOptions, selectedObservations, class_type);
  // };
  this.getObsOptions = () => {
    return getObsOptions.call({
      instance: this
    });
  };
  this.getEnvironments = (minObservations, onlyGroupWork) => {
    return getEnvironments.call({
      instance: this
    }, minObservations, onlyGroupWork);
  };
  this.getDiscourseDimensions = () => {
    return getDiscourseDimensions.call({
      instance: this
    });
  };
  this.getParamOptions = (param_type) => {
    return getParamOptions.call({
      instance: this
    }, param_type);
  };
  this.getDemographics = () => {
    return getDemographics.call({
      instance: this
    });
  };
  this.getSelectedObservations = () => {
    return getSelectedObservations.call({
      instance: this
    });
  };

  this.datasetTypes = [
    {
      id: 'contributions',
      name: 'Contributions',
      selected: 'selected'
    },
    {
      id: 'avg_contributions',
      name: 'Average Contributions',
      selected: ''
    },
  ]

  this.visSelectionCallback = () => {
    this.updateReport();
  }
  this.visClassType = 'whole_class';


  this.getXAxisSelection = () => {
    return this.getAxisSelection('X');
  }

  this.getYAxisSelection = () => {
    return this.getAxisSelection('Y');
  }

  this.getAxisSelection = (axis) => {
    let $swappable = this.$('.swappable');
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
    let options = this.getParamOptions(param_type);
    // console.log('options', options)
    // console.log('selected_value', selected_value)
    let selected_option = options.filter(opt => opt.label === selected_value)[0];

    selected_option.option_list = selected_option.options

    let ret = {
      selected_value: selected_value,
      selected_option: selected_option,
      param_type: param_type,
      options: options,
    }
    //console_log_conditional('ret in ', axis, ' axis', ret);
    return ret
  }

  this.updateGraph = async (refresh) => {

    let dataParams = {
      envId: this.state.get('selectedEnvironment'),
      obsIds: this.state.get('selectedObservationIds'),
      xParams: this.getXAxisSelection(),
      yParams: this.getYAxisSelection(),
      currentDemo: this.getCurrentDemographicSelection(),
    }

    this.state.set('isLoadingData', true);

    Meteor.call('getInteractiveReportData', dataParams, refresh, (err, result) => {
      if (err) {
        console_log_conditional('error', err);
        return;
      }
      this.state.set('cacheInfo', {
        createdAt: result.createdAt.toLocaleString(),
        timeToGenerate: result.timeToGenerate,
        timeToFetch: result.timeToFetch
      });

      this.state.set('isLoadingData', false);
      this.createGraph(result.data, '.interactive-report__graph', this.state.get('selectedDatasetType'))
    })
  }

  this.getCurrentDiscourseSelection = () => {
    let selected = $('.param-select-form-item[data-param-type="discourse"] option:selected');
    if (selected.val()) {
      return selected.val();
    }
    else {
      return false
    }
  }

  this.getCurrentDemographicSelection = () => {
    let selected = $('.param-select-form-item[data-param-type="demographics"] option:selected');
    if (selected.val()) {
      return selected.val();
    }
    else {
      return false
    }
  }

  this.allParamsSelected = () => {
    let demo_select = this.getCurrentDemographicSelection();
    let disc_select = this.getCurrentDiscourseSelection();
    return (!!demo_select && !!disc_select)
  };

  this.updateReport = () => {
    let report_wrapper = this.$('.interactive-report-wrapper');

    if (!this.getXAxisSelection() || !this.getYAxisSelection()) {
      return;
    }

    if (!this.allParamsSelected()) {
      return;
    }

    if (this.state.get('selectedObservationIds').length < 1) {
      this.clearGraph();
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
    this.updateKey('.interactive-report__graph-key');
    this.updateGraph();

    // update the report values
  }

  this.updateKey = (key_wrapper) => {
    var d3 = require('d3');
    let y_axis = this.getYAxisSelection();
    let color_function;
    if (y_axis.param_type === 'demographics') {
      color_function = d3.interpolateViridis
    }
    else {
      color_function = d3.interpolatePlasma
    }
    let label_colors = this.getLabelColors(y_axis.selected_option.option_list, color_function);
    let key_chunks = Object.keys(label_colors).map(function (label) {
      let color = label_colors[label]
      return `<span class="key--label"><span class="key--color" style="background-color: ${color}"></span><span class="key--text">${label}</span></span>`
    })

    let html = `${key_chunks.join('')}`;
    this.$(key_wrapper).html(html)
  }

  this.createGraph = (contribData, containerSelector, dataset) => {
    var d3 = require('d3');
    let data,
      y_label = '';
    if (this.state.get('selectedDatasetType') === 'contributions') {
      data = contribData.y_axis;
      y_label = "Contributions";
    }
    else if (this.state.get('selectedDatasetType') === 'avg_contributions') {
      data = contribData.avg_contributions_data;
      y_label = "Average Contributions";
    }
    else {
      data = contribData.equity_ratio_data;
      y_label = "Equity Ratio";
    }

    let svg_tag = $('<svg width="718" height="580">' +
      '<defs>\n' +
      '  <style type="text/css">\n' +
      '    @font-face {\n' +
      '      font-family: Roboto;\n' +
      '      @import url(\'https://fonts.googleapis.com/css?family=Roboto:300,400,700\');\n' +
      '    }\n' +
      '  </style>\n' +
      '</defs>' +
      '</svg>');
    this.$(containerSelector).html(svg_tag);

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
    console_log_conditional('contribData', contribData);
    if (contribData.y_axis_param_type === 'demographics') {
      color_function = d3.interpolateViridis
    }
    else {
      color_function = d3.interpolatePlasma
    }
    let key_colors = this.getLabelColors(keys, color_function);
    var z = d3.scaleOrdinal()
      .range(Object.values(key_colors));

    x0.domain(data.map(function (d) {
      return d.column_name;
    }));
    x1.domain(keys).rangeRound([0, x0.bandwidth()]);
    y.domain([0, Math.max(2, d3.max(data, function (d) {
      return d3.max(keys, function (key) {
        return d[key];
      });
    }))]).nice();

    g.append("g")
      .selectAll("g")
      .data(data)
      .enter().append("g")
      .attr("transform", function (d) {
        return "translate(" + x0(d.column_name) + ",0)";
      })
      .attr("class", 'bar-group')
      .attr("data-bar-group", function (d) {
        return d.column_name
      })
      .attr("data-bar-group-type", function (d) {
        return contribData.x_axis_param_type
      })
      .selectAll("rect")
      .data(function (d) {
        return keys.map(function (key) {
          return {key: key, value: d[key]};
        });
      })
      .enter().append("rect")
      .attr("x", function (d) {
        return x1(d.key);
      })
      .attr("y", function (d) {
        return y(d.value);
      })
      .attr("width", x1.bandwidth())
      .attr("height", function (d) {
        return height - y(d.value);
      })
      .attr("fill", function (d) {
        return z(d.key);
      })
      .attr("class", 'hover-bar')
      .attr("data-bar-x", function (d) {
        return d.key
      })
      .attr("data-bar-x-type", function (d) {
        return contribData.y_axis_param_type
      })
      .on('mouseover', function () {
        // hover on
        let group = $(this).parent().attr('data-bar-group');
        let group_type = $(this).parent().attr('data-bar-group-type');
        let bar = $(this).attr('data-bar-x');
        let bar_type = $(this).attr('data-bar-x-type');
        buildBarTooltipSlide(group, group_type, bar, bar_type, contribData)
      })
      .on('mouseout', function () {
        // sidebar.setCurrentPanel('start', 250)
        // hover out

      })
    // text labels for 0s

    g.selectAll('g.bar-group')
      .selectAll('text')
      .data(function (d) {
        return keys.map(function (key) {
          return {key: key, value: d[key]};
        });
      })
      .enter()
      .append('text')
      .text(function (d) {
        if (d.value === 0) {
          return '0';
        }
      })
      .attr("text-anchor", "middle")
      .attr("x", function (d) {
        return x1(d.key) + x1.bandwidth() / 2;
      })
      .attr("y", function (d) {
        return y(d.value) - 6;
      })
      .attr("font-family", "sans-serif")
      .attr("font-size", "16px")
      .attr("fill", "black");

    let xAxis = d3.axisBottom(x0)
      .tickFormat(function (d, i) {
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
      .call(function (text) {
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
        text.each(function () {
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
          .call(d3.axisLeft(y).tickFormat(function (e) {
              if (Math.floor(e) !== e) {
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

    let toggleTickDirection = function (tick) {
      if ($(tick).attr('x2') === "-6") {
        $(tick).attr('x2', width)
      }
      else {
        $(tick).attr('x2', "-6")
      }
    };

    if (this.state.get('selectedDatasetType') === 'equity') {
      let center_line = $('.axis--y g').filter((idx, item) => parseFloat($('text', item).text()) === 1.);
      // toggleTickDirection($('line', center_line[0]));
      this.$(center_line[0]).on('click', function (tick) {
        toggleTickDirection($('line', center_line[0]));
      });
      this.$(center_line[0]).addClass('clickable-tick')
    }
  }

  this.getLabelColors = getLabelColors

});

Template.interactiveReportNew.helpers({
  reportSettings: function() {
    let instance = Template.instance();
    // console.log('report settings')
    // console.log('this.getEnvironments(instance.state.selectedEnvironment)', instance.getEnvironments())
    // console.log('getObsOptions(instance.state.selectedEnvironment)', instance.getObsOptions())
    // console.log('this.datasetTypes()', instance.datasetTypes)
    // console.log('!!(instance.state.selectedEnvironment.get())', !!(instance.state.get('selectedEnvironment')))
    // console.log('!!(instance.state.selectedObservationIds.get().length)', !!(instance.state.get('selectedObservationIds').length))
    // console.log('instance.state.get(\'selectedEnvironment\')', instance.state.get('selectedEnvironment'))
    // console.log('instance.state.get(\'selectedObservationIds\')', instance.state.get('selectedObservationIds'))
    // console.log('this.selectedObservations', instance.getSelectedObservations())
    let _ = {
      environments: instance.getEnvironments(),
      obsOptions: instance.getObsOptions(),
      datasetTypes: instance.datasetTypes,
      visSelectionCallback: instance.visSelectionCallback,
      visClassType: instance.visClassType,
      environmentChosen: !!(instance.state.get('selectedEnvironment')),
      observationChosen: !!(instance.state.get('selectedObservationIds').length),
      selectedEnvironment: instance.state.get('selectedEnvironment'),
      selectedObservationIds: instance.state.get('selectedObservationIds'),
      selectedObservations: instance.getSelectedObservations(),
      setSelectedEnvironment(id) {
        instance.state.set('selectedEnvironment', id);
      },
      setSelectedObservationIds(id) {
        instance.state.set('selectedObservationIds', id);
      },
      setSelectedDatasetType(id) {
        instance.state.set('selectedDatasetType', id);
      },
      datasetSelectCallback() {
        instance.updateReport();
      },
      environmentSelectCallback() {
        instance.$('#disc-select').val('');
        instance.$('#demo-select').val('');
        instance.clearGraph();
        instance.clearObservations();
        instance.state.set('obsOptions', instance.getObsOptions(instance.state.get('selectedEnvironment')));
      },
    }
    console.log('reportSettings', _)
    return _;
  },
  selectedObservations: function() {
    return this.getSelectedObservations()
  },

  demographics: function () {
    let instance = Template.instance();
    return instance.getDemographics();
  },
  discourseparams: function () {
    let instance = Template.instance();
    return instance.getDiscourseDimensions();
  },
  demo_available: function () {
    let instance = Template.instance();
    return !!instance.state.get('selectedEnvironment') && !!(instance.state.get('selectedObservationIds').length >= 1) ? '' : 'disabled'
  },
  disc_available: function () {
    let instance = Template.instance();
    return !!instance.state.get('selectedEnvironment') && !!(instance.state.get('selectedObservationIds').length >= 1) ? '' : 'disabled'
  },
  selectedDatasetType: function () {
    let instance = Template.instance();
    return instance.state.get('selectedDatasetType');
  },
  cache_info: function () {
    let instance = Template.instance();
    return instance.state.get('cacheInfo');
  },
  loadingDataClass: function () {

    let instance = Template.instance();
    return instance.state.get('isLoadingData');
  },
});


Template.interactiveReportNew.events({
  'change .select__wrapper select': function (e, instance) {
    instance.state.set('selectedXParameter', instance.getXAxisSelection());
    instance.state.set('selectedYParameter', instance.getYAxisSelection());
    instance.updateReport();
  },
  'click .swappable__button': function (e, instance) {
    let $target = $(e.target);
    if (!$target.hasClass('.swappable__button')) {
      $target = $target.parents('.swappable__button');
    }
    $target.parents('.swappable').toggleClass('swapped');

    instance.state.set('selectedXParameter', instance.getXAxisSelection());
    instance.state.set('selectedYParameter', instance.getYAxisSelection());
    instance.updateReport();
  },
  'click .refresh-report': function (e, instance) {
    e.preventDefault();
    instance.updateGraph(true)
  }
});



let sidebar;



let buildBarTooltipSlide = function (group, group_type, bar, bar_type, contribData) {
  let title = `<span class="group">${group}</span> <span class="deemphasize">x</span> <span class="bar">${bar}</span>`;

  let chosen_demo = (group_type === 'demographics') ? group : bar;
  let chosen_discourse = (bar_type === 'discourse') ? bar : group;

  let students_in_demo = contribData.students.filter(student => student.info.demographics[contribData.selected_demographic] === chosen_demo);

  let students_in_demo_contribs_updated = students_in_demo.map(function (student) {
    student.relevant_contributions = student.contributions.filter(contrib => contrib[contribData.selected_discourse_dimension] === chosen_discourse);
    return student;
  });

  let contributing_students = students_in_demo_contribs_updated.filter(student => student.relevant_contributions.length > 0);

  let non_contributing_students = students_in_demo_contribs_updated.filter(student => student.relevant_contributions.length === 0);

  let max_contribs_contributing = Math.max(...contributing_students.map(student => student.relevant_contributions.length));
  let contributing_students_html = contributing_students.sort((a, b) => b.relevant_contributions.length - a.relevant_contributions.length).map(function (student) {
    let max_contribs_percent = (student.relevant_contributions.length / max_contribs_contributing) * 100 + '%';
    return `<span class="student-bar student-bar--contributor" style="background: linear-gradient(to right, rgba(15,129,204,0.15) 0%, rgba(15,129,204,0.15) ${max_contribs_percent}, rgba(15,129,204,0.02) ${max_contribs_percent}, rgba(15,129,204,0.02) 100%)">
    ${student.info.name} (${student.relevant_contributions.length})
    </span>`
  }).join('');

  let non_contributing_students_html = non_contributing_students.map(function (student) {
    return `<span class="student-bar student-bar--non-contributor">${student.info.name} (0)</span>`
  }).join('');

  let html = `
    <div class="stat-leadin">Number of contributions</div>
    <div class="stat stat--barchart">${contributing_students_html}${non_contributing_students_html}</div>
  `;

  sidebar.setSlide('bar_tooltip', html, title)
}


// let updateReportTitle = function() {
//   let title = `${getYAxisSelection().selected_value} <span class="deemphasize">by</span> ${getXAxisSelection().selected_value}`
//   $('.interactive-report__title').html(title)
// }



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
