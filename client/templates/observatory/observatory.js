/*
* JS file for observatory.js
*/
import {userCanGroupEditEnv, userCanGroupViewEnv, userIsEnvOwner} from "../../../helpers/groups";
import Fuse from 'fuse.js'
import * as observation_helpers from '/helpers/observations.js'
import {convertISODateToUS} from '/helpers/dates.js'
import {userHasEnvEditAccess} from "../../../helpers/environments";
import {console_log_conditional} from "/helpers/logging"

var Stopwatch = require('stopwatchjs');
var lastChoices = {};

const classroomMode = new ReactiveVar('code');
const classroomStudentsSearchable = new ReactiveVar([]);
const currentSearch = new ReactiveVar('');
const currentStudentId = new ReactiveVar('');
const activeEditSequence = new ReactiveVar('');
const environment = new ReactiveVar();
const observation = new ReactiveVar();

Template.observatory.created = function () {
}

Template.observatory.onCreated(function created() {
  this.autorun(() => {
    this.data.environment = Environments.findOne(this.data.envId, {reactive: true});
    environment.set(this.data.environment);

    this.data.observation = Observations.findOne(this.data.obsId, {reactive: true});
    observation.set(this.data.observation);

    this.data.sequenceParameters = SequenceParameters.findOne({envId: this.data.envId}).parameters;
    let that = this;
    let subjects = Subjects.find({
      envId: that.data.observation.envId,
    });
    classroomStudentsSearchable.set(subjects.map(function (s) {
      return {'name': s.info.name.toLowerCase(), 'active': true, _id: s._id}
    }));
  })
  processKeyboardObservationNavigation(this.data.observation);
});

Template.observatory.onRendered(function () {
  $(document).keyup(function (e) {
    if (e.keyCode == 27) {
      $('#seq-param-modal').removeClass('is-active');
      $('#seq-data-modal').removeClass('is-active');
    }
  });

  processDatepickers();
})

let processKeyboardObservationNavigation = function (obs) {
  let searchTimeout;
  const fuse_options = {
    shouldSort: true,
    threshold: 0.2,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
      "name",
    ]
  };
  let fuse = new Fuse(classroomStudentsSearchable.get(), fuse_options);
  let has_scrolled_to_view = false;

  // name search
  $(document).keydown(function (e) {
    if (['select', 'option', 'optionset', 'textarea', 'input', 'button'].indexOf(e.target.localName) !== -1) {
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }
    // don't catch non-alphanum, for this.
    if (!e.key.toLowerCase().match(/^[a-z0-9]$|^backspace$/)) {
      return;
    }
    // if (e.key === 'Tab') {
    //   // handle tab
    //   return;
    // }
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(function () {
      currentSearch.set('')
    }, 2000);
    if (e.key === "Backspace") {
      let s = currentSearch.get();
      currentSearch.set(s.substring(0, s.length - 1))
    }
    else {
      currentSearch.set(currentSearch.get() + e.key.toLowerCase())
    }

    let results = fuse.search(currentSearch.get());

    classroomStudentsSearchable.set(classroomStudentsSearchable.get().map(function (s) {
      s.active = results.findIndex(r => r.name === s.name) !== -1;
      if (s.active && obs.observationType === 'small_group' && !obs.small_group.find(id => id === s._id)) {
        s.active = false;
        results.splice(results.findIndex(r => r._id === s._id), 1)
      }
      if (s.active && obs.observationType === 'whole_class' && !!obs.absent.find(id => id === s._id)) {
        s.active = false;
        results.splice(results.findIndex(r => r._id === s._id), 1)
      }
      return s
    }))

    if (!has_scrolled_to_view) {
      window.scrollTo(0, $('.observatory--code').position().top - 50);
      has_scrolled_to_view = true;
    }
    if (results.length > 0) {
      $('#' + results[0]._id).focus()
    }
  });
}

// let getStudentMatches = function(needle) {
// let studentsSearch = classroomStudentsSearchable.get()
//
// }

// let is_alphanumeric = function(str) {
//   let code, i, len;
//
//   for (i = 0, len = str.length; i < len; i++) {
//     let code = str.charCodeAt(i);
//     if (!(code > 47 && code < 58) && // numeric (0-9)
//       !(code > 64 && code < 91) && // upper alpha (A-Z)
//       !(code > 96 && code < 123)) { // lower alpha (a-z)
//       return false;
//     }
//   }
//   return true;
// };

Template.observatory.helpers({
  userHasEditAccess: function () {
    console_log_conditional('environment.get()', environment.get());
    return userHasEnvEditAccess(environment.get());
  },
  smallGroup: function () {
    return observation.get().observationType === 'small_group';
  },
  wholeClass: function () {
    return observation.get().observationType === 'whole_class';
  },
  environment: function () {
    return environment.get();
  },
  notes_status: function () {
    return observation.get() && observation.get().notes && observation.get().notes.length > 0 ? "(notes logged)" : '(empty)'
  },
  observation: function () {
    return observation.get();
  },
  accessModeText: function () {
    if (!environment.get() || userIsEnvOwner(environment.get()._id)) {
      return '';
    }
    else if (userCanGroupEditEnv(Meteor.userId(), environment.get()._id)) {
      return '<span class="access-level">Edit</span> access through group'
    }
    else if (userCanGroupViewEnv(Meteor.userId(), environment.get()._id)) {
      return '<span class="access-level">View</span> access through group'
    }
  },
  currentSearch: function () {
    return currentSearch.get();
  },
  currentSearchExists: function () {
    return currentSearch.get() !== '';
  },
  allowTabbing: function (student) {
    // console_log_conditional('at', student, this.observation);
    if (observation.get().observationType === 'small_group' && !observation.get().small_group.find(id => id === student._id)) {
      return false;
    }
    if (observation.get().observationType === 'whole_class' && !!observation.get().absent.find(id => id === student._id)) {
      return false;
    }
    if (currentSearch.get() === '') {
      return true;
    }
    return classroomStudentsSearchable.get().find(s => s.name === student.info.name.toLowerCase()).active
  },
  subjects: function () {
    if (!observation.get()) {
      return []
    }
    return Subjects.find({
      envId: observation.get().envId,
    }, {sort: {data_y: 1, data_x: 1}})
  },
  studentActive: function (student) {
    if (observation.get().observationType === 'small_group') {
      return !!observation.get().small_group.find(id => id === student._id)
    }
    if (observation.get().observationType === 'whole_class') {
      return !observation.get().absent.find(id => id === student._id)
    }
  },
  searchEnabled: function (student) {
    let result = classroomStudentsSearchable.get().find(s => s.name === student.info.name.toLowerCase());
    return result && result.active;
  },
  convertISODateToUS: function (isoDate) {
    return convertISODateToUS(isoDate);
  },
  classTypeHuman: function (obsType) {
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
  classroomMode: function () {
    return 'observatory--' + classroomMode.get();
  },
  classroomInEditMode: function () {
    return classroomMode.get() === 'edit';
  }
});

Template.observatory.events({
  'click .back-head-params': function (e) {
    //Save stopwatch value
    Router.go('observationList', {_envId: Router.current().params._envId});
  },
  'click .observatory.observatory--code .student-box.enabled': function (e) {
    if (!userHasEnvEditAccess(environment.get())) {
      // access control also done on server side.
      return;
    }
    //Create Sequence
    gtag('event', 'add', {'event_category': 'sequences'});

    var myId;
    if ($(e.target).is('p')) {
      myId = $(e.target).parent().attr('id')
    }
    else {
      myId = $(e.target).attr('id');
    }
    currentStudentId.set(myId);
    observation_helpers.populateParamBoxes(myId);
    $('#seq-param-modal').addClass('is-active');
  },
  'keydown .observatory.observatory--code .student-box.enabled': function (e) {
    if (!userHasEnvEditAccess(environment.get())) {
      // access control also done on server side.
      return;
    }

    if (e.key === 'Enter') {
      //Create Sequence
      gtag('event', 'add', {'event_category': 'sequences'});

      let myId;
      if ($(e.target).is('p')) {
        myId = $(e.target).parent().attr('id')
      }
      else {
        myId = $(e.target).attr('id');
      }

      currentStudentId.set(myId);
      observation_helpers.populateParamBoxes(myId);
      $('#seq-param-modal').addClass('is-active');
    }
    if (e.key.startsWith('Arrow')) {
      console_log_conditional('e.key', e.key)
      let tar = null;
      let allowed_student_ids = getAllowedStudentIds(environment.get()._id, observation.get());
      console_log_conditional('allowed_student_ids', allowed_student_ids);
      if (e.key === 'ArrowDown') {
        tar = Subjects.findOne({
          envId: environment.get()._id,
          _id: {$in: allowed_student_ids},
          data_x: parseInt($(e.target).attr('data-x')),
          data_y: {$gt: parseInt($(e.target).attr('data-y'))}
        }, {sort: {data_y: 1}})
        if (!tar) {
          tar = Subjects.findOne({
            envId: environment.get()._id,
            _id: {$in: allowed_student_ids},
            data_x: parseInt($(e.target).attr('data-x')),
          }, {sort: {data_y: 1}})
        }
      }
      else if (e.key === 'ArrowUp') {
        tar = Subjects.findOne({
          envId: environment.get()._id,
          _id: {$in: allowed_student_ids},
          data_x: parseInt($(e.target).attr('data-x')),
          data_y: {$lt: parseInt($(e.target).attr('data-y'))}
        }, {sort: {data_y: -1}})
        if (!tar) {
          tar = Subjects.findOne({
            envId: environment.get()._id,
            _id: {$in: allowed_student_ids},
            data_x: parseInt($(e.target).attr('data-x')),
          }, {sort: {data_y: -1}})
        }
      }
      else if (e.key === 'ArrowRight') {
        tar = Subjects.findOne({
          envId: environment.get()._id,
          _id: {$in: allowed_student_ids},
          data_x: {$gt: parseInt($(e.target).attr('data-x'))},
          data_y: parseInt($(e.target).attr('data-y')),
        }, {sort: {data_x: 1}})
        if (!tar) {
          tar = Subjects.findOne({
            envId: environment.get()._id,
            _id: {$in: allowed_student_ids},
            data_y: parseInt($(e.target).attr('data-y')),
          }, {sort: {data_x: 1}})
        }
      }
      else if (e.key === 'ArrowLeft') {
        tar = Subjects.findOne({
          envId: environment.get()._id,
          _id: {$in: allowed_student_ids},
          data_x: {$lt: parseInt($(e.target).attr('data-x'))},
          data_y: parseInt($(e.target).attr('data-y')),
        }, {sort: {data_x: -1}})
        if (!tar) {
          tar = Subjects.findOne({
            envId: environment.get()._id,
            _id: {$in: allowed_student_ids},
            data_y: parseInt($(e.target).attr('data-y')),
          }, {sort: {data_x: -1}})
        }
      }

      if (tar) {
        e.preventDefault();
        $('#' + tar._id).focus()
      }
    }
  },
  'click .observatory.observatory--edit .student-box': function (e) {
    if (!userHasEnvEditAccess(environment.get())) {
      // access control also done on server side.
      return;
    }
    let target_id;
    if ($(e.target).is('.student-box')) {
      target_id = $(e.target).attr('id');
    }
    else {
      target_id = $(e.target).parents('.student-box').attr('id')
    }
    Meteor.call('observationModifyAbsentStudent', {
      obsId: observation.get()._id,
      studentId: target_id,
      action: $('#' + target_id).hasClass('enabled') ? 'mark' : 'unmark',
    });
  },
  'click .help-button': function (e) {
    $('#help-env-modal').addClass("is-active");
  },
  'click #help-close-modal': function (e) {
    $('#help-env-modal').removeClass("is-active");
  },
  'click .modal-card-foot .button': function (e) {
    $('#help-env-modal').removeClass("is-active");
  },
  'click .modal-background': function (e) {
    $('#seq-param-modal').removeClass('is-active');
    $('#seq-data-modal').removeClass('is-active');
    $('#help-env-modal').removeClass("is-active");
  },
  'click .modal-close': function (e) {
    $('#seq-param-modal').removeClass('is-active');
    $('#seq-data-modal').removeClass('is-active');
  },
  'click .edit-observation-name': function (e) {
    editObservationName(observation.get()._id);
  },
  'click .edit-observation-date': function (e) {
    editObservationDate(observation.get()._id);
  },
  'click #delete-observation': function (e) {
    deleteObservation(observation.get()._id);
  },
  'submit #save-seq-params-form': function (e) {
    e.preventDefault();

    let callback = function () {
      setTimeout(function () {
        $('#seq-param-modal').removeClass('is-processing');
      }, 500)
    };

    currentStudentId.get();

    let sid = currentStudentId.get();
    let sequence = {
      envId: environment.get()._id,
      info: {
        student: {
          studentId: sid,
          studentName: Subjects.findOne({_id: sid}),
        },
      },
      obsId: observation.get()._id,
      obsName: observation.get().name
    };

    sequence.info.parameters = {};

    let missing_params = [];
    this.sequenceParameters.forEach(function (param) {
      let param_value = $('input[name="' + param.label + '"]:checked').attr('value');
      if (typeof param_value === 'undefined') {
        missing_params.push(param.label);
      }
      sequence.info.parameters[param.label] = param_value;
    });

    if (missing_params.length > 1) {
      if (typeof callback === 'function') {
        callback()
      }
      alert(`No selection made for ${missing_params.join(', ')}`);
      return;
    }

    Meteor.call('sequenceInsert', sequence, function (error, result) {
      if (error) {
        alert(error.reason);
      }
      else {
        gtag('event', 'add_success', {'event_category': 'sequences'});
      }
    });

    $('#seq-param-modal').removeClass('is-active');
  },
  'submit #edit-seq-params-form': function (e) {
    if (activeEditSequence.get().length === 0) {
      alert('There was an error with editing that student. Please try again later, or if the issue persists, contact us with the link at the bottom of the page.');
      $('#seq-data-modal').removeClass('is-active');
      $('#seq-param-modal').removeClass('is-active');

      // todo change this to use a "active modal" reactive var?
      return;
    }
    e.preventDefault();

    let sequence = {
      seqId: activeEditSequence.get(),
      envId: environment.get()._id,
    };

    let missing_params = [];
    sequence.info = {parameters: {}};
    this.sequenceParameters.forEach(function (param) {
      let param_value = $('input[name="' + param.label + '"]:checked').attr('value');
      if (typeof param_value === 'undefined') {
        missing_params.push(param.label);
      }
      sequence.info.parameters[param.label] = param_value;
    });

    if (missing_params.length > 1) {
      alert(`No selection made for ${missing_params.join(', ')}`);
      return;
    }

    let that = this;

    console_log_conditional('sequence about to send to server:', sequence)
    Meteor.call('sequenceUpdate', sequence, function (error, result) {
      if (error) {
        alert(error.reason);
      }
      else {
        $('#seq-param-modal').removeClass('is-active');
        observation_helpers.createTableOfContributions(that.observation._id);
        $('#seq-data-modal').addClass('is-active');
        activeEditSequence.set('');
      }
    });
  },
  'click .edit-seq': function (e) {
    gtag('event', 'edit', {'event_category': 'sequences'});
    $('#seq-data-modal').removeClass('is-active');

    let seqId = $(e.target).attr('data-id');
    let subjId = $(e.target).attr('data-student-id');

    activeEditSequence.set(seqId);
    observation_helpers.editParamBoxes(seqId, subjId, environment.get()._id);
    $('#seq-param-modal').addClass('is-active');
  },
  'click .delete-seq': function (e) {
    observation_helpers.deleteContribution(e, observation.get()._id);
  },
  'click #show-all-observations': function (e) {
    observation_helpers.createTableOfContributions(observation.get()._id);
    gtag('event', 'view_sequence_list', {'event_category': 'observations'});
    $('#seq-data-modal').addClass('is-active');
  },
  'click .edit-included-students': function () {
    if (classroomMode.get() === 'code') {
      classroomMode.set('edit');
    }
    else {
      classroomMode.set('code');
    }
  },
  'submit #obs-desc-form': function (e) {
    e.preventDefault();

    let $desc = $('.observation__description', e.target);
    Meteor.call('observationUpdateDescription', {
      obsId: observation.get()._id,
      description: $desc.val()
    }, function (err, res) {
      if (err) {
        alert(err)
      }
      else {
        $('details', e.target).append('<span class="item-saved-message">Saved</span>')
        setTimeout(function () {
          $('.item-saved-message', e.target).remove()
        }, 2000)
      }
    })
  },
  'submit #obs-notes-form': function (e) {
    e.preventDefault();

    let $notes = $('.observation__notes', e.target);
    Meteor.call('observationUpdateNotes', {obsId: observation.get()._id, notes: $notes.val()}, function (err, res) {
      if (err) {
        alert(err)
      }
      else {
        $('details', e.target).append('<span class="item-saved-message">Saved</span>')
        setTimeout(function () {
          $('.item-saved-message', e.target).remove()
        }, 2000)
      }
    })
  },
});

function getAllowedStudentIds(envId, obs) {
  return Subjects.find({envId: envId}).fetch().map(function (s) {
    if (obs.observationType === 'small_group' && !obs.small_group.find(id => id === s._id)) {
      return;
    }
    if (obs.observationType === 'whole_class' && !!obs.absent.find(id => id === s._id)) {
      return;
    }
    return s._id
  })
}


Template.registerHelper('math', function () {
  return {
    mul(a, b) {
      return a * b;
    },
    div(a, b) {
      return b ? a / b : 0;
    },
    sum(a, b) {
      return a + b;
    },
    sub(a, b) {
      return a - b;
    },
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
    .on('click', function () {
      var new_obs_name = $('.edit-obs-name', context);
      var new_name = new_obs_name.val();

      var args = {
        'obsId': obsId,
        'obsName': new_name,
      };

      Meteor.call('observationRename', args, function (error, result) {
        var message;
        if (result) {
          message = $('<span/>', {
            class: 'name-save-result tag is-success inline-block success-message',
            text: 'Saved'
          });
          obs_name.html(new_name);
          gtag('event', 'rename', {'event_category': 'observations'});
        }
        else {
          message = $('<span/>', {
            class: 'name-save-result tag is-warning inline-block error-message',
            text: 'Failed to save. Try again later'
          })
        }
        obs_name_wrapper.append(message);

        setTimeout(function () {
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

  $('.edit-obs-name:not(.edit-obs-name--processed)', context).addClass('edit-obs-name--processed').on('keyup', function (e) {
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
    .on('click', function () {
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

      Meteor.call('observationUpdateDate', args, function (error, result) {
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

        setTimeout(function () {
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

  $('.edit-obs-date:not(.edit-obs-date--processed)', context).addClass('edit-obs-date--processed').on('keyup', function (e) {
    if (e.keyCode === 13) {
      save_button.click()
    }
  })

  save_button.removeClass('is-loading');
}

function deleteObservation(obsId) {
  var result = confirm("Are you sure you want to delete this observation?");
  if (result) {
    Meteor.call('observationDelete', obsId, function (error, result) {
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
