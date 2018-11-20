AccountsTemplates.configure({
  // Behavior
  confirmPassword: true,
  enablePasswordChange: true,
  forbidClientAccountCreation: false,
  overrideLoginErrors: false,
  sendVerificationEmail: false,
  lowercaseUsername: false,
  focusFirstInput: true,

  // Appearance
  showAddRemoveServices: false,
  showForgotPasswordLink: true,
  showLabels: true,
  showPlaceholders: true,
  showResendVerificationEmailLink: false,

  // Client-side Validation
  continuousValidation: true,
  negativeFeedback: false,
  negativeValidation: true,
  positiveValidation: true,
  positiveFeedback: true,
  defaultState: "signUp",
  showValidating: true,

  // Privacy Policy and Terms of Use
  // privacyUrl: 'privacy',
  // termsUrl: 'terms-of-use',

  // Redirects
  homeRoutePath: '/environmentList',
  redirectTimeout: 4000,
  //
  // // Hooks
  // onLogoutHook: myLogoutFunc,
  // onSubmitHook: mySubmitFunc,
  // preSignUpHook: myPreSubmitFunc,
  postSignUpHook: function() {
    // ga here.
  },

  // Texts
  texts: {
    button: {
      signUp: "Register Now!"
    },
    socialSignUp: "Register",
    title: {
      forgotPwd: "Recover Your Password",
      // enrollAccount: "Enroll Title",

    },

    signUpLink_pre: "Don't have an account already?",
    signUpLink_link: "Create one now!",
    errors: {
      loginForbidden: "Those details don't seem to be correct. Make sure your password is correct, or if you don't already have an account, you can create one now.",
    }
  },
});

AccountsTemplates.configureRoute('signIn', {
  name: 'login',
  path: '/login',
  template: 'login',
  layoutTemplate: 'layout',
  redirect: '/environmentList',
});

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
          if (!userExists) {
            self.setSuccess(false);
          }
          // self.setValidating(false);
          else {
            self.setError("User already exists");
          }
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

Template.login.events({
  'click .login-buttons__login': function(e) {
    console.log('ping');
    e.preventDefault();
    AccountsTemplates.setState('signIn');
  },
  'click .login-buttons__register': function(e) {
    e.preventDefault();
    AccountsTemplates.setState('signUp');
  },
})