
export const clearGraph = function () {
  // let timeline_selector = '.interactive-report__graph';
  this.instance.$(this.graphSelector + ' svg').remove();
}


// export const clearObservations = function() {
//   resetParameters.apply(this);
//   // this.instance.state.set('selectedObservationIds', []);
//   clearGraph.apply(this);
// };

export const resetParameters = function () {
  // this.instance.state.set('selectedXParameter', false);
  // this.instance.state.set('selectedYParameter', false);
  this.instance.$('.swappable').removeClass('swapped')
};

export const xor = function (a, b) {
  return (a || b) && !(a && b);
};

export const getLabelColors = function (labels, color_function) {
  var d3 = require('d3');
  if (typeof color_function === 'undefined') {
    color_function = d3.interpolateViridis;
  }

  let spacing = 1 / labels.length;

  let label_colors = {};
  let _ = labels.map(function (label, index) {
    if (typeof label_colors[label] === 'undefined') {
      label_colors[label] = color_function(index * spacing);
    }
    else {

    }
  });
  return label_colors
}
