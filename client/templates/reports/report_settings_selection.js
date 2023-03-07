Template.reportSettingsSelection.events({
  'change #dataset-type-select': function (e) {
    let instance = Template.instance();
    let selected = instance.$('option:selected', e.target);
    this.reportSettings.setSelectedDatasetType(selected.val());
    $(window).trigger('updated-filters') // We're also forcing a graph update when you select new observations, not just changing params
  },
})
