/*
* JS MongoDB collection init and methods file
* Groups
*/

import {checkAccess} from "../../helpers/access";

Groups = new Mongo.Collection('groups');

import {hasRemovePermission, userIsEnvOwner, userIsGroupMember} from "/helpers/groups";
import SimpleSchema from "simpl-schema";

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

  addUserToGroup: function(uid, gid) {
    checkAccess(gid, 'group', 'manage');

    if (userIsGroupMember(gid, uid)) {
      throw new Meteor.Error('422', "This user is already part of the group.")
    }
    Groups.update({_id: gid}, {
      $addToSet: {
        members: {
          userId: uid,
          roles: ['view'],
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
    new SimpleSchema({
      share_type: {
        type: String,
        allowedValues: ['view', 'edit']
      },
      gid: String,
      envId: String,
    }).validate({envId: envid, gid: gid, share_type: share_type});
    checkAccess(gid, 'group', 'view');
    checkAccess(envid, 'environment', 'admin');

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
    new SimpleSchema({
      gid: String,
      envId: String,
    }).validate({envId: envid, gid: gid});

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

  changeGroupEnvPermission: function(gid, envid, share_type) {
    // let group = Groups.findOne({_id: gid});
    new SimpleSchema({
      gid: String,
      envId: String,
      share_type: {
        type: String,
        allowedValues: ['view', 'edit']
      }
    }).validate({envId: envid, gid: gid, share_type: share_type});
    checkAccess(envid, 'environment', 'admin')
    checkAccess(gid, 'group', 'view');

    // if (!userIsGroupMember(gid) || !userIsEnvOwner(envid)) {
    //   throw new Meteor.Error('403', 'Group not found or no permissions')
    // }

    if (Meteor.isServer) {
      Groups.rawCollection().update({_id: gid}, {
          $set: {
            'environments.$[env].share_type': share_type,
            "lastModified": new Date()
          },
        },
        {
          multi: true,
          arrayFilters: [
            {"env.envId": envid},
          ],
        })
    }
  },

  removeUserFromGroup: function(uid, gid) {
    new SimpleSchema({
      uid: String,
      gid: String,
    }).validate({uid: uid, gid: gid});
    checkAccess(gid, 'group', 'manage');

    let group = Groups.findOne({_id: gid});
    let user_roles = group.members.find(m => m.userId === Meteor.userId()).roles;
    let target_roles = group.members.find(m => m.userId === uid).roles;

    if (target_roles.includes('admin') ||
      (target_roles.includes('manage') && !user_roles.includes('admin'))) {
      throw new Meteor.Error('403', 'Insufficient permissions to perform the requested action.')
    }
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
    new SimpleSchema({
      uid: String,
      gid: String,
      role: {
        type: String,
        allowedValues: ['view', 'edit', 'manage', 'admin']
      }
    }).validate({uid: uid, gid: gid, role: role});
    checkAccess(gid, 'group', 'manage')

    let group = Groups.findOne({_id: gid});
    let user_roles = group.members.find(m => m.userId === Meteor.userId()).roles;
    let target_roles = group.members.find(m => m.userId === uid).roles;
    if (target_roles.includes('admin') ||
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
    new SimpleSchema({
      uid: String,
      gid: String,
      role: {
        type: String,
        allowedValues: ['view', 'edit', 'manage', 'admin']
      }
    }).validate({uid: uid, gid: gid, role: role});
    checkAccess(gid, 'group', 'manage')

    let group = Groups.findOne({_id: gid});
    let user_roles = group.members.find(m => m.userId === Meteor.userId()).roles;
    let target_roles = group.members.find(m => m.userId === uid).roles;
    if (target_roles.includes('admin') ||
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