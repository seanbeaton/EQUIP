
export const clearGraph = function () {
  // let timeline_selector = '.interactive-report__graph';
  this.instance.$(this.graphSelector + ' svg').remove();
}


export const clearObservations = function(instance) {
  clearParameters();
  instance.state.selectedObservations.set([]);
  instance.$('.option--observation').removeClass('selected');
  clearGraph();
};

export const clearParameters = function (instance) {
  instance.state.selectedXParameter.set(false);
  instance.state.selectedYParameter.set(false);
  instance.$('.option--discourse').removeClass('selected');
  instance.$('.option--demographic').removeClass('selected');
  instance.$('.swappable').removeClass('swapped')
};
