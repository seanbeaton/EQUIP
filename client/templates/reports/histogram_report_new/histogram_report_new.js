import {Sidebar} from '../../../../helpers/graph_sidebar';
import {setupVis} from '../../../../helpers/timeline';
import {clearGraph, resetParameters, getLabelColors, xor} from '../../../../helpers/graphsv2';
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
        console.log('default_env_id', default_env_id)

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
    selectedDatasetType: 'contributions',
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

  this.dataTypeSelectLabel = "Select View";
  this.datasetTypes = [
    {
      id: 'demographic_groups',
      name: 'Demographic Groups',
      selected: 'selected'
    },
    {
      id: 'whole_class',
      name: 'Whole Class',
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
    console.log('getAxisSelection options, selected_value', options, selected_value);
    let selected_option = options.filter(opt => opt.label === selected_value)[0];
    if (typeof selected_option === 'undefined') {
      return false;
    }

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
      dataTypeSelectLabel: instance.dataTypeSelectLabel,
      datasetTypes: instance.datasetTypes,
      visSelectionCallback: instance.visSelectionCallback,
      visClassType: instance.visClassType,
      additionalSelects: [
        {
          label: 'Demographic',
          options: instance.getDemographics({aggregate: false}),
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
    console.log('getting disc params', instance)
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
    return this.state.get('students');
  },
  selectedStudent: function () {
    return this.state.get('selectedStudent');
  },
  histogramDemoOptionSelected: function () {
    return !!(this.state.get('selectedDemographic').get())
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





