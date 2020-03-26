import {console_log_conditional} from "/helpers/logging"

Meteor.startup(function() {
  Environments.rawCollection().createIndex({userId: 1})
  Environments.rawCollection().createIndex({"_id": 1, "userId": 1})

  Sequences.rawCollection().createIndex({envId: 1});
  Sequences.rawCollection().createIndex({obsId: 1});
  Sequences.rawCollection().createIndex({envId: 1, obsId: 1})

  Observations.rawCollection().createIndex({envId: 1})
  Observations.rawCollection().createIndex({"envId": 1, "_id": 1})
  Observations.rawCollection().createIndex({envId: 1})

  Subjects.rawCollection().createIndex({"envId": 1})

  SequenceParameters.rawCollection().createIndex({userId: 1, 'children.envId': 1})
  SubjectParameters.rawCollection().createIndex({userId: 1, 'children.envId': 1})
})