import {Sidebar} from '../../../../helpers/graph_sidebar';
import {setupVis} from '../../../../helpers/timeline';
import {clearGraph, resetParameters, getLabelColors, xor, invertColor} from '../../../../helpers/graphsv2';
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


Template.histogramReportNew.onRendered(function rendered() {
  this.autorun(() => {
    if (this.subscriptionsReady()) {
      let env_options = this.getEnvironments();
      if (env_options.findIndex(e => !e.disabled) !== -1) {
        let default_env_id = env_options[env_options.findIndex(e => !e.disabled)]._id;

        this.state.set('selectedEnvironment', default_env_id)
        // // let obs_ids = env_options
      }
    }
  });
})


Template.histogramReportNew.onCreated(function created() {
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
    selectedEnvironment: false,
    selectedObservationIds: [],
    students: [],
    selectedStudent: false,
    selectedDemographic: false,
    // selectedDatasetType: 'demographic_groups',
    isLoadingData: false,
    cacheInfo: undefined,
  });

  // this.clearGraph = () => {
  //   clearGraph.call({
  //     instance: this,
  //     graphSelector: '.interactive-report__graph',
  //   });
  // };

  this.getObsOptions = (default_env_id) => {
    return getObsOptions.call({
      instance: this
    }, default_env_id);
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
  this.getDemographics = (args) => {
    return getDemographics.call({
      instance: this
    }, args);
  };
  this.getSelectedObservations = () => {
    return getSelectedObservations.call({
      instance: this
    });
  };

  // this.dataTypeSelectLabel = "Select View";
  // this.datasetTypes = [
  //   {
  //     id: 'demographic_groups',
  //     name: 'Demographic Groups',
  //     selected: 'selected'
  //   },
  //   {
  //     id: 'whole_class',
  //     name: 'Whole Class',
  //     selected: ''
  //   },
  // ]

  this.visSelectionCallback = () => {
    this.updateReport();
  }
  this.visClassType = 'whole_class';


  this.updateGraph = async (refresh) => {
    let histogram_wrapper = this.$('.histogramv2-report-wrapper');
    let histogram_selector = '.histogram-d3-wrapper__graph';

    let histogram_params = {
      obsIds: this.state.get('selectedObservationIds'),
      envId: this.state.get('selectedEnvironment'),
    }

    this.state.set('isLoadingData', true);

    Meteor.call('getHistogramData', histogram_params, refresh, (err, result) => {
      if (err) {
        console_log_conditional('error', err);
        return;
      }


      if (!histogram_wrapper.hasClass('histogram-created')) {
        histogram_wrapper.addClass('histogram-created');
        this.initHistogram(result.data, histogram_selector)
      }
      else {
        $('#heatmap-d3-wrapper').html('');
        this.updateHistogram(result.data, histogram_selector)
      }


      this.state.set('cacheInfo', {
        createdAt: result.createdAt.toLocaleString(),
        timeToGenerate: result.timeToGenerate,
        timeToFetch: result.timeToFetch
      });
      this.state.set('isLoadingData', false);
      // console_log_conditional('result.createdAt.toLocaleString()', result.createdAt.toLocaleString());
    });

  }

  this.selectStudentForModal = (studentId) => {
    this.state.set('selectedStudent', Subjects.findOne({_id: studentId}));
  }

  this.initHistogram = (data, selector) => {
    let d3 = require('d3');
    let container = this.$(selector + '');
    let selectedDemo = this.state.get('selectedDemographic')
    let selectedDemographicOptions = this.getSelectedDemographicOptions();


    let markup = $('<table class="histogramv2-table"><tbody></tbody></table>');


    let key_options = this.getDemographics().find(i => i.label === selectedDemo);
    let color_scale = undefined;
    if (typeof key_options !== 'undefined') {
      key_options.options
      let key_colors = getLabelColors(key_options.options);
      color_scale = d3.scaleOrdinal().range(Object.values(key_colors))
      let student_demo_counts = {};

      data.students.forEach(s => {
        let student_demo = s.student.info.demographics[selectedDemo];
        if (!student_demo_counts.hasOwnProperty(student_demo)) {
          student_demo_counts[student_demo] = 1;
        }
        else {
          student_demo_counts[student_demo] += 1
        }
      })
      this.updateHistogramDemoKey('.histogram-d3-wrapper__key', key_options.options, color_scale, student_demo_counts);

      // let all_students = this.state.get('students');
      // let demo = this.state.get('selectedDemographic');
      // let student_boxes = $('.student-box');
      // student_boxes.each(function (box_index) {
      //   let $box = $($('.student-box')[box_index]);
      //   console_log_conditional('box', $box);
      //   console_log_conditional('getting students');
      //   let student = all_students.filter(stud => stud._id === $box.attr('id'))[0]
      //   console_log_conditional('student', student);
      //   $box.attr('style', `background-color: ${color_scale(student.info.demographics[demo])}`);
      // })
    }
    else {
      $('.histogram-d3-wrapper__key').html('');
    }


    data.students.sort((s_1, s_2) => {
      if (s_1.student.info.demographics[selectedDemo] !== s_2.student.info.demographics[selectedDemo]) {
        return selectedDemographicOptions.indexOf(s_2.student.info.demographics[selectedDemo]) >
          selectedDemographicOptions.indexOf(s_1.student.info.demographics[selectedDemo])
      }
      else {
        return s_2.count > s_1.count;
      }
    }).forEach(function (student) {
      let line_markup = $("<tr class='student-line'></tr>")
      line_markup.append('<td class="student-line__name">' + student.name + '</td>')
      let student_color = (color_scale) ? color_scale(student.student.info.demographics[selectedDemo]) : '#333333';
      let student_count_text_color = invertColor(student_color, true)
      line_markup.append('<td class="student-line__data"><div class="student-line__bar-container"><div class="student-line__bar-inner" style="background-color: ' + student_color + '; width: ' + student.count / data.max * 100 + '%"></div><div class="student-line__bar-count-wrapper" style="left: ' + student.count / data.max * 100 + '%"><div class="student-line__bar-count student-line__bar-count--' + ((student.count / data.max > .5) ? "inside" : "outside") + '" style="color: ' + ((student.count / data.max <= .5) ? "#333" : student_count_text_color ) + '">' + student.count + '</div></div></div></td>')
      markup.append(line_markup);
    })
    container.html(markup);

    $('.student-box').on('click',(el) => {
      this.selectStudentForModal($(el.target).attr('id'));
    });


    // let dim = selectedDemographic.get();


  }

  this.getSelectedDemographicOptions = () => {
    let options = this.getDemographics();
    let selected_demo = this.state.get('selectedDemographic');
    if (!selected_demo) {
      return [];
    }
    let opt = options.find(opt => opt.label === selected_demo);
    return opt.options
  };

  this.updateHistogramDemoKey = (key_wrapper, y_values, color_axis, student_counts) => {
    let key_chunks = y_values.map(function (label) {
      return `<span class="key--label"><span class="key--color" style="background-color: ${color_axis(label)}"></span><span class="key--text">${label} - ${(student_counts[label] === 1 ? student_counts[label] + " Student" : student_counts[label] + " Students")}</span></span>`
    })

    let html = `${key_chunks.join('')}`;
    $(key_wrapper).html(html)
  }

  this.updateHistogram = (data, selector) => {
    this.initHistogram(data, selector);
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
    this.state.set('students', Subjects.find({envId: this.state.get('selectedEnvironment')}).fetch());

    this.updateGraph();

    // update the report values
  }

});

Template.histogramReportNew.helpers({
  reportSettings: function() {
    let instance = Template.instance();
    return {
      environments: instance.getEnvironments(),
      getObsOptions: instance.getObsOptions,
      // dataTypeSelectLabel: instance.dataTypeSelectLabel,
      // datasetTypes: instance.datasetTypes,
      visSelectionCallback: instance.visSelectionCallback,
      visClassType: instance.visClassType,
      additionalSelects: [
        {
          label: 'Demographic',
          options: instance.getDemographics({aggregate: false}),
          autoselectType: 'first_item',
          setterCallback: (id) => {
            instance.state.set('selectedDemographic', id);
            instance.updateReport();
          }
        }
      ],
      environmentChosen: !!(instance.state.get('selectedEnvironment')),
      observationChosen: !!(instance.state.get('selectedObservationIds').length),
      reportState: instance.state,
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

        // needs to run after obs are set
        setTimeout(() => {instance.updateReport();}, 500)
      },
    }
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

  students: function () {
    let instance = Template.instance();
    return instance.state.get('students');
  },
  selectedStudent: function () {
    let instance = Template.instance();
    return instance.state.get('selectedStudent');
  },
  histogramDemoOptionSelected: function () {
    let instance = Template.instance();
    return !!(instance.state.get('selectedDemographic'))
  },

});


Template.histogramReportNew.events({
  'change .select__wrapper select': function (e, instance) {
    // instance.state.set('selectedXParameter', instance.getXAxisSelection());
    // instance.state.set('selectedYParameter', instance.getYAxisSelection());
    instance.updateReport();
  },
  'click .swappable__button': function (e, instance) {
    let $target = $(e.target);
    if (!$target.hasClass('.swappable__button')) {
      $target = $target.parents('.swappable__button');
    }
    $target.parents('.swappable').toggleClass('swapped');

    // instance.state.set('selectedXParameter', instance.getXAxisSelection());
    // instance.state.set('selectedYParameter', instance.getYAxisSelection());
    instance.updateReport();
  },
  'click .refresh-report': function (e, instance) {
    e.preventDefault();
    instance.updateGraph(true)
  }
});





