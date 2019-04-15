
Groups = new Mongo.Collection('groups');

Meteor.methods({
  groupInsert: function(postAttributes) {
    if (typeof postAttributes === 'undefined') {
      postAttributes = {};
    }

    let user = Meteor.user();
    let params = _.extend(postAttributes, {
      ownerId: user._id,
      ownerName: user.username,
      submitted: new Date(),
      lastModifiedParam: new Date(),
      lastModifiedObs: new Date(),
      groupName: 'default_group_name',
      members: [{userId: user._id, roles: ['admin']}],
      environments: []
    });

    let gid = Groups.insert(params);

    return {
      _id: gid
    };
  },

  addUserToGroup: function(uid, gid, role) {
    //todo: verify user+group exist
    let group = Groups.findOne({_id: gid});
    if (!group ||
      !group.members
        .find(m => m.userId === Meteor.userId())
        .roles.some(r => ['manage', 'admin'].includes(r))) {
      throw new Meteor.Error('403', 'Group not found or no permissions')
    }
    if (typeof role === 'undefined') {
      role = 'view';
    }
    Groups.update({_id: gid}, {
      $addToSet: {
        members: {userId: uid, roles: [role]}
      }
    })
  },

  removeUserFromGroup: function(uid, gid) {
    //todo: verify user+group exist

    let group = Groups.findOne({_id: gid});
    let user_roles = group.members.find(m => m.userId === Meteor.userId()).roles;
    let target_roles = group.members.find(m => m.userId === uid).roles;
    if (!group ||
      !user_roles.some(r => ['manage', 'admin'].includes(r)) ||
      target_roles.includes('admin') ||
      (target_roles.includes('manage') && !user_roles.includes('admin'))
    ) {
      throw new Meteor.Error('403', 'Group not found or no permissions')
    }
    //todo add access control
    Groups.update({_id: gid}, {
      $pull: {
        "members": {userId: uid}
      }
    })
  },

  removeRoleFromUser: function(uid, gid, role) {
    //todo: verify user+group exist
    // todo test these permissions
    let group = Groups.findOne({_id: gid});
    let user_roles = group.members.find(m => m.userId === Meteor.userId()).roles;
    let target_roles = group.members.find(m => m.userId === uid).roles;
    if (!group ||
      !user_roles.some(r => ['manage', 'admin'].includes(r)) ||
      target_roles.includes('admin') ||
      (target_roles.includes('manage') && !user_roles.includes('admin')) ||
      ((role === 'admin' || role === 'manage') && !user_roles.includes('admin'))
    ) {
      throw new Meteor.Error('403', 'Group not found or no permissions')
    }

    if (role === 'view') {
      throw new Meteor.Error('403', "Can't remove view permissions, remove user from the group instead")
    }

    if (Meteor.isServer) {
      Groups.rawCollection().update({_id: gid}, {
          $pull: {
            "members.$[u].roles": role
          }
        },
        {
          multi: true,
          arrayFilters: [
            { "u.userId": uid },
          ],
        })
    }
  },

  addRoleToUser: function(uid, gid, role) {
    // todo test these permissions
    //todo: verify user+group exist

    let group = Groups.findOne({_id: gid});
    let user_roles = group.members.find(m => m.userId === Meteor.userId()).roles;
    let target_roles = group.members.find(m => m.userId === uid).roles;
    if (!group ||
      !user_roles.some(r => ['manage', 'admin'].includes(r)) ||
      target_roles.includes('admin') ||
      (target_roles.includes('manage') && !user_roles.includes('admin')) ||
      ((role === 'admin' || role === 'manage') && !user_roles.includes('admin'))
    ) {
      throw new Meteor.Error('403', 'Group not found or no permissions')
    }

    if (Meteor.isServer) {
      Groups.rawCollection().update({_id: gid}, {
          $addToSet: {
            "members.$[u].roles": role
          }
        },
        {
          multi: true,
          arrayFilters: [
            { "u.userId": uid },
          ],
        })
    }
  }


})