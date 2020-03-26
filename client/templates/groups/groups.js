import {checkAccess} from "../../../helpers/access";
import {console_log_conditional} from "/helpers/logging"

Template.groupDeleteLink.events({
  'click .delete-group': function() {
    if (confirm('Are you sure you want to delete the group "' + this.group.groupName + '"')) {
      Meteor.call('groupDelete', this.group._id)
    }
  }
})
Template.groupsList.helpers({
  groups: function() {
    return Groups.find().fetch();
  },
  myRole: function(group) {
    return group.members.find(u => u.userId === Meteor.userId()).roles.join(', ')
  },
  canDelete: function(group) {
    try {
      checkAccess(group._id, 'group', 'admin')
      return true
    }
    catch (e) {
      return false
    }
  }
});

Template.groupsList.rendered = function() {

};

Template.groupsList.events = {
  'submit .group-creation': function(e) {
    let $group_name = $('#group-creation__name');
    if (!$group_name.val()) {
      alert('group name required');
      return;
    }
    let name = $group_name.val() ? $group_name.val() : 'default_group_name';
    Meteor.call('groupInsert', {groupName: name}, function(err, ret) {
      if (err) {
        alert(err.reason)
      }
      else {
        $group_name.val('');
      }
    })
    e.preventDefault();
  }

}