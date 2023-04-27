
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
  console.log('invert color', hex, bw)
  if (hex.indexOf('#') === 0) {
    hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    throw new Error('Invalid HEX color.');
  }
  var r = parseInt(hex.slice(0, 2), 16),
    g = parseInt(hex.slice(2, 4), 16),
    b = parseInt(hex.slice(4, 6), 16);
  if (bw) {
    // https://stackoverflow.com/a/3943023/112731
    return (r * 0.299 + g * 0.587 + b * 0.114) > 186
      ? '#000000'
      : '#FFFFFF';
  }
  // invert color components
  r = (255 - r).toString(16);
  g = (255 - g).toString(16);
  b = (255 - b).toString(16);
  // pad each with zeros and return
  return "#" + padZero(r) + padZero(g) + padZero(b);
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
