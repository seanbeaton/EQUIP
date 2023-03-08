
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

export const getLabelColors = function (labels, reverse_colors, colors) {
  // var d3 = require('d3');
  if (typeof colors === 'undefined') {
    colors = available_colors;
  }

  colors = JSON.parse(JSON.stringify(colors));

  if (typeof reverse_colors === 'undefined') {
    reverse_colors = false;
  }

  if (reverse_colors) {
    colors.reverse();
  }

  console.log()

  let label_colors = {};
  let _ = labels.map(function (label, index) {
    if (typeof label_colors[label] === 'undefined') {
      // console.log('index, available_colors.length - 1, (available_colors.length - 1) % index', index, colors.length - 1, index % (available_colors.length - 1))
      label_colors[label] = colors[index % (colors.length - 1)];
    }
    else {

    }
  });
  return label_colors
}

let available_colors = [
  '#77AADD', '#EE8866', '#EEDD88', '#FFAABB',
  '#99DDFF', '#44BB99', '#BBCC33', '#AAAA00',
  '#DDDDDD', '#555555', '#222255', '#225555',
  '#225522', '#666633', '#663333',
];
