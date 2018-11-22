Meteor.methods({
  userExists: function(username){
    return !!Meteor.users.findOne({username: username});
  },
  emailExists: function(email){
    return !!Meteor.users.findOne({email: email});
  },
});