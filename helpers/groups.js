let hasRemovePermission = function (envId, group) {
  let full_env = Environments.findOne({_id: envId});
  if (full_env.userId === Meteor.userId()) {
    return true;
  }
  else if (userIsGroupManager(Meteor.userId(), group)) {
    return true;
  }
  return false;
}

let userIsGroupManager = function (uid, group) {
  if (typeof group === 'string') {
    group = Groups.findOne({_id: group});
  }
  if (group.members.find(mem => mem.userId === uid)
    .roles.some(r => ['manage', 'admin'].includes(r))) {
    return true;
  }
  return false;
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
  let full_env = Environments.findOne({_id: envId});
  return full_env.userId === uid;
}

let userIsGroupMember = function (gid, uid) {
  if (typeof uid === 'undefined') {
    uid = Meteor.userId();
  }
  let group = Groups.findOne({_id: gid});
  return !!group.members.find(m => m.userId === uid)
}

let getUserGroupEnvs = function (userId) {
  let groups = Groups.find({
    "members.userId": userId
  }).fetch();

  let env_ids = new Set();
  groups.forEach(function (group) {
    group.environments.forEach(function (env) {
      env_ids.add(env.envId)
    })
  });
  return env_ids
}

export {getUserGroupEnvs, userIsGroupMember, getHumanEnvPermission, userIsGroupManager, hasRemovePermission, userIsEnvOwner}