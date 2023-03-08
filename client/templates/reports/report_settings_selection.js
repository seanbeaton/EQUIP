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
