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
      environments: this.reportSettings.environments,
      environmentSelectCallback: this.reportSettings.environmentSelectCallback
    }
  },
  dataTypeSelectParams: function() {
    return {
      setSelectedDatasetType: this.reportSettings.setSelectedDatasetType,
      datasetTypes: this.reportSettings.datasetTypes,
      datasetSelectCallback: this.reportSettings.datasetSelectCallback
    }
  },
  visSetupParams: function() {
    return {
      obsOptions: this.reportSettings.obsOptions,
      visSelectionCallback: this.reportSettings.visSelectionCallback,
      visClassType: this.reportSettings.visClassType,
      selectedObservationIds: this.reportSettings.selectedObservationIds,
      setSelectedObservationIds: this.reportSettings.setSelectedObservationIds,
    }
  }

})
