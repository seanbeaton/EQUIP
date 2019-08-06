import {checkAccess} from "../../helpers/access";
import SimpleSchema from "simpl-schema";

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
    console.log('valid, going on')
    if (typeof options.subjId) {
      console.log('single subject')
      let subjects = Subjects.findOne(options);
      console.log('subject', subjects)
      return subjects
    }
    else {
      console.log('multi subject')
      let subjects = Subjects.find(options).fetch();
      console.log('subject', subjects);
      return subjects
    }
  }

})