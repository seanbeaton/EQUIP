/*
* JS file for observatory.js
*/
import {userCanGroupEditEnv, userCanGroupViewEnv, userIsEnvOwner} from "../../../helpers/groups";

var Stopwatch = require('stopwatchjs');
var lastChoices = {};

import * as observation_helpers from '/helpers/observations.js'
import {updateStudent, updateStudents} from '/helpers/students.js'
import {convertISODateToUS} from '/helpers/dates.js'
import {userHasEnvEditAccess} from "../../../helpers/environments";

const classroomMode = new ReactiveVar('code');

Template.observatory.created = function() {
}


Template.observatory.onCreated(function created() {
  this.subscribe('environment', this.data.envId);
  this.subscribe('observation', this.data.obsId);
  this.subscribe('envSubjects', this.data.envId);
  this.subscribe('obsSequences', this.data.obsId);
  this.subscribe('envSubjectParameters', this.data.envId);
  this.subscribe('envSequenceParameters', this.data.envId);

  this.data.environment = Environments.findOne(this.data.envId, {reactive: false});
  this.data.observation = Observations.findOne(this.data.obsId, {reactive: false});
  // console.log('this outside', this);
  // this.autorun(() => {
  //   console.log('this inside', this);
  // });
});

//Create Toggle Option
Template.observatory.rendered = function() {
  // var obs = this.data.observation;
  // var seqParams = SequenceParameters.find({'children.envId': Router.current().params._envId}).fetch()[0];
  //
  // var paramPairs = seqParams.children.parameterPairs;
  // if (paramPairs) {
  //     for (var p=0; p<paramPairs;p++){
  //       if(seqParams['children']['toggle'+p] == "on") {
  //         var params = seqParams['children']['parameter'+p]
  //         var label = seqParams['children']['label'+p]
  //         createToggle(params, label);
  //       }
  //     }
  // }
  //
  //
  // var params = "Blank,Last Choices";
  // var label = "Contribution Defaults";
  //
  // createToggle(params, label);

  $(document).keyup(function(e) {
     if (e.keyCode == 27) {
        $('#seq-param-modal').removeClass('is-active');
      $('#seq-data-modal').removeClass('is-active');
    }
  });
  processDatepickers();
}

// function createToggle(params, label) {
//   if (params) {
//     var choices = params.split(',');
//     togglers = $('.toggle-dash');
//     var wrap = $('<div/>', {class: 'column c--observation__toggle-container'}).appendTo(togglers);
//     $("<p/>",{
//       text: label,
//       class: 'c--observation-toggle__label o--modal-label',
//     }).appendTo(wrap);
//     var span = $('<span/>').appendTo(wrap);
//
//     var select = $('<select/>', {
//         class:"c--observation-toggle_select",
//         data_label: label
//       }).appendTo(span);
//
//     for (var c in choices) {
//       $('<option/>', {
//         value: choices[c],
//         text: choices[c]
//       }).appendTo(select);
//     }
//   }
// }

Template.observatory.helpers({
  userHasEditAccess: function() {
    return userHasEnvEditAccess(this.environment)
  },
  smallGroup: function() {
    return this.observation.observationType === 'small_group';
  },
  wholeClass: function() {
    return this.observation.observationType === 'whole_class';
  },
  environment: function() {
    return this.environment;
  },
  notes_status: function() {
    return this.observation && this.observation.notes && this.observation.notes.length > 0 ? "(notes logged)" : '(empty)'
  },
  observation: function () {
    return this.observation;
  },
  accessModeText: function () {
    if (!this.environment || userIsEnvOwner(this.environment._id)) {
      return '';
    }
    else if (userCanGroupEditEnv(Meteor.userId(), this.environment._id)) {
      return '<span class="access-level">Edit</span> access through group'
    }
    else if (userCanGroupViewEnv(Meteor.userId(), this.environment._id)) {
      return '<span class="access-level">View</span> access through group'
    }
  },
  subjects: function() {
    if (!this.observation) {
      return []
    }
    return Subjects.find({
      envId: this.observation.envId,
    })
  },
  studentActive: function(student) {
    if (this.observation.observationType === 'small_group') {
      return !!this.observation.small_group.find(id => id === student._id)
    }
    if (this.observation.observationType === 'whole_class') {
      return !this.observation.absent.find(id => id === student._id)
    }
  },
  convertISODateToUS: function(isoDate) {
    return convertISODateToUS(isoDate);
  },
  classTypeHuman: function(obsType) {
    if (obsType === 'small_group') {
      return "Small group";
    }
    else if (obsType === 'whole_class') {
      return "Whole class";
    }
    else {
      return "No type";
    }
  },
  classroomMode: function() {
    return 'observatory--' + classroomMode.get();
  },
  classroomInEditMode: function() {
    return classroomMode.get() === 'edit';
  }
});

Template.observatory.events({
  'click .back-head-params': function(e) {
    //Save stopwatch value
    Router.go('observationList', {_envId:Router.current().params._envId});
  },
  'click .observatory.observatory--code .student-box.enabled': function(e) {
    if (!userHasEnvEditAccess(this.environment)) {
      // access control also done on server side.
      return;
    }
    //Create Sequence
    gtag('event', 'add', {'event_category': 'sequences'});

    var myId;
    if ($(e.target).is('p')) {
      myId = $(e.target).parent().attr('id')
    } else {
      myId = $(e.target).attr('id');
    }

    observation_helpers.populateParamBoxes(myId);
    $('#seq-param-modal').addClass('is-active');
  },
  'click .observatory.observatory--edit .student-box': function(e) {
    if (!userHasEnvEditAccess(this.environment)) {
      // access control also done on server side.
      return;
    }
    let target_id;
    if ($(e.target).is('.student-box')) {
      target_id = $(e.target).attr('id');
    } else {
      target_id = $(e.target).parents('.student-box').attr('id')
    }
    Meteor.call('observationModifyAbsentStudent', {
      obsId: this.observation._id,
      studentId: target_id,
      action: $('#' + target_id).hasClass('enabled') ? 'mark' : 'unmark',
    });
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
  'click .edit-observation-name': function(e) {
    editObservationName(this.observation._id);
  },
  'click .edit-observation-date': function(e) {
    editObservationDate(this.observation._id);
  },
  'click #delete-observation': function(e) {
    deleteObservation(this.observation._id);
  },
  'click #randomize-selected': function(e) {
    $('.c--modal-student-options-container').each(function() {
      let param_opts = $('.subj-box-params', $(this))
      param_opts.removeClass('chosen');
      let index = Math.floor(param_opts.length * Math.random());
      param_opts[index].click()

    });
  },
  'click #save-seq-params': function(e) {
    $('#seq-param-modal').addClass('is-processing');
    let callback = function() {
      setTimeout(function() {
        $('#seq-param-modal').removeClass('is-processing');
      }, 500)
    }
    let info = {
      student: {
        studentId:$('.js-modal-header').attr('data-id'),
        studentName: $('.js-modal-header').attr('data-name'),
      },
    };

    let form_incomplete = false;

    info.parameters = {};

    // todo this should cycle through known fields, not those that are in html
    let missing_params = [];
    $('.c--modal-student-options-container').each(function() {
      let parameter_name = this.getAttribute('data-parameter-name');
      let parameter_choice = $('.chosen', $(this)).text().replace(/\n/ig, '').trim();
      if (parameter_choice.length === 0) {
        missing_params.push(parameter_name)
        form_incomplete = true;
      } else {
        info.parameters[parameter_name] = parameter_choice
      }
    });

    if (form_incomplete) {
      if (typeof callback === 'function') {
        callback()
      }
      alert(`No selection made for ${missing_params.join(', ')}`);
      return;
    }

    const obsId = Router.current().params._obsId;
    const envId = Router.current().params._envId;
    let obsRaw = Observations.findOne({_id: obsId}, {reactive: false});

    let sequence = {
      envId: envId,
      info: info,
      obsId: obsId,
      obsName: obsRaw.name
    };
    console.log('about to insert sequence');
    Meteor.call('sequenceInsert', sequence, function(error, result) {
      if (error) {
        alert(error.reason);
      } else {
        gtag('event',  'add_success', {'event_category': 'sequences'});
      }
      console.log('sequence inserted');
    });
    if (typeof callback === 'function') {
      callback()
    }
    $('#seq-param-modal').removeClass('is-active');
  },
  'click .edit-seq': function(e) {
    gtag('event', 'edit', {'event_category': 'sequences'});
    $('#seq-data-modal').removeClass('is-active');

    let seqId = $(e.target).attr('data-id');
    let subjId = $(e.target).attr('data-student-id');

    observation_helpers.editParamBoxes(seqId, subjId, this.environment._id);
    $('#seq-param-modal').addClass('is-active');


  },
  'click .delete-seq': function(e) {
    observation_helpers.deleteContribution(e, this.observation._id);
  },
  'click #show-all-observations':function (e){
    observation_helpers.createTableOfContributions(this.observation._id);
    gtag('event', 'view_sequence_list', {'event_category': 'observations'});
    $('#seq-data-modal').addClass('is-active');
  },
  'click #edit-seq-params': function(e) {

    editSequence(e);
    //This should happen at the end...
    $('#seq-param-modal').removeClass('is-active');
    observation_helpers.createTableOfContributions(this.observation._id);
    $('#seq-data-modal').addClass('is-active');
  },
  'click .edit-included-students': function() {
    if (classroomMode.get() === 'code') {
      classroomMode.set('edit');
    }
    else {
      classroomMode.set('code');
    }
  },
  'submit #obs-desc-form': function(e) {
    e.preventDefault();

    let $desc = $('.observation__description', e.target);
    Meteor.call('observationUpdateDescription', {obsId: this.observation._id, description: $desc.val()}, function(err, res) {
      if (err) {
        alert(err)
      }
      else {
        $('details', e.target).append('<span class="item-saved-message">Saved</span>')
        setTimeout(function() {
          $('.item-saved-message', e.target).remove()
        }, 2000)
      }
    })
  },
  'submit #obs-notes-form': function(e) {
    e.preventDefault();

    let $notes = $('.observation__notes', e.target);
    Meteor.call('observationUpdateNotes', {obsId: this.observation._id, notes: $notes.val()}, function(err, res) {
      if (err) {
        alert(err)
      }
      else {
        $('details', e.target).append('<span class="item-saved-message">Saved</span>')
        setTimeout(function() {
          $('.item-saved-message', e.target).remove()
        }, 2000)
      }
    })
  },
});

function editSequence(e) {

  seqId = $(e.target).attr('data-seq');

  var info = {};
  info['studentId'] = $('.js-modal-header').attr('data-id');
  info['Name'] = $('.js-modal-header').attr('data-name');
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
}

function editSeqParamBoxes(seqId) {

}

Template.registerHelper( 'math', function () {
  return {
    mul ( a, b ) { return a * b; },
    div ( a, b ) { return b ? a / b : 0; },
    sum ( a, b ) { return a + b; },
    sub ( a, b ) { return a - b; },
  }
});


function editObservationName(obsId) {
  let context = $('.observation[data-obs-id="' + obsId + '"]');

  var obs_name = $('.observation-name', context);
  var obs_name_wrapper = $('.observation-name-wrapper', context);
  var save_button = $('.save-observation-name', context);

  save_button.addClass('is-loading');

  if (obs_name.hasClass('editing')) {
    $('.edit-obs-name', context).remove();
    save_button.hide();
    obs_name.removeClass('editing');
    obs_name.show();
  }

  save_button
    .filter(':not(.save-observation-name--processed)')
    .addClass('save-observation-name--processed')
    .on('click', function() {
    var new_obs_name = $('.edit-obs-name', context);
    var new_name = new_obs_name.val();

    var args = {
      'obsId': obsId,
      'obsName': new_name,
    };

    Meteor.call('observationRename', args, function(error, result) {
      var message;
      if (result) {
        message = $('<span/>', {
          class: 'name-save-result tag is-success inline-block success-message',
          text: 'Saved'
        });
        obs_name.html(new_name);
        gtag('event',  'rename', {'event_category': 'observations'});
      }
      else {
        message = $('<span/>', {
          class: 'name-save-result tag is-warning inline-block error-message',
          text: 'Failed to save. Try again later'
        })
      }
      obs_name_wrapper.append(message);

      setTimeout(function() {
        message.remove();
      }, 3000);

      return 0;
    });

    save_button.hide();
    new_obs_name.remove();
    obs_name.removeClass('editing');
    obs_name.show();
  })

  obs_name_wrapper.prepend($('<input>', {
    class: 'edit-obs-name inherit-font-size',
    value: obs_name.html()
  }));

  obs_name.addClass('editing');
  obs_name.hide();
  save_button.show();

  $('.edit-obs-name:not(.edit-obs-name--processed)', context).addClass('edit-obs-name--processed').on('keyup', function(e) {
    if (e.keyCode === 13) {
      save_button.click()
    }
  })

  save_button.removeClass('is-loading');
}

function editObservationDate(obsId) {
  let context = $('.observation[data-obs-id="' + obsId + '"]');

  var obs_date = $('.observation-date--iso', context);
  var obs_date_display = $('.observation-date--display', context);
  var obs_wrapper = $('.observation-date-wrapper', context);
  var save_button = $('.save-observation-date', context);

  if (obs_date.hasClass('editing')) {
    $('.edit-obs-date', context).remove();
    $('.edit-obs-date--iso', context).remove();
    save_button.hide();
    obs_date.removeClass('editing');
    obs_date_display.show();
  }

  save_button.addClass('is-loading');

  save_button
    .filter(':not(.save-observation-date--processed)')
    .addClass('save-observation-date--processed')
    .on('click', function() {
    var new_obs_date_iso = $('.edit-obs-date--iso', context);
    var new_obs_date = $('.edit-obs-date', context);
    var new_date = new_obs_date_iso.val();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(new_date)) {
      alert('Please input a valid date');
      return;
    }

    var args = {
      'obsId': obsId,
      'observationDate': new_date,
    };

    Meteor.call('observationUpdateDate', args, function(error, result) {
      var message;
      if (error) {
        alert('error on date update, error')
      }
      if (result) {
        message = $('<span/>', {
          class: 'name-save-result tag is-success inline-block success-message',
          text: 'Saved'
        });
        obs_date.html(new_date);
        gtag('event', 'updateDate', {'event_category': 'observations'});
      }
      else {
        message = $('<span/>', {
          class: 'name-save-result tag is-warning inline-block error-message',
          text: 'Failed to save. Try again later'
        })
      }
      obs_wrapper.append(message);

      setTimeout(function() {
        message.remove();
      }, 3000);

      return 0;
    });

    save_button.hide();
    new_obs_date_iso.remove();
    new_obs_date.remove();
    obs_date.removeClass('editing');
    obs_date_display.show();
  })

  obs_wrapper.prepend($('<input>', {
    class: 'edit-obs-date datepicker inherit-font-size',
    value: obs_date_display.html()
  }));
  obs_wrapper.prepend($('<input>', {
    class: 'edit-obs-date--iso',
    id: 'altObservationDate',
    type: 'hidden',
    value: obs_date.html()
  }));
  processDatepickers();

  obs_date.addClass('editing');
  obs_date_display.hide();
  save_button.show();

  $('.edit-obs-date:not(.edit-obs-date--processed)', context).addClass('edit-obs-date--processed').on('keyup', function(e) {
    if (e.keyCode === 13) {
      save_button.click()
    }
  })

  save_button.removeClass('is-loading');
}

function deleteObservation(obsId) {
  var result = confirm("Are you sure you want to delete this observation?");
  if (result) {
    Meteor.call('observationDelete', obsId, function(error, result) {
      if (!error) {
        gtag('event', 'delete', {'event_category': 'observations'});
        Router.go('environmentList');
      }
    })
  }
}

function processDatepickers() {
  $('.datepicker:not(.datepicker--processed)').addClass('datepicker--processed').datepicker({
    dateFormat: 'mm/dd/yy',
    altField: '#altObservationDate',
    altFormat: 'yy-mm-dd'
  })
}