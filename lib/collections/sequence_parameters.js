/*
* JS MongoDB collection init and methods file
* SequenceParameters
*/

import {checkAccess} from "/helpers/access";
import {console_log_conditional} from "/helpers/logging"
import SimpleSchema from "simpl-schema";

class SequenceParameter {
  constructor(doc) {
    _.extend(this, doc);
  }

  test() {
    return 'it works'
  }
  parameterNames() {
    return this.parameters.map((p) => p.label).join(", ")
  }
}
SequenceParameters = new Mongo.Collection('sequence_parameters', {
  transform: (doc) => new SequenceParameter(doc)
});

Meteor.methods({

  exportSeqParameters: function(envId) {
    checkAccess(envId, 'environment', 'view');

    var seqParams = SequenceParameters.findOne({'envId': envId}) || null;

    if (seqParams == null) { return {}; }

    return {
      'parameters': seqParams.parameters,
    };
  },

  importSeqParameters: function(paramsAttributes) {
    checkAccess(paramsAttributes.envId, 'environment', 'edit');
    new SimpleSchema({
      parameters: Array,
      envId: String,
      "parameters.$": Object,
      "parameters.$.label": {
        type: String,
        regEx: /^[^$.]+$/i
      },
      "parameters.$.options": Array,
      "parameters.$.options.$": {
        type: String,
        regEx: /^[^$.]+$/i
      },
    }).validate(paramsAttributes);

    var user = Meteor.user();
    var params = _.extend(paramsAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date(),
    });

    var seqParamsId = SequenceParameters.insert(params);

    Meteor.call('environmentModifyParam', paramsAttributes.envId, function(error, result) {
      return 0;
    });

    return {
       _seqParamsId: seqParamsId
    };

  },

  updateSeqParameters: function(paramsAttributes) {
    checkAccess(paramsAttributes.envId, 'environment', 'edit');
    new SimpleSchema({
      parameters: Array,
      envId: String,
      "parameters.$": Object,
      "parameters.$.label": {
        type: String,
        regEx: /^[^$.]+$/i
      },
      "parameters.$.options": Array,
      "parameters.$.options.$": {
        type: String,
        regEx: /^[^$.]+$/i
      },
    }).validate(paramsAttributes);

    let seqParamsId = SequenceParameters.update({envId: paramsAttributes.envId}, {$set: {parameters: paramsAttributes.parameters}});

    Meteor.call('environmentModifyParam', paramsAttributes.envId, function(error, result) {
      return 0;
    });

    return {
       _seqParamsId: seqParamsId
    };
  }
});
