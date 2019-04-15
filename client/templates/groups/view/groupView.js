
Template.groupView.helpers({
  groups: function() {
    return Groups.find().fetch();
  },
  myRole: function(group) {
    return group.members.find(u => u.userId === Meteor.userId()).roles.join(', ')
  }
});
