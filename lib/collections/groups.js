
import {hasRemovePermission} from "/helpers/groups";


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
      lastModified: new Date(),
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
        members: {
          userId: uid,
          roles: [role],
          submitted: new Date(),
          lastModified: new Date()
        }
      },
      $set: {
        "lastModified": new Date()
      }
    })
  },

  addEnvToGroup: function(envid, gid, share_type) {
    let group = Groups.findOne({_id: gid});

    //todo: add access control

    // if (!group ||
    //   !group.members
    //     .find(m => m.userId === Meteor.userId())
    //     .roles.some(r => ['manage', 'admin'].includes(r))) {
    //   throw new Meteor.Error('403', 'Group not found or no permissions')
    // }
    // if (typeof share_type === 'undefined') {
    //   share_type = 'view';
    // }
    Groups.update({_id: gid}, {
      $addToSet: {
        environments: {
          envId: envid,
          share_type: share_type,
          submitted: new Date(),
          lastModified: new Date()
        }
      },
      $set: {
        "lastModified": new Date()
      }
    })
  },

  removeEnvFromGroup: function(envid, gid) {
    let group = Groups.findOne({_id: gid});

    if (!hasRemovePermission(envid, group)) {
      throw new Meteor.Error('403', 'Group not found or no permissions')
    }

    Groups.update({_id: gid}, {
      $pull: {
        environments: {
          envId: envid,
        }
      },
      $set: {
        "lastModified": new Date()
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
      },
      $set: {
        "lastModified": new Date()
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
          },
          $set: {
            "members.$[u].lastModified": new Date()
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
          },
          $set: {
            "members.$[u].lastModified": new Date()
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