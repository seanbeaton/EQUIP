const groupNameEditActive = ReactiveVar(false);

Template.groupNameEditable.helpers({
  editing: function() {
    return groupNameEditActive.get()
  }
})

Template.groupNameEditable.events({
  'click .group__name--start-edit': function(e) {
    groupNameEditActive.set(true);
  },
  'submit .group__name__edit-form': function(e) {
    e.preventDefault();
    let $group_name = $('.group__name__edit-field');
    if (!$group_name.val()) {
      alert('Invalid group name');
      return;
    }
    Meteor.call('groupEdit', {gid: this.group._id, groupName: $group_name.val()}, function(err, res) {
      groupNameEditActive.set(false);
    })
  }
})

Template.groupManage.helpers({
  group: function() {
    return this
  },
  myRole: function(group) {
    return group.members.find(u => u.userId === Meteor.userId()).roles.join(', ')
  },
  getUserDetails: function(user) {
    return {
      'roles': getUserRoles(user, this),
      'username': Meteor.users.findOne({_id: user.userId}).username
    }
  },
  getUserName: function(user) {
    let u = Meteor.users.findOne({_id: user.userId});
    if (u) {
      return u.username;
    }
    else {
      return false
    }
  },
  getGroupMembership: function(user, role) {
    return getUserRoles(user.userId, this)[role] === true;
  },
  memberRemovalAllowed: function(member) {
    return memberRemovalAllowed(member, this)
  }
});

Template.memberPermissionCheckbox.helpers({
  getGroupMembershipChecked: function(user, role) {
    return getUserRoles(user.userId, this.group)[role] === true ? 'checked' : '';
  },
  getGroupMembershipCheckDisabled: function(user, role) {
    // todo: possible future improvement, use the same permissions check function here and on the backend.
    let roles = getUserRoles(user.userId, this.group);
    let own_roles = currentUserRoles(this.group);
    if (!own_roles.admin && !own_roles.manage) {
      return 'disabled'
    }
    else if (role === 'manage' && (roles.admin === true || !own_roles.admin)) {
      return 'disabled';
    }
    else if (role === 'edit' && roles.manage === true) {
      return 'disabled'
    }
    else if (role === 'view' && roles.edit === true) {
      return 'disabled'
    }
    else if (role === 'view' && roles.view === true) {
      return 'disabled'
    }
    else {
      return ''
    }
  },
})

Template.memberPermissionCheckbox.events = {
  'change .permission-checkbox': function(e) {
    let tar = $(e.target);
    let role = this.checkboxtype;
    let uid = this.member.userId;
    let gid = this.group._id;

    if (tar.prop('checked')) {
      console.log('adding role', role, 'to user', uid);
      Meteor.call('addRoleToUser', uid, gid, role)
    }
    else {
      console.log('removing role', role, 'from user', uid);
      Meteor.call('removeRoleFromUser', uid, gid, role)
    }
  }
}

let memberRemovalAllowed = function(member, group) {
  let member_roles = getUserRoles(member.userId, group);
  if (member.userId === Meteor.userId()) {
    return false;
  }
  if (member_roles['admin'] === true) {
    return false;
  }
  if (member_roles['manage'] && !currentUserRoles(group)['admin']) {
    return false;
  }
  return currentUserRoles(group)['manage'];
}

Template.memberAddForm.events = {
  'submit .member-add-form': function(e) {
    let $user = $('.member-add-form__input');
    e.preventDefault();
    if (!$user.val()) {
      alert('group name required');
      return;
    }
    Meteor.call('addUserToGroup', $user.val(), this._id, addUserHandler)
    $user.val('');
  },
  'autocompleteselect .member-add-form__input': function(e, template, doc) {
    Meteor.call('addUserToGroup', doc._id, template.data.group._id, addUserHandler)
    $('.member-add-form__input').val('');
    // Meteor.subscribe('groupUsers', template.data.group._id);
  }
}

let addUserHandler = function(error, result) {
  if (error) {
    console.log('Error:', error);
    if (error.error === 500) {
      alert('Invalid user')
    }
    else {
      alert(error.reason);
    }
  }
}

Template.memberAddForm.helpers({
  settings: function() {
    return {
      position: "bottom",
      limit: 5,
      rules: [
        {
          collection: 'autocompleteUsers',
          subscription: 'autocompleteUsers',
          field: 'username',
          template: Template.userAutocompleteOption,
          noMatchTemplate: Template.noAutocompleteAvailable,
          selector: function(match) {
            let regex = new RegExp(match, 'i');
            return {
              $or: [ {
                  'username': regex
                }
              ]
            };
          },
        }
      ]
    }
  }
})

Template.memberRemoveButton.events = {
  'click .member-remove-button': function(e) {
    Meteor.call('removeUserFromGroup', this.member.userId, this.group._id)
  }
}

Template.memberAddForm.rendered = function() {
  // console.log('hello');
}

let currentUserRoles = function(group) {
  return getUserRoles(Meteor.userId(), group)
}

let getUserRoles = function(userId, group) {
  let default_roles = {
    'admin': false,
    'manage': false,
    'edit': false,
    'view': false,
  }

  let member_roles = group.members.find(u => u.userId === userId);
  if (member_roles) {
    member_roles.roles.forEach(function(role) {
      default_roles[role] = true;
    })
  }

  if (default_roles.admin) {
    default_roles.manage = true;
  }
  if (default_roles.manage) {
    default_roles.edit = true;
  }
  if (default_roles.edit) {
    default_roles.view = true;
  }

  return default_roles;
}


Template.noAutocompleteAvailable.helpers({
  searchTextLengthCheck: function(searchText) {
    return searchText.length >= 3
  }
})