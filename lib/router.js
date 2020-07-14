/*
* JS ironRouter file - Using ironRouter package
* Handles all routes, redirects, data contexts, and subscriptions to publications
* Publications are handled in ../server/publications.js
*/
import {console_log_conditional} from "/helpers/logging"

// Router setup with subscriptions and defaults
Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  onAfterAction: function() {
      window.scrollTo(0,0);
  }
});

AccountsTemplates.configure({
  defaultLayout: 'layout',
});
//
// AccountsTemplates.configure({
//   // Behavior
//   confirmPassword: true,
//   enablePasswordChange: true,
//   forbidClientAccountCreation: false,
//   overrideLoginErrors: false,
//   sendVerificationEmail: false,
//   lowercaseUsername: false,
//   focusFirstInput: true,
//
//   // Appearance
//   showAddRemoveServices: false,
//   showForgotPasswordLink: true,
//   showLabels: true,
//   showPlaceholders: true,
//   showResendVerificationEmailLink: false,
//
//   // Client-side Validation
//   continuousValidation: true,
//   negativeFeedback: false,
//   negativeValidation: true,
//   positiveValidation: true,
//   positiveFeedback: true,
//   defaultState: "signIn",
//   showValidating: false,
//
//   // Privacy Policy and Terms of Use
//   // privacyUrl: 'privacy',
//   // termsUrl: 'terms-of-use',
//
//   // Redirects
//   homeRoutePath: '/dashboard',
//   redirectTimeout: 4000,
//   //
//   // // Hooks
//   // onLogoutHook: myLogoutFunc,
//   // onSubmitHook: mySubmitFunc,
//   // preSignUpHook: myPreSubmitFunc,
//   postSignUpHook: function() {
//     // ga here.
//   },
//
//   // Texts
//   texts: {
//     button: {
//       signUp: "Register Now!"
//     },
//     socialSignUp: "Register",
//     title: {
//       forgotPwd: "Recover Your Password",
//       // enrollAccount: "Enroll Title",
//
//     },
//
//     signUpLink_pre: "Don't have an account already?",
//     signUpLink_link: "Create one now!",
//     errors: {
//       loginForbidden: "Those details don't seem to be correct. Make sure your password is correct, or if you don't already have an account, you can create one now.",
//     }
//   },
// });
//

// All available API Routes

Router.route('/', {name: 'landingPage'});
Router.route('/about', {name: 'aboutPage'});
Router.route('/help', {name: 'help'});
Router.route('/faq', {name: 'faq'});
Router.route('/press', {name: 'press'});
Router.route('/research', {name: 'research'});
Router.route('/terms-of-use', {name: 'terms'});
Router.route('/dashboard', {
  name: 'environmentList',
  data: function() {
    return {
      environments: Environments.find({}, {sort: {submitted: -1}}).fetch()
    }
  },
  waitOn: function() {
    return [
      Meteor.subscribe('environments'),
      Meteor.subscribe('observations'),
      Meteor.subscribe('subjects'),
      // Meteor.subscribe('sequences'),
      Meteor.subscribe('subjectParameters'),
      Meteor.subscribe('sequenceParameters'),

      Meteor.subscribe('groupEnvironments'),
      Meteor.subscribe('groupObservations'),
      Meteor.subscribe('groupSubjects'),
      Meteor.subscribe('groupSubjectParameters'),
      Meteor.subscribe('groupSequenceParameters'),
    ]
  }
});

Router.route('/editSubjectParameters/:_envId', {
  name: 'editSubjectParameters',
  data: function() {
    return {
      environment: Environments.findOne(this.params._envId)
    }
  },
  waitOn: function() {
    return [
      Meteor.subscribe('environment', this.params._envId),
      Meteor.subscribe('envObservations', this.params._envId),
      Meteor.subscribe('envSequenceParameters', this.params._envId),
      Meteor.subscribe('envSubjectParameters', this.params._envId),
    ]
  }
});

Router.route('/editSequenceParameters/:_envId', {
  name: 'editSequenceParameters',
  data: function() {
    return {
      environment: Environments.findOne(this.params._envId)
    }
  },
  waitOn: function() {
    return [
      Meteor.subscribe('environment', this.params._envId),
      Meteor.subscribe('envObservations', this.params._envId),
      Meteor.subscribe('envSequenceParameters', this.params._envId),
    ]
  }
});

Router.route('/reports', {
  name: 'reportsSelection',
});
//
// Router.route('/reports/static', {
//   name: 'staticReport',
//   data: function() { return Sequences.find();},
//   waitOn: function() {
//     return [
//       Meteor.subscribe('environments'),
//       Meteor.subscribe('observations'),
//       Meteor.subscribe('sequences'),
//       Meteor.subscribe('subjects'),
//       Meteor.subscribe('subjectParameters'),
//       Meteor.subscribe('sequenceParameters'),
//
//       // Meteor.subscribe('groups'),
//       //
//       // Meteor.subscribe('groupEnvironments'),
//       // Meteor.subscribe('groupObservations'),
//       // Meteor.subscribe('groupSubjects'),
//       // Meteor.subscribe('groupSequences'),
//       // Meteor.subscribe('groupSubjectParameters'),
//       // Meteor.subscribe('groupSequenceParameters'),
//     ]
//   }
// });

Router.route('/reports/interactive', {
  name: 'interactiveReport',
});

Router.route('/reports/timeline', {
  name: 'timelineReport',
});

Router.route('/reports/heatmap', {
  name: 'heatmapReport',
});

Router.route('/reports/histogram', {
  name: 'histogramReport',
});

Router.route('/reports/group-work', {
  name: 'groupWorkReport',
});

Router.route('/environment/:_envId', {
  name: 'environmentSingle',
  data: function() { return {'envId': this.params._envId} },
});

Router.route('/environment/:_envId/subjects', {
  name: 'editSubjects',
  data: function() { return Environments.findOne(this.params._envId); },
  waitOn: function () {
    return [
      Meteor.subscribe('environment', this.params._envId),
      Meteor.subscribe('envSubjects', this.params._envId),
      Meteor.subscribe('envSubjectParameters', this.params._envId),

      Meteor.subscribe('groups'),

      Meteor.subscribe('groupEnvironment', this.params._envId),
      Meteor.subscribe('groupEnvSubjects', this.params._envId),
      Meteor.subscribe('groupEnvSubjectParameters', this.params._envId),
    ]
  }
});

Router.route('/environment/:_envId/subjects-advanced', {
  name: 'editSubjectsAdvanced',
  waitOn: function() {
    return [
      Meteor.subscribe('environment', this.params._envId),
      Meteor.subscribe('envSubjects', this.params._envId),
      Meteor.subscribe('envSubjectParameters', this.params._envId),
    ]
  },
  data: function() {
    return {
      environment: Environments.findOne(this.params._envId)
    };
  }
});

Router.route('/environment/:_envId/observatory/:_obsId', {
  name: 'observatory',
  waitOn: function() {
    return [
      Meteor.subscribe('envSubjectParameters', this.params._envId),
      Meteor.subscribe('envSequenceParameters', this.params._envId),
      Meteor.subscribe('observation', this.params._obsId),
      Meteor.subscribe('envSubjects', this.params._envId),
      Meteor.subscribe('obsSequences', this.params._obsId),
      Meteor.subscribe('environment', this.params._envId),

      // Meteor.subscribe('groups'),
      //
      Meteor.subscribe('groupEnvironment', this.params._envId),
      Meteor.subscribe('groupObservation', this.params._obsId),
      Meteor.subscribe('groupEnvSubjects', this.params._envId),
      Meteor.subscribe('groupObsSequences', this.params._obsId),
      Meteor.subscribe('groupEnvSubjectParameters', this.params._envId),
      Meteor.subscribe('groupEnvSequenceParameters', this.params._envId),
    ];
  },
  data: function() {
    return {
      obsId: this.params._obsId,
      envId: this.params._envId,
    }
  }
});

// todo: create an env standalone page for items being shared;

Router.route('/share/env/:_shareId', {
  name: 'sharedEnv',
  waitOn: function() {
    let shareId = this.params._shareId;
    return Meteor.subscribe('shared_environments', shareId)
  },
  data: function() {
    let shareId = this.params._shareId;
    return SharedEnvironments.findOne({_id: shareId});
  }
});


let filters = {
  admin_only: function () {
    let user = Meteor.user();

    if (user && Roles.userIsInRole(user, 'admin', 'site')) {
      this.next()
    } else {
      Router.go('accessDenied')
    }
  },  // end authenticate
}  // end filters

Router.route('/groups', {
  name: 'groupsList',
  before: filters.admin_only,
  waitOn: function() {
    return Meteor.subscribe('groups')
  },
  data: function() {
    return Groups.find();
  }
});

Router.route('/groups/:_groupId/view', {
  name: 'groupView',
  before: filters.admin_only,
  waitOn: function() {
    return [
      Meteor.subscribe('groups', this.params._groupId),
      Meteor.subscribe('groupUsers', this.params._groupId),
      Meteor.subscribe('groupEnvs', this.params._groupId),
      Meteor.subscribe('environments'),
    ]
  },
  data: function() {
    return {group: Groups.findOne({_id: this.params._groupId}), environments: null}
  }
});

Router.route('/groups/:_groupId/manage', {
  name: 'groupManage',
  before: filters.admin_only,
  waitOn: function() {
    return [
      Meteor.subscribe('groups', this.params._groupId),
      Meteor.subscribe('groupUsers', this.params._groupId),
      Meteor.subscribe('autocompleteUsers', this.params._groupId),
    ]
  },
  data: function() {
    return Groups.findOne({_id: this.params._groupId});
  }
});

Router.route('/share/env/:_shareId/save', {
  name: 'sharedEnvSave',
  waitOn: function() {
    let shareId = this.params._shareId;
    return Meteor.subscribe('shared_environments', shareId)
  },
  data: function() {
    let shareId = this.params._shareId;
    return SharedEnvironments.findOne({_id: shareId});
  }
});


Router.route('/admin', {
  before: filters.admin_only,
  name: 'admin',
});

Router.route('/admin/site-stats', {
  before: filters.admin_only,
  name: 'siteStats',
});

Router.route('/admin/site-stats-time', {
  before: filters.admin_only,
  name: 'siteStatsTime',
});

Router.route('/404', {
  name: 'pageNotFound',
});

Router.route('/403', {
  name: 'accessDenied',
});

Router.plugin('ensureSignedIn', {
  except: [
    'home',
    'landingPage',
    'aboutPage',
    'help',
    'sharedEnv',
    'faq',
    'terms',
    'privacy',
    'changepwd',
    'resetpwd',
    'signup',
    'login',
    'pageNotFound',
    'accessDenied',
    'press',
  ]
});