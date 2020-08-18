import {checkAccess} from "./access";
import {console_log_conditional} from "./logging"

let hasRemovePermission = function (envId, group) {
  if (userIsEnvOwner(envId)) {
    return true;
  }
  else if (userIsGroupManager(Meteor.userId(), group)) {
    return true;
  }
  return false;
}

let userIsGroupManager = function (uid, group) {
  if (typeof group === 'string') {
    group = Groups.findOne({_id: group}, {reactive: false});
  }
  try {
    checkAccess(group._id, 'group', 'manage')
  } catch (error) {
    return false;
  }
  return true;
}

let getHumanEnvPermission = function (perm) {
  if (perm === 'view') {
    return 'View only'
  }
  else if (perm === 'edit') {
    return 'View and edit'
  }
  else {
    return 'unk. perm.'
  }
}

let userIsEnvOwner = function (envId, uid) {
  if (typeof uid === 'undefined') {
    uid = Meteor.userId();
  }
  let full_env = Environments.findOne({_id: envId}, {reactive: false});
  return full_env.userId === uid;
}

let userIsGroupMember = function (gid, uid) {
  if (typeof uid === 'undefined') {
    uid = Meteor.userId();
  }
  let group = Groups.findOne({_id: gid}, {reactive: false});
  return !!group.members.find(m => m.userId === uid)
}

let envIsSharedToGroup = function (gid, envId) {
  let group = Groups.findOne({_id: gid}, {reactive: false});
  return !!group.environments.find(m => m.envId === envId)
}

let getUserGroupEnvs = function (userId) {
  let groups = Groups.find({
    $or: [{"members.userId": userId}, {showForAllUsers: true}]
  }, {reactive: false}).fetch();

  let env_ids = new Set();
  groups.forEach(function (group) {
    group.environments.forEach(function (env) {
      env_ids.add(env.envId)
    })
  });
  return env_ids
}

let userCanGroupViewEnv = function (uid, envId) {
  if (typeof uid === 'undefined') {
    uid = Meteor.userId();
  }
  let envs = getUserGroupEnvs(uid);
  if (envs.length === 0) {
    return false
  }
  return envs.has(envId);
}

let userCanGroupEditEnv = function (uid, envId) {
  if (typeof uid === 'undefined') {
    uid = Meteor.userId();
  }

  let groups = Groups.find({
    "members.userId": uid
  }, {reactive: false}).fetch();

  let allow = false;
  console_log_conditional('checking for uid', uid, 'and envID', envId, 'groups', groups)
  groups.forEach(function (group) {
    console_log_conditional(group.environments.find(env => env.envId === envId), group.members.find(m => m.userId === Meteor.userId())
      .roles.some(r => ['edit', 'manage', 'admin'].includes(r)))
    if (
      !!group.environments.find(env => env.envId === envId && env.share_type === 'edit') &&
      group.members.find(m => m.userId === uid)
        .roles.some(r => ['edit', 'manage', 'admin'].includes(r))) {
      allow = true;
    }
  });
  return allow;
}

export {
  getUserGroupEnvs,
  userCanGroupViewEnv,
  userCanGroupEditEnv,
  userIsGroupMember,
  getHumanEnvPermission,
  userIsGroupManager,
  hasRemovePermission,
  userIsEnvOwner,
  envIsSharedToGroup
}

