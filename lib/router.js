/*
* JS ironRouter file - Using ironRouter package
* Handles all routes, redirects, data contexts, and subscriptions to publications
* Publications are handled in ../server/publications.js
*/

// Router setup with subscriptions and defaults
Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  waitOn: function() {
      return [Meteor.subscribe('environments'), Meteor.subscribe('observations'),
      Meteor.subscribe('subjects'), Meteor.subscribe('sequences'),
      Meteor.subscribe('subject_parameters'), Meteor.subscribe('sequence_parameters'),
        // Meteor.subscribe('shared_environments')
      ]
  },
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
//   homeRoutePath: '/environmentList',
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
Router.route('/terms-of-use', {name: 'terms'});
Router.route('/environmentList',
  { name: 'environmentList',
    data: function() {return Environments.find(); }
    });

Router.route('/subjectParameters/:_envId',
  {name: 'subjectParameters'});

Router.route('/subjectParameters/:_envId/sequenceParameters/:_subjParamsId',
  {name: 'sequenceParameters'}
  );

Router.route('/editSubjectParameters/:_envId',
  {name: 'editSubjectParameters'});

Router.route('/editSequenceParameters/:_envId',
  {name: 'editSequenceParameters'});

Router.route('/viewData', {
   name: 'viewData',
   data: function() { return Sequences.find();}
});

Router.route('/environment/:_envId/editSubjects', {
  name: 'editSubjects',
  data: function() { return Environments.findOne(this.params._envId); }
});

Router.route('/environment/:_envId/observatory/:_obsId', {
  name: 'observatory',
  data: function() { return Observations.findOne(this.params._obsId); }
});

Router.route('/share/env/:_shareId', {
  name: 'sharedEnv',
  waitOn: function() {
    return Meteor.subscribe('shared_environments')
  },
  data: function() {
    let shareId = this.params._shareId;
    return SharedEnvironments.findOne({_id: shareId});
  }
});

Router.route('/share/env/:_shareId/save', {
  name: 'sharedEnvSave',
  waitOn: function() {
    return Meteor.subscribe('shared_environments')
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
      console.log('enxt');
      this.next()

    } else {
      console.log('denied');

      return Router.go('accessDenied')
    }
  },  // end authenticate
}  // end filters

Router.route('/admin', {
  before: filters.admin_only,
  name: 'admin',
});

Router.route('/admin/site-stats', {
  before: filters.admin_only,
  name: 'siteStats',
  waitOn: function () {
    console.log('waiting');
    return [
      Meteor.subscribe('users'),
      Meteor.subscribe('allEnvs'),
      Meteor.subscribe('allObs'),
      Meteor.subscribe('allSubjectsAndParams'),
      Meteor.subscribe('allSeqs'),
    ]
  }
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
  ]
});