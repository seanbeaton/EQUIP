
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


export const invertColor = function(hex, bw) {
  let color = (hex.charAt(0) === '#') ? hex.substring(1, 7) : hex;
  let r = parseInt(color.substring(0, 2), 16); // hexToR
  let g = parseInt(color.substring(2, 4), 16); // hexToG
  let b = parseInt(color.substring(4, 6), 16); // hexToB
  let uicolors = [r / 255, g / 255, b / 255];
  let c = uicolors.map((col) => {
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  let L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
  return (L > 0.179) ? '#000' : '#fff';
}

export const padZero = function(str, len) {
  len = len || 2;
  let zeros = new Array(len).join('0');
  return (zeros + str).slice(-len);
}


let available_colors = [
  '#77AADD', '#EE8866', '#EEDD88', '#FFAABB',
  '#99DDFF', '#44BB99', '#BBCC33', '#AAAA00',
  '#DDDDDD', '#555555', '#222255', '#225555',
  '#225522', '#666633', '#663333',
];
