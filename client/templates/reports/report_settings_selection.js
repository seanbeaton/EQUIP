Template.reportSettingsSelection.events({
  // 'change #dataset-type-select': function (e) {
  //   let instance = Template.instance();
  //   let selected = instance.$('option:selected', e.target);
  //   this.reportSettings.setSelectedDatasetType(selected.val());
  //   $(window).trigger('updated-filters') // We're also forcing a graph update when you select new observations, not just changing params
  // },
})

Template.reportSettingsSelection.onCreated(function created() {

})

Template.reportSettingsSelection.helpers({
  envSelectParams: function() {
    return {
      setSelectedEnvironment: this.reportSettings.setSelectedEnvironment,
      selectedEnvironment: this.reportSettings.selectedEnvironment,
      environments: this.reportSettings.environments,
      environmentSelectCallback: this.reportSettings.environmentSelectCallback
    }
  },
  dataTypeSelectParams: function() {
    return {
      setSelectedDatasetType: this.reportSettings.setSelectedDatasetType,
      selectedDatasetType: this.reportSettings.selectedDatasetType,
      datasetTypes: this.reportSettings.datasetTypes,
      datasetSelectCallback: this.reportSettings.datasetSelectCallback
    }
  },
  visSetupParams: function() {
    return {
      getObsOptions: this.reportSettings.getObsOptions,
      reportState: this.reportSettings.reportState,
      selectedEnvironment: this.reportSettings.selectedEnvironment,
      visSelectionCallback: this.reportSettings.visSelectionCallback,
      visClassType: this.reportSettings.visClassType,
      selectedObservationIds: this.reportSettings.selectedObservationIds,
      setSelectedObservationIds: this.reportSettings.setSelectedObservationIds,
    }
  }

})

Template.additionalSelect.onCreated(function created() {
  console.log('this', this)
})

Template.additionalSelect.helpers({
  cssClass: function () {
    let instance = Template.instance();
    console.log('instance', instance);
    return 'additional-select additional-select--' + instance.data.label.replaceAll(/[^a-zA-Z]/g, '-').toLowerCase()
  },
  cssId: function () {
    let instance = Template.instance();
    return 'additional-select--' + instance.data.label.replaceAll(/[^a-zA-Z]/g, '-').toLowerCase()
  },
  addSelected: function(opts) {
    let instance = Template.instance();
    console.log('options', opts)
    // envs.forEach(e => e.selected = (e._id === instance.data.selector.selectedEnvironment ? 'selected' : ''));
    return opts;
  }
})


Template.additionalSelect.onCreated(function() {
  console.log('this is the additional select')
  this.$('select')[0].selectedIndex = 0;
  this.data.setterCallback(this.$('select').val())
})

Template.additionalSelect.events({
  'change .additional-select': function(e, instance) {
    instance.data.setterCallback(instance.$(e.target).val())
  }
})


