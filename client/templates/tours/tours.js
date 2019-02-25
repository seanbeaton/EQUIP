Template.tour.rendered = function() {
  // console.log('rendering tour', this);
  let joyride = require('jquery.joyride');
  let that = this;
  setTimeout(function() {
    $('#' + that.data.tourData.id).joyride({autoStart: true})
  }, 500)
}