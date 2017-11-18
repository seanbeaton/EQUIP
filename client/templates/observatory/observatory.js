/*
* JS file for observatory.js
*/
var Stopwatch = require('stopwatchjs');
var timer = new Stopwatch();
//var timerUpdate;
var lastChoices = {};

Template.observatory.created = function() {
  Session.set('envId', Router.current().params._envId);

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
  var label = "Contribution Defaults"
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


      populateParamBoxes(myId);


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
    createTableOfContributions();
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
      labels.push(this.textContent);
    });

    $('.chosen').each(function () {
      choices.push(this.textContent);
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

  'click .delete-seq': function(e) {
    var result = confirm("Press 'OK' to delete this Contribution.");
    if (result == false) {
      return;
    }
      seqId = $(e.target).attr("data_id");
      Meteor.call('sequenceDelete', seqId, function(error, result) {
        return 0;
      });
      createTableOfContributions();

  },
  'click .edit-seq': function(e) {
    seqId = $(e.target).attr('data_id');
    myId = $(e.target).attr('data_studentId');


      editParamBoxes(seqId, myId);

    $('#seq-data-modal').removeClass('is-active');
    $('#seq-param-modal').addClass('is-active');


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
    createTableOfContributions();
    $('#seq-data-modal').addClass('is-active');
  }
});

function createTableOfContributions() {
  $('#data-modal-content').children().remove();
  var envId = Router.current().params._envId
  var seqs = Sequences.find({obsId:Router.current().params._obsId}).fetch();
  seqParams = SequenceParameters.find({'children.envId':envId}).fetch()[0];
  parameterPairs = seqParams["children"]["parameterPairs"];

  allParams = ['Edit','Name', 'Time'];
  for (p = 0; p<parameterPairs; p++) {
    allParams.push(seqParams['children']['label'+p]);
  }
  allParams.push("Delete");

  var modal = $('#data-modal-content');

  var table = $('<table/>', {
    class: "table is-striped"
  }).appendTo(modal);
  // Create heading
  $('<thead/>', {}).appendTo(modal);
  var heading = $('<tr/>', {}).appendTo(table);

  for (pa in allParams) {
    $('<th/>', {
      text: allParams[pa]
    }).appendTo(heading);
  }
  var body = $('<tbody/>', {}).appendTo(table);
  //loop over each student
  for (s in seqs) {
    var row = $('<tr/>', {}).appendTo(table);
    //loop over each parameter
    for (p in allParams) {
      if (allParams[p] == "Delete") {
        //Add delete button
        var td = $('<td/>', {}).appendTo(row);
        var bye = $('<i/>', {
          class: "fa fa-times delete-seq",
          data_id: seqs[s]['_id']
        }).appendTo(td);
      } else if (allParams[p] == "Time") {
        attr = seqs[s]['time']
        $('<td/>', {
          text: convertTime(Number(attr))
        }).appendTo(row);
      }else if (allParams[p] == "Edit") {
        var td = $('<td/>', {}).appendTo(row);
        var bye = $('<i/>', {
          class: "fa fa-pencil-square-o edit-seq",
          data_id: seqs[s]['_id'],
          data_studentId: seqs[s]['info']['studentId']
        }).appendTo(td);
      }else {
        attr = seqs[s]['info'][allParams[p]]
        $('<td/>', {
          text: attr
        }).appendTo(row);
      }
    }
  }
}

function populateParamBoxes(subjId) {
  $('#param-modal-content').children().remove();
  var envId = Router.current().params._envId
  seqParams = SequenceParameters.find({'children.envId':envId}).fetch()[0];
  parameterPairs = seqParams["children"]["parameterPairs"];
  var subj = Subjects.find({_id: subjId}).fetch()[0];
  var student = subj.info.name;

  var howDefault = $("*[data_label='Contribution Defaults']").val();

  var modal = $('#param-modal-content');

  var name = $("<div/>", {
      class: "columns  boxes-wrapper"
    }).appendTo(modal);

    var label = $("<h1/>", {
      class: "column is-12 has-text-centered title is-3 student-modal-head",
      text: "Enter Contribution for "+student,
      data_id: subjId,
      data_name: student
    }).appendTo(name);

  //
  //BOX CREATION FOR MODAL
  //
  //go through each parameter pair and create a box
  for (var param = 0; param<parameterPairs; param++) {
    if(seqParams['children']['toggle'+param] == "on"){
      continue;
    }
    var wrap = $("<div/>", {
      class: "columns  boxes-wrapper"
    }).appendTo(modal);

    var label = $("<div/>", {
      class: "column is-2 has-text-centered subj-box-labels",
      text: seqParams['children']['label'+param]
    }).appendTo(wrap);

    var field = seqParams['children']['label'+param];

    var params = seqParams['children']['parameter'+param];
    if (params) {
        var options = params.split(',');
        for (opt in options) {

          if ( lastChoices[field] == options[opt] & howDefault == "Last Choices") {
            var option = $("<div/>", {
              class: "column has-text-centered subj-box-params chosen hoverable",
              text: options[opt]
            }).appendTo(wrap);
            } else {

              var option = $("<div/>", {
                class: "column has-text-centered subj-box-params hoverable",
                text: options[opt]
              }).appendTo(wrap);
            }

            option.click(function (e) {
              e.preventDefault();
              $(this).siblings().removeClass('chosen');
              if ( $(this).hasClass('chosen') ){
                $(this).removeClass('chosen');
              } else {
                $(this).addClass('chosen');
              }
            });
        }//end for
    }
  }//end for

  $("<button/>", {
    class: "button is-medium is-success",
    id: "save-seq-params",
    text: "Save Contribution"
  }).appendTo(modal);

}

function convertTime(secs) {
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
  final_str = ''+hours+':'+minutes+':'+seconds;
  return final_str;
}

function editParamBoxes(seqId, subjId) {
  var seq = Sequences.find({_id: seqId}).fetch()[0]
  $('#param-modal-content').children().remove();
  var envId = Router.current().params._envId
  seqParams = SequenceParameters.find({'children.envId':envId}).fetch()[0];
  parameterPairs = seqParams["children"]["parameterPairs"];
  var subj = Subjects.find({_id: subjId}).fetch()[0];
  var student = subj.info.name;

  var modal = $('#param-modal-content');

  var name = $("<div/>", {
      class: "columns  boxes-wrapper"
    }).appendTo(modal);

    var label = $("<h1/>", {
      class: "column is-12 has-text-centered title is-3 student-modal-head",
      text: "Editing Contribution for "+student,
      data_id: subjId,
      data_name: student
    }).appendTo(name);

  //
  //BOX CREATION FOR MODAL
  //
  //go through each parameter pair and create a box
  for (var param = 0; param<parameterPairs; param++) {
    if(seqParams['children']['toggle'+param] == "on"){
      continue;
    }
    var wrap = $("<div/>", {
      class: "columns  boxes-wrapper"
    }).appendTo(modal);

    var label = $("<div/>", {
      class: "column is-2 has-text-centered subj-box-labels",
      text: seqParams['children']['label'+param]
    }).appendTo(wrap);

    var field = seqParams['children']['label'+param];

    var params = seqParams['children']['parameter'+param];

    if (params) {
      var options = params.split(',');

      for (opt in options) {

          if (seq['info'][field] == options[opt]) {
            var option = $("<div/>", {
            class: "column has-text-centered subj-box-params chosen hoverable",
            text: options[opt]
          }).appendTo(wrap);
          } else {

            var option = $("<div/>", {
              class: "column has-text-centered subj-box-params hoverable",
              text: options[opt]
            }).appendTo(wrap);
          }
          option.click(function (e) {
            e.preventDefault();
            $(this).siblings().removeClass('chosen');
            if ( $(this).hasClass('chosen') ){
              $(this).removeClass('chosen');
            } else {
              $(this).addClass('chosen');
            }
          });
      }//end for
    }
  }//end for

  $("<button/>", {
    class: "button is-medium is-success",
    id: "edit-seq-params",
    data_seq: seqId,
    text: "Save Revised Contribution"
  }).appendTo(modal);

}
