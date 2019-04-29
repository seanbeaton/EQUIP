/*
* JS file for environment_list.html
*/

import {getStudents} from "../../helpers/students";

const smallGroupStudentSelectActive = new ReactiveVar(false);
const obsCreateModal = new ReactiveVar(false);
const activeEnvId = new ReactiveVar(false);
const currentNewObservations = new ReactiveVar(false);

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
  processDatepickers()
}

Template.environmentList.helpers({
  transformStudentPosition: function(pos) {
    return parseInt(pos) * 0.6;
  },
  smallGroupStudentSelectActive: function() {
    return smallGroupStudentSelectActive.get();
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
    var envs = Environments.find({}, {sort: {submitted: -1}}).fetch();
    var obs;
    var subjects;
    var user = Meteor.user();
    var total_students = Subjects.find({userId: user._id}).count();
    var total_obs = Sequences.find({userId: user._id}).count();
    var results = {list: envs, num_env: parseInt(envs.length), num_students: parseInt(total_students), num_obs: parseInt(total_obs)};

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
    var obj = Environments.find({}).fetch();

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
  'click #obs-create-button': function(e) {
    console.log('starting');
    var id = e.target.getAttribute('data-id');
    obsCreateModal.set(true);
    activeEnvId.set(id);
  },
  'click #save-small-group': function(e) {
    e.preventDefault();
    let observation = currentNewObservations.get();
    observation.small_group = getSmallGroupStudents();
    if (observation.small_group.length <= 1) {
      alert('You need to select at least two students');
      return;
    }
    console.log('observations small group', observation.small_group);
    Meteor.call('observationInsert', observation, function(error, result) {
      return 0
    });
    smallGroupStudentSelectActive.set(false);
    currentNewObservations.set(false)
  },
  'click #obs-close-modal': function(e) {
    obsCreateModal.set(false);
    // $('#obs-create-modal').removeClass("is-active");
  },
  'click #save-obs-name': function(e) {
    var id = $('#obs-create-modal').attr("data-id");
    var sequenceParams = SequenceParameters.findOne({'children.envId': id});
    var demographicParams = SubjectParameters.findOne({'children.envId': id});
    var observations = Observations.find({"envId": id}).fetch();
    var obsAccordion = $(`.c--accordion-item__inner[data-id=${id}]`);

    var observation = {
      name: $('#observationName').val(),
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
      console.log('sequence ', sequenceParams, demographicParams);
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
      console.log('small group found');
      currentNewObservations.set(observation);
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
'#small-group-close-modal click': function() {
    smallGroupStudentSelectActive.set(false);
},
'click .enter-class': function(e) {
  // var obj1 = SubjectParameters.find({'children.envId': this._id}).fetch();
  // var obj2 = SequenceParameters.find({'children.envId': this._id}).fetch();
  // if ($.isEmptyObject(obj1) || $.isEmptyObject(obj2) || $.isEmptyObject(obj3)) {
  //  alert('You must add students to the environment to continue to do the observation.');
  //  return;
  // }
    var obsId = $(e.target).attr("data-id");
    Router.go('observatory', {_envId: this._id, _obsId: obsId});
},

  //  'click #createNewEnvironment': function(e) {
  //   $('#createEnvPopup').modal({
  //     keyboard: true,
  //     show: true
  //   });
  //   $('#createEnvPopup').on('shown.bs.modal', function () {
  //     $('#environmentName').focus();
  //   })
  // },

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
  'click .small-group-student': function(e) {
    let target = $(e.target);
    if (target.hasClass('small-group-student')) {
      target.toggleClass('selected');
    }
    else {
      target.parents('.small-group-student').toggleClass('selected');
    }
  }
});

let getSmallGroupStudents = function() {
  let ret = [];
  $('.small-group-student.selected').each(function() {
    ret.push($(this).attr('id'))
  })
  console.log('ret', ret);
  return ret;
};

function processDatepickers() {
  $('.datepicker:not(.datepicker--processed)').addClass('datepicker--processed').datepicker({
    dateFormat: 'mm/dd/yy',
    altField: '#altObservationDate',
    altFormat: 'yy-mm-dd'
  })
}