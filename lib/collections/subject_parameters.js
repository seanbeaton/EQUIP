/*
* JS MongoDB collection init and methods file
* SubjectParameters
*/

import {checkAccess} from "/helpers/access";
import SimpleSchema from "simpl-schema";


class SubjectParameter {
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


SubjectParameters = new Mongo.Collection('subject_parameters', {
  transform: (doc) => new SubjectParameter(doc)
});

Meteor.methods({

  exportSubjParameters: function (envId) {
    checkAccess(envId, 'environment', 'view');

    var subjParams = SubjectParameters.findOne({'envId': envId}) || null;

    if (subjParams == null) {
      return {};
    }

    return {
      'parameters': subjParams.parameters,
    };

  },

  importSubjParameters: function (paramsAttributes) {
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

    console.log('paramsAttributes', paramsAttributes);
    var user = Meteor.user();
    var params = _.extend(paramsAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date(),
    });
    var subjParamsId = SubjectParameters.insert(params);

    Meteor.call('environmentModifyParam', paramsAttributes.envId, function (error, result) {
      return 0;
    });

    return {
      _subjParamsId: subjParamsId
    };

  },

  updateSubjParameters: function (paramsAttributes) {
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
    console.log('paramsAttributes', paramsAttributes);

    let subjParamsId = SubjectParameters.update({envId: paramsAttributes.envId}, {$set: {parameters: paramsAttributes.parameters}});

    Meteor.call('environmentModifyParam', paramsAttributes.envId, function (error, result) {
      return 0;
    });

    return {
      _subjParamsId: subjParamsId
    };
  }
});
