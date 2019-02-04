let convertISODateToUS = function(isoDate) {
  let date = new Date(Date.parse(isoDate));
  function pad(number) {
    if (number < 10) {
      return '0' + number;
    }
    return number;
  }
  return pad(date.getMonth() + 1) +
    '/' + pad(date.getDate()) +
    '/' + date.getFullYear();
};

export {convertISODateToUS}