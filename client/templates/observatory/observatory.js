/*
* JS file for observatory.js
*/
var Stopwatch = require('stopwatchjs');
var timer = new Stopwatch();
//var timerUpdate;
var lastChoices = {};

import * as observation_helpers from '/client/helpers/observations.js'

Template.observatory.created = function() {
  Session.set('envId', Router.current().params._envId);
  const obsId = Router.current().params._obsId;
  observation_helpers.createTableOfContributions(obsId);
  var labelsObj = SequenceParameters.find({'children.envId':Router.current().params._envId}).fetch();
  var parameterPairs = labelsObj[0]['children']['parameterPairs'];
  seqLabels = []
  for (i=0;i<parameterPairs;i++) {
    console.log("label " + labelsObj[0]['children']['label'+i]);
    if (!labelsObj[0]['children']['label'+i]) {
      return;
    } else {
      seqLabels[i] = labelsObj[0]['children']['label'+i].replace(/\s+/g, '').replace(/[^\w\s]|_/g, "")
    }
  }
  aTagSelectArray = []
}

// Updates Timer
function clockSet() {
  var secs = timer.value;
  var hours = Math.floor(secs / (60*60));
  if (hours < 10) {
    hours = '0' + hours;
  }
  var divisor_for_minutes = secs % (60 * 60);
  var minutes = Math.floor(divisor_for_minutes / 60);
 if (minutes < 10) {
    minutes = '0' + minutes;
  }
  var divisor_for_seconds = divisor_for_minutes % 60;
  var seconds = Math.ceil(divisor_for_seconds);
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  //$('#obs-timer').text(''+hours+':'+minutes+':'+seconds);
}

//Create Timer and Toggle Options
Template.observatory.rendered = function() {
  var obs = Observations.find({_id: Router.current().params._obsId}).fetch()[0];
  var seqParams = SequenceParameters.find({'children.envId': Router.current().params._envId}).fetch()[0];
  var timerVal = obs.timer;
  timer.value = timerVal;
  timer.start();

  //timerUpdate = setInterval(clockSet, 1000);

  var paramPairs = seqParams.children.parameterPairs;
  if (paramPairs) {
      for (var p=0; p<paramPairs;p++){
        if(seqParams['children']['toggle'+p] == "on") {
          var params = seqParams['children']['parameter'+p]
          var label = seqParams['children']['label'+p]
          createToggle(params, label);
        }
      }
  }


  var params = "Blank,Last Choices";
  var label = "Contribution Defaults";

  createToggle(params, label);

  $(document).keyup(function(e) {
     if (e.keyCode == 27) {
        $('#seq-param-modal').removeClass('is-active');
      $('#seq-data-modal').removeClass('is-active');
    }
  });
}

function createToggle(params, label) {
  if (params) {
    var choices = params.split(',');
    togglers = $('.toggle-dash');
    var wrap = $('<div/>', {class: 'column'}).appendTo(togglers);
    $("<p/>",{
      text: label,
      class: 'label',
    }).appendTo(wrap);
    $('<br/>', {}).appendTo(wrap);
    var span = $('<span/>', {class:'select'}).appendTo(wrap);

    var select = $('<select/>', {
        class:"toggle-item",
        data_label: label
      }).appendTo(span);

    for (var c in choices) {
      $('<option/>', {
        value: choices[c],
        text: choices[c]
      }).appendTo(select);
    }
  }
}

Template.observatory.helpers({
  environment: function() {
    var env = Environments.find({_id: Router.current().params._envId}).fetch()[0];
    return env;
  },
  observation: function () {
    var obs = Observations.find({_id: Router.current().params._obsId}).fetch()[0];
    return obs;
  },
  subject: function() {
    return Subjects.find({envId: this.envId});
  }
});

Template.observatory.events({
  'click .back-head-params': function(e) {
    //Save stopwatch value
    timer.stop();
    //clearInterval(timerUpdate);
    curr_time = timer.value;
    update = {obsId: Router.current().params._obsId, timer: curr_time};
    Meteor.call('timerUpdate', update);
    Router.go('observationList', {_envId:Router.current().params._envId});
  },
  'click .dragger': function(e) {
    //Create Sequence
    var myId;
    if ($(e.target).is('p')) {
      myId = $(e.target).parent().attr('id')
    } else {
      myId = $(e.target).attr('id');
    }


      observation_helpers.populateParamBoxes(myId);


  $('#seq-param-modal').addClass('is-active');

  },
  'click .help-button': function (e) {
    $('#help-env-modal').addClass("is-active");
  },
  'click #help-close-modal': function(e) {
    $('#help-env-modal').removeClass("is-active");
  },
  'click .modal-card-foot .button': function(e) {
    $('#help-env-modal').removeClass("is-active");
  },
  'click .modal-background': function(e){
    $('#seq-param-modal').removeClass('is-active');
    $('#seq-data-modal').removeClass('is-active');
    $('#help-env-modal').removeClass("is-active");
  },
  'click .modal-close': function(e){
    $('#seq-param-modal').removeClass('is-active');
    $('#seq-data-modal').removeClass('is-active');
  },
  'click .floating-log': function (e) {
    //Show editable table
    console.log(this);
    observation_helpers.createTableOfContributions(this._id);
    $('#seq-data-modal').addClass('is-active');
  },
  'click #save-seq-params': function(e) {
    var info = {};
    info['studentId'] = $('.student-modal-head').attr('data_id');
    info['Name'] = $('.student-modal-head').attr('data_name');
    envId = Router.current().params._envId;
    obsId = Router.current().params._obsId;
    var obsRaw = Observations.find({_id: obsId}).fetch()[0];
    var choices = [];
    var labels = [];
    $('.toggle-item').each(function () {
      if ($(this).attr('data_label') == "Contribution Defaults") {
        return;
      }
      labels.push($(this).attr('data_label'));
      choices.push($(this).val());
    });

    $('.subj-box-labels').each(function () {
      var chosenElement = false;
      var chosenElements = this.parentElement.querySelectorAll('.subj-box-params');
      labels.push(this.textContent);
      chosenElements.forEach(function(ele) {
        if ($(ele).hasClass('chosen')) {
            choices.push(ele.textContent);
            chosenElement = true;
        }
      })

      if (chosenElement === false) {
          choices.push(undefined);
      }
    });

    for (label in labels) {
      info[labels[label]] = choices[label];
    }

    lastChoices = info;

    var sequence = {
      envId: envId,
      time: timer.value,
      info: info,
      obsId: obsId,
      obsName: obsRaw.name
    };

    Meteor.call('sequenceInsert', sequence, function(error, result) {
     if (error) {
       alert(error.reason);
     } else {
      $('#seq-param-modal').removeClass('is-active');
     }
   });
  },
  'click .edit-seq': function(e) {
    observation_helpers.editContribution(e);
  },
  'click .delete-seq': function(e) {
    observation_helpers.deleteContribution(e);
  },
  'click #edit-seq-params': function(e) {
    seqId = $(e.target).attr('data_seq');

    var info = {};
      info['studentId'] = $('.student-modal-head').attr('data_id');
      info['Name'] = $('.student-modal-head').attr('data_name');
      envId = Router.current().params._envId;
      obsId = Router.current().params._obsId;
      var choices = [];
      var labels = [];
      $('.toggle-item').each(function () {
        if ($(this).attr('data_label') == "Contribution Defaults") {
          return;
        }
        labels.push($(this).attr('data_label'));
        choices.push($(this).val());
      });


        $('.subj-box-labels').each(function () {
          labels.push(this.textContent);
          var c = $(this).siblings('.chosen')[0];
          if (c) {
            choices.push(c.textContent);
          } else {
            choices.push(null);
          }
        });


      for (label in labels) {
        info[labels[label]] = choices[label];
      }

      var sequence = {
        info: info,
        seqId: seqId
      };

      Meteor.call('sequenceUpdate', sequence, function(error, result) {
       if (error) {
         alert(error.reason);
       } else {
        $('#seq-param-modal').removeClass('is-active');
       }
     });
    //This should happen at the end...
    $('#seq-param-modal').removeClass('is-active');
    observation_helpers.createTableOfContributions(this._id);
    $('#seq-data-modal').addClass('is-active');
  }
});
