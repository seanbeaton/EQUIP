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


export {getHumanEnvPermission, userIsGroupManager, hasRemovePermission}