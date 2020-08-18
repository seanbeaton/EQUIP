function htmlClass(str) {
  return str.toLowerCase().replace(/[^-_a-z0-9]/gi, '-');
}


export {htmlClass}
