/*
* JS file for meteor publications
* All collections must be published in order to be avaliable to the user
* Once a collection is published with a set of restricting parameters, the subset of data is sent to the user, where the user must be subscribed in the router.js file in order to gain access
* Subscriptions are handled in ../lib/router.js
*/

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

Meteor.publish('shared_environments', function() {
   // these are public
   return SharedEnvironments.find();
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



Meteor.publish('users', function () {
  if (Roles.userIsInRole(this.userId, ['admin'], 'site')) {
    return Meteor.users.find();
  }
  else {
    // return [];
    this.ready()
  }

  // this.stop();
  return;
});

//
// Meteor.publish('Meteor.users', function() {
//
//
//   return Meteor.users.find(selector, options);
//
// });
