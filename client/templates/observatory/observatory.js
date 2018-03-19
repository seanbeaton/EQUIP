/*
* JS file for observatory.js
*/
var Stopwatch = require('stopwatchjs');
var timer = new Stopwatch();
//var timerUpdate;
var lastChoices = {};

Template.observatory.created = function() {
  Session.set('envId', Router.current().params._envId);
  // createTableOfContributions()
  var labelsObj = SequenceParameters.find({'children.envId':Router.current().params._envId}).fetch();
  var parameterPairs = labelsObj[0]['children']['parameterPairs'];
  seqLabels = []
  for (i=0;i<parameterPairs;i++) {
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
    var wrap = $('<div/>', {class: 'column c--observation__toggle-container'}).appendTo(togglers);
    $("<p/>",{
      text: label,
      class: 'c--observation-toggle__label o--modal-label',
    }).appendTo(wrap);
    var span = $('<span/>').appendTo(wrap);

    var select = $('<select/>', {
        class:"c--observation-toggle_select",
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
  'click #save-seq-params': function(e) {
    var info = {};
    info['studentId'] = $('.js-modal-header').attr('data_id');
    info['Name'] = $('.js-modal-header').attr('data_name');
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

    $('.js-subject-labels').each(function () {
      var chosenElement = false;
      var chosenElements = this.nextElementSibling.querySelectorAll('.subj-box-params');

      labels.push(this.textContent);
      chosenElements.forEach(function(ele) {
        if ($(ele).hasClass('chosen')) {
            choices.push(ele.textContent.replace(/\n/ig, '').trim());
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
  'click #show-all-observations':function (e){
    createTableOfContributions();
    $('#seq-data-modal').addClass('is-active');
  },
  'click #edit-seq-params': function(e) {
    seqId = $(e.target).attr('data_seq');

    var info = {};
      info['studentId'] = $('.js-modal-header').attr('data_id');
      info['Name'] = $('.js-modal-header').attr('data_name');
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


    $('.js-subject-labels').each(function () {
      var chosenElement = false;
      var chosenElements = this.nextElementSibling.querySelectorAll('.subj-box-params');
      labels.push(this.textContent);
      chosenElements.forEach(function(ele) {
        if ($(ele).hasClass('chosen')) {
            choices.push(ele.textContent.replace(/\n/ig, '').trim());
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
    var seqParams = SequenceParameters.find({'children.envId':envId}).fetch()[0];
    var parameterPairs = seqParams["children"]["parameterPairs"];

    allParams = [];
    for (p = 0; p<parameterPairs; p++) {
        allParams.push(seqParams['children']['label'+p]);
    }

    var modal = document.getElementById("data-modal-content");
    modal.innerHTML += contributionTableTemplate(seqs, allParams);
}

function contributionTableTemplate(sequences, parameters) {
    var params = parameters;
    var contributionRows = sequences.map((sequence) => {
        return contributionRowTemplate(sequence, params)
    }).join("");

    return `
        <div class="c--modal-header-container">
            <h3 class="c--modal-header-title">Contribution Log</h3>
        </div>
        ${contributionRows}
    `
}

function contributionRowTemplate(seqItem, params) {
    let paramTemplate = params.map((param) => {
        return `
            <p class="o--modal-label contributions-grid-item">${param}</p>
        `
    }).join("");

    let paramValues = params.map((param) => {
        let data = seqItem.info[param] ? seqItem.info[param] : "n/a"
        return `
            <p class="o--modal-label contributions-grid-item">${data}</p>
        `
    }).join("");

    let time = `<p class="o--modal-label contributions-grid-item">${convertTime(Number(seqItem.time))}</p>`
    return `
        <div class="contributions-grid-container">
            <h3 class="contributions-modal-header">${seqItem.info.Name}</h3>
            <p class="o--toggle-links contributions-modal-link edit-seq" data_id="${seqItem._id}" data_studentid="${seqItem.info.studentId}">Edit</p>
            <p class="o--toggle-links contributions-modal-link delete-seq" data_id="${seqItem._id}" >Delete</p>
        </div>
        <div class="contributions-grid-item-container u--bold">
            <p class="o--modal-label contributions-grid-item">Time</p>
            ${paramTemplate}
        </div>
        <div class="contributions-grid-item-container">
            ${time}
            ${paramValues}
        </div>
    `
}

// Saves a new observation
function populateParamBoxes(subjId) {
    $('#param-modal-content').children().remove();
    var envId = Router.current().params._envId;
    var seqParams = SequenceParameters.find({'children.envId':envId}).fetch()[0];
    var parameterPairs = seqParams["children"]["parameterPairs"];
    var subj = Subjects.find({_id: subjId}).fetch()[0];
    var studentName = subj.info.name;
    var modal = document.getElementById("param-modal-content");
    var howDefault = $("*[data_label='Contribution Defaults']").val();

    modal.innerHTML += contributionHeaderTemplate("Enter a contribution for " + studentName, studentName, subjId);
    modal.innerHTML += contributionParameterTemplate(seqParams, parameterPairs, null, "Save Contribution", null);
    attachOptionSelection()
}

// Edits an observation
function editParamBoxes(seqId, subjId) {
    $('#param-modal-content').children().remove();
    var envId = Router.current().params._envId;
    var seqParams = SequenceParameters.find({'children.envId':envId}).fetch()[0];
    var seq = Sequences.find({_id: seqId}).fetch()[0]
    var subj = Subjects.find({_id: subjId}).fetch()[0];
    var parameterPairs = seqParams["children"]["parameterPairs"];
    var studentName = subj.info.name;
    var modal = document.getElementById("param-modal-content");
    var howDefault = $("*[data_label='Contribution Defaults']").val();

    modal.innerHTML += contributionHeaderTemplate("Edit contribution for " + studentName, studentName, subjId);
    modal.innerHTML += contributionParameterTemplate(seqParams, parameterPairs, seq, "Edit Contribution", seqId);
    attachOptionSelection()
}

function contributionHeaderTemplate(type, studentName, subjId) {
    return `
        <div class="c--modal-header-container js-modal-header" data_id="${subjId}" data_name="${studentName}">
            <h3 class="c--modal-header-title">${type}</h3>
        </div>
    `
}

function contributionParameterTemplate(sequences, paramPairs, seq, type, id) {
    let saveBtn = type === "Save Contribution" ? "save-seq-params" : "edit-seq-params";
    let counter = Array(paramPairs).fill().map((e,i) => i);
    let boxes = counter.map((param) => {
        let params = sequences['children']['parameter' + param];
        let options = params.split(',');
        let field = sequences['children']['label' + param];
        let optionNodes = options.map((opt) => {
            let selected = "";
            if (field && seq) { selected = seq['info'][field] === opt.trim() ? "chosen" : "" }
            return `
                <div class="column has-text-centered subj-box-params ${selected} optionSelection">
                    ${opt}
                </div>
            `
        }).join("");
        return `
            <div class="c--modal-student-header js-subject-labels">${sequences['children']['label'+param]}</div>
            <div class="c--modal-student-options-container">
                ${optionNodes}
            </div>
        `
    }).join("");

    return `
        <div class="boxes-wrapper">
            ${boxes}
        </div>
        <div class="button-container">
            <button class="o--standard-button u--margin-zero-auto" data_seq="${id}" id="${saveBtn}">
                ${type}
            </button>
        </div>
    `
}

function attachOptionSelection() {
    var allNodes = document.querySelectorAll(".optionSelection");
    [...allNodes].forEach((node) => { node.addEventListener("click", handleOptionSelect); });
}

var handleOptionSelect = function() {
    $(this).siblings().removeClass('chosen');
    if ( $(this).hasClass('chosen') ){
      $(this).removeClass('chosen');
    } else {
      $(this).addClass('chosen');
    }
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
