/*
* JS MongoDB collection init and methods file
* Subjects
*/

Subjects = new Mongo.Collection('subjects');

Meteor.methods({
  subjectInsert: function(subjectAttributes) {

    var user = Meteor.user();

    var subject = _.extend(subjectAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date()
    });

    var subjId = Subjects.insert(subject);

    return {
      _id: subjId
    };
  },
  subjectUpdate: function (sub) {
    Subjects.update({'_id': sub.subId}, {$set: {'info': sub.info}});
  },
  subjectPositionUpdate: function(list) {
    for (obj in list) {
      id = list[obj].id
      x = list[obj].x
      y = list[obj].y
      var subjId = Subjects.update(id, {$set: { 'data_x': x, 'data_y': y}});
    }
    return
  },
  subjectDelete: function(subjId) {
    Subjects.remove({
      _id: subjId
    })
    Sequences.remove({
      subjId: subjId
    })
  },
});
