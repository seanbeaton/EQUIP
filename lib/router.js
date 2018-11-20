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
      Meteor.subscribe('subject_parameters'), Meteor.subscribe('sequence_parameters')]
  },
  onAfterAction: function() {
      window.scrollTo(0,0);
  }
});

AccountsTemplates.configure({
  defaultLayout: 'layout',
});

AccountsTemplates.configureRoute('signIn', {
  name: 'login',
  path: '/login',
  template: 'login',
  layoutTemplate: 'layout',
  redirect: '/environmentList',
});


// AccountsTemplates.addField({
//   _id: 'username',
//   type: 'text',
//   required: true,
//   func: function(value){
//     if (Meteor.isClient) {
//       // console.log("Validating username...");
//       var self = this;
//       Meteor.call("userExists", value, function(err, userExists){
//         if (!userExists)
//           self.setSuccess();
//         else
//           // self.setError("User already exists");
//         self.setValidating(false);
//       });
//       return;
//     }
//     // Server
//     return Meteor.call("userExists", value);
//   },
// });


var pwd = AccountsTemplates.removeField('password');
AccountsTemplates.removeField('email');
AccountsTemplates.addFields([
  {
    _id: "username",
    type: "text",
    displayName: "username",
    required: true,
    minLength: 5,
    func: function(value){
      if (Meteor.isClient) {
        // console.log("Validating username...");
        var self = this;
        Meteor.call("userExists", value, function(err, userExists){
          if (!userExists)
            self.setSuccess();
          else
          // self.setError("User already exists");
            self.setValidating(false);
        });
        return;
      }
      // Server
      return Meteor.call("userExists", value);
    },
  },
  {
    _id: 'email',
    type: 'email',
    required: true,
    displayName: "email",
    re: /.+@(.+){2,}\.(.+){2,}/,
    errStr: 'Invalid email',
  },
  pwd
]);


// All available API Routes

Router.route('/', {name: 'landingPage'});
Router.route('/about', {name: 'aboutPage'});
Router.route('/help', {name: 'help'});
Router.route('/faq', {name: 'faq'});
// Router.route('/login', {name: 'login'});
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
