import {checkAccess} from "../../helpers/access";
import SimpleSchema from "simpl-schema";
import {console_log_conditional} from "/helpers/logging"

Meteor.methods({
  getStudents: function(options) {
    new SimpleSchema({
      // obsId: {
      //   type: String,
      //   optional: true,
      //   custom: function() {
      //     checkAccess(this.obsId, 'observation', 'view');
      //   }
      // },
      envId: {
        type: String,
        optional: true,
        custom: function() {
          try {
            checkAccess(this.field('envId').value, 'environment', 'view');
          }
          catch (e) {
            return "error"
          }
        }
      },
      _id: {
        type: String,
        optional: true,
        custom: function() {
          try {
            checkAccess(this.field('_id').value, 'subject', 'view');
          }
          catch (e) {
            return "error"
          }
        }
      },
    }).validate(options);
    console_log_conditional('valid, going on')
    if (typeof options.subjId) {
      console_log_conditional('single subject')
      let subjects = Subjects.findOne(options);
      console_log_conditional('subject', subjects)
      return subjects
    }
    else {
      console_log_conditional('multi subject')
      let subjects = Subjects.find(options).fetch();
      console_log_conditional('subject', subjects);
      return subjects
    }
  }

})