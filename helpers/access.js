
import SimpleSchema from 'simpl-schema';

let checkAccess = function(id, type, access_level) {
  const schema = new SimpleSchema({
    id: String,
    type: {
      type: String,
      allowedValues: [
        'environment',
        'observation',
        'shared_environment',
        'sequence',
        'subject',
        'sequence_parameter',
        'subject_parameter',
      ]
    },
    access_level: {
      type: String,
      allowedValues: [
        'view',
        'edit',
        'delete',
      ]
    }
  }).validate({
    id: id,
    type: type,
    access_level: access_level,
  });

  if (type === 'environment') {
    let env = Environments.findOne({_id: id});
    if (env.userId === Meteor.userId()) {
      return;
    }
    // access level doesn't matter
    throw new Meteor.Error('403', `${access_level} access not allowed to this ${type}`);
  }
  else if (type === 'observation') {
    let obs = Observations.findOne({_id: id});
    if (obs.userId === Meteor.userId()) {
      return;
    }
    // access level doesn't matter
    throw new Meteor.Error('403', `${access_level} access not allowed to this ${type}`);
  }
  else if (type === 'sequence') {
    let seq = Sequences.findOne({_id: id});
    if (seq.userId === Meteor.userId()) {
      return;
    }
    // del is possible. edit uses env level check.
    // access level doesn't matter
    throw new Meteor.Error('403', `${access_level} access not allowed to this ${type}`);
  }
  else if (type === 'subject') {
    let subj = Subjects.findOne({_id: id});
    if (subj.userId === Meteor.userId()) {
      return;
    }
    // del is possible. edit uses env level check.
    // access level doesn't matter
    throw new Meteor.Error('403', `${access_level} access not allowed to this ${type}`);
  }
  else if (type === 'shared_environment') {
    return; // always allowed
  }
  else {
    throw new Meteor.Error('403', `type '${type}' not recognized`)
  }
}

export {checkAccess}