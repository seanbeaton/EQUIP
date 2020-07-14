import {userIsGroupMember, getHumanEnvPermission, hasRemovePermission, userIsEnvOwner} from "/helpers/groups";
import {console_log_conditional} from "/helpers/logging"

Template.groupView.helpers({
  group: function() {
    return this.group;
  },
  myRole: function(group) {
    return group.members.find(u => u.userId === Meteor.userId()).roles.join(', ')
  },
  getEnvOwner: function(envId) {
    let ownerId = Environments.findOne({_id: envId}).userId;
    return Meteor.users.findOne({_id: ownerId}).username;
  },
  getEnvName: function(envId) {
    console_log_conditional('getEnvName', envId);
    return Environments.findOne({_id: envId}).envName
  },
  isEnvOwner: function(envId) {
    return userIsEnvOwner(envId);
  },
  getHumanEnvPermission(perm) {
    return getHumanEnvPermission(perm);
  },
  hasRemovePermission(env) {
    console_log_conditional('env', env);
    return hasRemovePermission(env.envId, this.group);
  }
});


Template.groupView.onCreated(function() {
  console_log_conditional('this before', this.data);
  let group_ids = this.data.group.environments.map(env => env.envId);
  console_log_conditional('ret', group_ids)
  this.data.environments = Environments.find({_id: {$in: group_ids}}).fetch()
  console_log_conditional('this', this.data);
})

Template.envShareTypeChanger.helpers({
  viewChecked: function() {
    return this.env.share_type === 'view' ? 'checked' : ''
  },
  editChecked: function() {
    return this.env.share_type === 'edit' ? 'checked' : ''
  },
  getHumanEnvPermission(perm) {
    return getHumanEnvPermission(perm)
  },
})

Template.envShareTypeChanger.events = {
  'click input[type="radio"]': function(e, template) {
    Meteor.call('changeGroupEnvPermission', this.group._id, this.env.envId, $(e.target).attr('data-share-type'))
  }
}

Template.envAddForm.helpers({
  autocompleteSettings: function() {
    return {
      position: "bottom",
      limit: 5,
      rules: [
        {
          collection: 'autocompleteEnvironments',
          subscription: 'autocompleteEnvironments',
          field: 'envName',
          template: Template.envAutocompleteOption,
          noMatchTemplate: Template.noAutocompleteAvailable,
          selector: function(match) {
            let regex = new RegExp(match, 'i');
            return {
              $or: [ {
                'envName': regex
              }
              ]
            };
          },
        }
      ]
    }
  },
  getHumanEnvPermission(perm) {
    return getHumanEnvPermission(perm)
  },
})

Template.groupView.events = {
  'autocompleteselect .environment-add-form__input': function(e, template, doc) {
    let share_type = $('input[name="env-share-type"]:checked').attr('data-share-type')
    console.log('addenv', doc, doc._id, template.data.group._id)
    Meteor.call('addEnvToGroup', doc._id, template.data.group._id, share_type)
    $('.environment-add-form__input').val('');
    // Meteor.subscribe('groupEnvironments', template.data.group._id);
  }
}

Template.removeEnvButton.events = {
  'click .remove-env-from-group': function(e, template, doc) {
    console_log_conditional('temp, doc', template, doc);
    Meteor.call('removeEnvFromGroup', template.data.env.envId, template.data.group._id)
  }
}