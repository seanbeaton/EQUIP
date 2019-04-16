/*
* JS file for meteor publications
* All collections must be published in order to be avaliable to the user
* Once a collection is published with a set of restricting parameters, the subset of data is sent to the user, where the user must be subscribed in the router.js file in order to gain access
* Subscriptions are handled in ../lib/router.js
*/

Meteor.publish('groups', function(groupId) {
  if (!this.userId) {
    return this.ready();
  }

  if (typeof groupId === 'undefined') {
    return Groups.find(
      {
        "members.userId": this.userId
      }
    )
  }
  else {
    return Groups.find(
      {
        "members.userId": this.userId,
        _id: groupId
      }
    )
  }
});

Meteor.publish('environments', function() {
    if (!this.userId) {
        return this.ready();
    }
    
    return Environments.find(
    {userId: this.userId}
    );
});


Meteor.publish('observations', function() {
    if (!this.userId) {
        return this.ready();
    }

  return Observations.find({userId: this.userId});
});

Meteor.publish('subjects', function() {
    if (!this.userId) {
        return this.ready();
    }

  return Subjects.find({userId: this.userId});
});

Meteor.publish('sequences', function() {
    if (!this.userId) {
        return this.ready();
    }

   return Sequences.find({userId: this.userId});
});

Meteor.publish('subject_parameters', function() {
    if (!this.userId) {
        return this.ready();
    }

   return SubjectParameters.find({userId: this.userId});
});

Meteor.publish('sequence_parameters', function() {
    if (!this.userId) {
        return this.ready();
    }
    
   return SequenceParameters.find({userId: this.userId});
});

Meteor.publish('shared_environments', function(shareId) {
   // these are public
   return SharedEnvironments.find({_id: shareId});
});


Meteor.publish('allEnvs', function() {
  if (Roles.userIsInRole(this.userId, ['admin'], 'site')) {
    return Environments.find();
  }
  else {
    // return [];
    //
    this.ready()
  }

  // this.stop();
  return;
});
Meteor.publish('allObs', function() {
  if (Roles.userIsInRole(this.userId, ['admin'], 'site')) {
    return Observations.find();
  }
  else {
    this.ready();
    // return [];
  }

  // this.stop();
  return;
});

Meteor.publish('allSeqs', function() {
  if (Roles.userIsInRole(this.userId, ['admin'], 'site')) {
    return Sequences.find();
  }
  else {
    // return [];

    this.ready()
  }

  // this.stop();
  return;
});

Meteor.publish('allSubjectsAndParams', function() {
  if (Roles.userIsInRole(this.userId, ['admin'], 'site')) {
    return [
      SequenceParameters.find(),
      SubjectParameters.find(),
      Subjects.find(),
    ]
  }
  else {
    // return [];

    this.ready()
  }

  // this.stop();
  return;
});


Meteor.publish("autocompleteUsers", function(selector, options) {
  let results = Meteor.users.find({_id: ''}, options);

  let min_search_string_length = 6;
  if (selector && typeof selector['$or'] !== 'undefined' && selector['$or'][0].username.toString().length >= min_search_string_length) {
    results = Meteor.users.find(selector, options);
  }

  Autocomplete.publishCursor(results, this);
  this.ready();
});

Meteor.publish("autocompleteEnvironments", function(selector, options) {
  console.log('selecto bfeore', selector)
  if (selector && typeof selector['$or'] !== 'undefined') {
    selector['userId'] = this.userId;
  }
  else {
    selector = {userId: this.userId};
  }

  console.log('selecto after', selector)

  let results = Environments.find(selector, options);

  Autocomplete.publishCursor(results, this);
  this.ready();
});


Meteor.publish('users', function () {
  if (Roles.userIsInRole(this.userId, ['admin'], 'site')) {
    return Meteor.users.find();
  }
  else {
    return this.ready()
  }
});

Meteor.publish('allUsers', function () {
  if (!this.userId) {
    return this.ready();
  }

  return Meteor.users.find({}, {

    // todo: in the future, should this only publish relevant users to the group
    // you're part of, and a search for users requires some sort of input?
    fields: {
      username: 1,
      _id: 1
    }

  });
});

Meteor.publish('groupUsers', function(groupId) {
  if (!this.userId) {
    return this.ready();
  }

  let group = Groups.findOne({_id: groupId});

  if (!group) {
    return this.ready();
  }
  let userIds = group.members.map(mem => mem.userId);

  return Meteor.users.find({_id: {$in: userIds}}, {
    fields: {
      username: 1,
      _id: 1
    }

  });
});

Meteor.publish('groupEnvs', function(groupId) {
  if (!this.userId) {
    return this.ready();
  }

  let group = Groups.findOne({_id: groupId});

  if (!group) {
    return this.ready();
  }
  let envIds = group.environments.map(env => env.envId);

  return Environments.find({_id: {$in: envIds}});
});

//
// Meteor.publish('Meteor.users', function() {
//
//
//   return Meteor.users.find(selector, options);
//
// });
