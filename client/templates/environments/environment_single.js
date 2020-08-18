import {absentStudentSelectActive, obsCreateModal, smallGroupStudentSelectActive} from "./environment_list";

Template.environmentSingle.events({})


Template.environmentSingle.onCreated(function created() {
  this.autorun(() => {
    Meteor.subscribe('environment', this.data.envId);
    Meteor.subscribe('groupEnvironment', this.data.envId);
    Meteor.subscribe('envObservations', this.data.envId);
    Meteor.subscribe('groupEnvObservations', this.data.envId);
    Meteor.subscribe('envSubjects', this.data.envId);
    Meteor.subscribe('groupEnvSubjects', this.data.envId);
    Meteor.subscribe('envSubjectParameters', this.data.envId);
    Meteor.subscribe('groupEnvSubjectParameters', this.data.envId);
    Meteor.subscribe('envSequenceParameters', this.data.envId);
    Meteor.subscribe('groupEnvSequenceParameters', this.data.envId);
  })
});


Template.environmentSingle.helpers({
  smallGroupStudentSelectActive: function () {
    return smallGroupStudentSelectActive.get();
  },
  absentStudentSelectActive: function () {
    return absentStudentSelectActive.get();
  },
  obsCreateModal: function () {
    return obsCreateModal.get()
  },
  environment_false_list: function () {
    return [Environments.findOne({_id: this.envId})];
  }
})
