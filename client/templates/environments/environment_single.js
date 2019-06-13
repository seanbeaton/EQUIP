import {absentStudentSelectActive, obsCreateModal, smallGroupStudentSelectActive} from "./environment_list";

Template.environmentSingle.events({

})

Template.environmentSingle.helpers({
  smallGroupStudentSelectActive: function() {
    return smallGroupStudentSelectActive.get();
  },
  absentStudentSelectActive: function() {
    return absentStudentSelectActive.get();
  },
  obsCreateModal: function() {
    return obsCreateModal.get()
  },
})