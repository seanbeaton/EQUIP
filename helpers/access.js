
import SimpleSchema from 'simpl-schema';
import {getUserGroupEnvs, userCanGroupEditEnv, userCanGroupViewEnv} from "./groups";

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
        'group',
      ]
    },
    access_level: {
      type: String,
      allowedValues: [
        'view',
        'edit',
        'delete',
        'manage',
        'admin',
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
      // if you're the owner, you can do whatever.
      return;
    }
    if (access_level === 'view') {
      if (userCanGroupViewEnv(Meteor.userId(), id)) {
        return;
      }
    }
    if (access_level === 'edit') {
      if (userCanGroupEditEnv(Meteor.userId(), id)) {
        return;
      }
    }
    // access level doesn't matter
    throw new Meteor.Error('403', `${access_level} access not allowed to this ${type}`);
  }
  else if (type === 'observation') {
    let obs = Observations.findOne({_id: id});
    let env = Environments.findOne({_id: obs.envId}) ;
    if (!env) {
      throw new Meteor.Error('403', `${access_level} access not allowed to this ${type}`);
    }
    if (env.userId === Meteor.userId()) {
      // if you're the owner of the parent env, you can do whatever.
      return;
    }
    if (access_level === 'view') {
      if (userCanGroupViewEnv(Meteor.userId(), obs.envId)) {
        return;
      }
    }
    if (access_level === 'edit') {
      if (userCanGroupEditEnv(Meteor.userId(), obs.envId)) {
        return;
      }
    }
    throw new Meteor.Error('403', `${access_level} access not allowed to this ${type}`);
  }
  else if (type === 'sequence') {
    let seq = Sequences.findOne({_id: id});
    let env = Environments.findOne({_id: seq.envId}) ;
    if (!env) {
      throw new Meteor.Error('403', `${access_level} access not allowed to this ${type}`);
    }
    if (env.userId === Meteor.userId()) {
      // if you're the owner of the parent env, you can do whatever.
      return;
    }
    if (access_level === 'view') {
      if (userCanGroupViewEnv(Meteor.userId(), seq.envId)) {
        return;
      }
    }
    if (access_level === 'edit') {
      if (userCanGroupEditEnv(Meteor.userId(), seq.envId)) {
        return;
      }
    }
    if (access_level === 'delete') {
      if (userCanGroupEditEnv(Meteor.userId(), seq.envId)) {
        return;
      }
    }

    throw new Meteor.Error('403', `${access_level} access not allowed to this ${type}`);
  }
  else if (type === 'subject') {
    let subj = Subjects.findOne({_id: id});
    let env = Environments.findOne({_id: subj.envId}) ;
    if (!env) {
      throw new Meteor.Error('403', `${access_level} access not allowed to this ${type}`);
    }
    if (env.userId === Meteor.userId()) {
      // if you're the owner of the parent env, you can do whatever.
      // We need to check if you're the owner of the parent env because
      // envs could be shared, then later unshared.
      return;
    }
    if (access_level === 'view') {
      if (userCanGroupViewEnv(Meteor.userId(), subj.envId)) {
        return;
      }
    }
    if (access_level === 'edit') {
      if (userCanGroupEditEnv(Meteor.userId(), subj.envId)) {
        return;
      }
    }
    if (access_level === 'delete') {
      if (userCanGroupEditEnv(Meteor.userId(), subj.envId)) {
        return;
      }
    }
    // del is possible. edit uses env level check.
    // access level doesn't matter
    throw new Meteor.Error('403', `${access_level} access not allowed to this ${type}`);
  }
  else if (type === 'group') {
    let group = Groups.findOne({_id: id});
    if (!group) {
      throw new Meteor.Error('403', 'Group not found or no permissions')
    }

    if (access_level === 'admin') {
      if (group.members
        .find(m => m.userId === Meteor.userId())
        .roles.some(r => ['admin'].includes(r))) {
        // allowed
        return;
      }
      throw new Meteor.Error('403', 'Group not found or no permissions')
    }
    if (access_level === 'manage') {
      if (group.members
        .find(m => m.userId === Meteor.userId())
        .roles.some(r => ['manage', 'admin'].includes(r))) {
        // allowed
        return;
      }
      throw new Meteor.Error('403', 'Group not found or no permissions')
    }
    if (access_level === 'edit') {
      if (group.members
        .find(m => m.userId === Meteor.userId())
        .roles.some(r => ['edit', 'manage', 'admin'].includes(r))) {
        // allowed
        return;
      }
      throw new Meteor.Error('403', 'Group not found or no permissions')
    }
    if (access_level === 'view') {
      if (group.members
        .find(m => m.userId === Meteor.userId())
        .roles.some(r => ['view', 'edit', 'manage', 'admin'].includes(r))) {
        // allowed
        return;
      }
      throw new Meteor.Error('403', 'Group not found or no permissions')
    }

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