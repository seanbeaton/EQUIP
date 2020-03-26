/*
* JS file for environment_list.html
*/

import {getStudents} from "/helpers/students";
import {console_log_conditional} from "/helpers/logging"

export const smallGroupStudentSelectActive = new ReactiveVar(false);
export const absentStudentSelectActive = new ReactiveVar(false);
export const obsCreateModal = new ReactiveVar(false);
export const activeEnvId = new ReactiveVar(false);
export const currentNewObservation = new ReactiveVar(false);


Template.environmentList.onCreated(function created() {
  this.autorun(() => {
    this.subscribe('environments');
    this.subscribe('observations');
    this.subscribe('subjects');
    // this.subscribe('sequences');
    this.subscribe('subjectParameters');
    this.subscribe('sequenceParameters');
  })
});


Template.environmentList.rendered = function() {
  // if (document.querySelector(".toggle-accordion")) {
  //     document.querySelectorAll('.toggle-accordion')[0].click(); // main
  //     document.querySelectorAll('.toggle-accordion')[1].click(); // observations
  // }

  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("onboarding")) {
      $('#onboarding-modal').removeClass("is-active");
      $('#env-create-modal').addClass("is-active");
  }
}

Template.obsCreationModal.rendered = function() {
  processDatepickers();
};

Template.obsCreationModal.helpers({
  subjects: function() {
    return getStudents(activeEnvId.get());
  },
  activeEnvId: function() {
    return activeEnvId.get();
  },
  currentISODate: function() {
    let date = new Date();
    function pad(number) {
      if (number < 10) {
        return '0' + number;
      }
      return number;
    }
    return date.getFullYear() +
      '-' + pad(date.getMonth() + 1) +
      '-' + pad(date.getDate())
  },
  currentUSDate: function() {
    let date = new Date();
    function pad(number) {
      if (number < 10) {
        return '0' + number;
      }
      return number;
    }
    return pad(date.getMonth() + 1) +
      '/' + pad(date.getDate()) +
      '/' + date.getFullYear();
  },
});

Template.obsCreationModal.events({
  'click #save-obs-name': function(e) {
    var id = $('#obs-create-modal').attr("data-id");
    var sequenceParams = SequenceParameters.findOne({'children.envId': id}, {reactive: false});
    var demographicParams = SubjectParameters.findOne({'children.envId': id}, {reactive: false});
    var observations = Observations.find({"envId": id}, {reactive: false}).fetch();
    var obsAccordion = $(`.c--accordion-item__inner[data-id=${id}]`);

    var observation = {
      name: $('#observationName').val(),
      description: $('#observationDescription').val(),
      observationDate: $('#altObservationDate').val(),
      observationType: $('input[name="classroom-type"]:checked').attr('data-classroom-type'),
      envId: id,
      timer: 0
    };

    if (!observation.name) {
      alert("Observation name required.");
      return;
    }

    if (!observation.observationDate) {
      alert("Observation date required.");
      return;
    }

    if (!observation.observationType) {
      alert("Observation type required.");
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(observation.observationDate)) {
      alert('Please input a valid date in YYYY-MM-DD format');
      return;
    }

    if (sequenceParams === undefined || demographicParams === undefined) {
      console_log_conditional('sequence ', sequenceParams, demographicParams);
      alert("You must add students and parameters to the environment to continue to do the observation.")
      return;
    }

    if (observations.length === 0 ) {
      var confirmation = getConfirmation();
      if (!confirmation) {
        return;
      }
    }

    let closeObsModal = function() {
      $('#observationName').val('');
      $('#obs-close-modal').click();

      if (!$(obsAccordion).next().hasClass("show")) {
        $(obsAccordion).click();
      }
    }

    if (observation.observationType === 'small_group') {
      smallGroupStudentSelectActive.set(true);
      closeObsModal();
      currentNewObservation.set(observation);
    }
    else if (observation.observationType === 'whole_class') {
      absentStudentSelectActive.set(true);
      closeObsModal();
      currentNewObservation.set(observation);
    }
    else {
      Meteor.call('observationInsert', observation, function(error, result) {
        return 0;
      });
      closeObsModal()
    }

    function getConfirmation() {
      var retVal = confirm("Are you sure? After the first observation is created, you will not be able to edit discourse dimensions or demographics.");
      if (retVal === true) {
        return true;
      }
      else {
        return false;
      }
    }
  },
  'click #obs-close-modal': function(e) {
    obsCreateModal.set(false);
  },
})

Template.obsAbsentModal.helpers({
  subjects: function() {
    return getStudents(activeEnvId.get());
  },
  activeEnvId: function() {
    return activeEnvId.get();
  },
  transformStudentPosition: function(pos) {
    return parseInt(pos) * 0.6;
  },
});

Template.obsAbsentModal.events({
  'click #save-absent-students': function(e) {
    e.preventDefault();
    let observation = currentNewObservation.get();
    observation.absent = getAbsentStudents();
    console_log_conditional('about to save observation:', observation)
    Meteor.call('observationInsert', observation, function(error, result) {
      return 0
    });
    absentStudentSelectActive.set(false);
    currentNewObservation.set(false)
  },
  'click #absent-close-modal': function() {
    absentStudentSelectActive.set(false);
  },
  'click .class-absent-student': function(e) {
    let target = $(e.target);
    if (target.hasClass('class-absent-student')) {
      target.toggleClass('selected');
    }
    else {
      target.parents('.class-absent-student').toggleClass('selected');
    }
  },
})

Template.obsSmallGroupModal.helpers({
  subjects: function() {
    return getStudents(activeEnvId.get());
  },
  activeEnvId: function() {
    return activeEnvId.get();
  },
  transformStudentPosition: function(pos) {
    return parseInt(pos) * 0.6;
  },
});

Template.obsSmallGroupModal.events({
  'click #save-small-group': function(e) {
    e.preventDefault();
    let observation = currentNewObservation.get();
    observation.small_group = getSmallGroupStudents();
    if (observation.small_group.length <= 1) {
      alert('You need to select at least two students');
      return;
    }
    console_log_conditional('observations small group', observation.small_group);
    Meteor.call('observationInsert', observation, function(error, result) {
      return 0
    });
    smallGroupStudentSelectActive.set(false);
    currentNewObservation.set(false)
  },
  'click #small-group-close-modal': function() {
    smallGroupStudentSelectActive.set(false);
  },

  'click .small-group-student': function(e) {
    let target = $(e.target);
    if (target.hasClass('small-group-student')) {
      target.toggleClass('selected');
    }
    else {
      target.parents('.small-group-student').toggleClass('selected');
    }
  },
})

Template.environmentList.helpers({
  smallGroupStudentSelectActive: function() {
    return smallGroupStudentSelectActive.get();
  },
  absentStudentSelectActive: function() {
    return absentStudentSelectActive.get();
  },
  obsCreateModal: function() {
    return obsCreateModal.get()
  },
  activeEnvId: function() {
    return activeEnvId.get();
  },
  subjects: function() {
    return getStudents(activeEnvId.get());
  },
  environment: function() {
    var envs = this.environments;
    // var obs;
    // var subjects;
    var user = Meteor.user();
    if (!user) {
      return {list: [], num_env: 0, num_students: 0};
    }
    var total_students = Subjects.find({userId: user._id}, {reactive: false}).count();
    // var total_obs = Sequences.find({userId: user._id}, {reactive: false}).count();
    var results = {list: envs, num_env: parseInt(envs.length), num_students: parseInt(total_students)};

    return results;
  },
  currentISODate: function() {
    let date = new Date();
    function pad(number) {
      if (number < 10) {
        return '0' + number;
      }
      return number;
    }
    return date.getFullYear() +
    '-' + pad(date.getMonth() + 1) +
    '-' + pad(date.getDate())
  },
  currentUSDate: function() {
    let date = new Date();
    function pad(number) {
      if (number < 10) {
        return '0' + number;
      }
      return number;
    }
    return pad(date.getMonth() + 1) +
    '/' + pad(date.getDate()) +
    '/' + date.getFullYear();
  },
  needsEnvironment: function() {
    var obj = Environments.find({}, {reactive: false}).fetch();

    return $.isEmptyObject(obj)?"green-pulse":"";
  }
});

Template.environmentList.events({
  'click #analyze-button': function (e){
    e.preventDefault();
    e.stopPropagation();
    Router.go('reportsSelection');
  },
  'click .help-button': function (e) {
    $('#help-env-modal').addClass("is-active");
  },
  'click #help-close-modal': function(e) {
    $('#help-env-modal').removeClass("is-active");
  },
   'click #env-create-button': function(e) {
    $('#env-create-modal').addClass("is-active");
  },
   'click #env-close-modal': function(e) {
    $('#env-create-modal').removeClass("is-active");
  },
  'click .modal-card-foot .button': function(e) {
    $('#env-create-modal').removeClass("is-active");
    $('#help-env-modal').removeClass("is-active");
  },

  'click #save-env-name': function(e) {
    var environment = {
      envName: $('#environmentName').val()
    };

    if ($('#environmentName').val() == "") {
      alert("Environment name required.");
      return;
    }

    Meteor.call('environmentInsert', environment, function(error, result) {
      return 0;
    });

    $('#env-create-modal').removeClass("is-active");
    $('#environmentName').val('');
  },
  'click .generate-example-classroom': function() {
    Meteor.call('environmentInsertExample', null, function(error, result) {
      return 0;
    });
  },
});

let getSmallGroupStudents = function() {
  let ret = [];
  $('.small-group-student.selected').each(function() {
    ret.push($(this).attr('id'))
  })
  // console_log_conditional('ret', ret);
  return ret;
};

let getAbsentStudents = function() {
  let ret = [];
  $('.class-absent-student.selected').each(function() {
    ret.push($(this).attr('id'))
  })
  // console_log_conditional('ret', ret);
  return ret;
};

function processDatepickers() {
  $('.datepicker:not(.datepicker--processed)').addClass('datepicker--processed').datepicker({
    dateFormat: 'mm/dd/yy',
    altField: '#altObservationDate',
    altFormat: 'yy-mm-dd'
  })
}