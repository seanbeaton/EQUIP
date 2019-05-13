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
  continuousValidation: false,
  negativeFeedback: false,
  negativeValidation: true,
  positiveValidation: true,
  positiveFeedback: true,
  defaultState: "signIn",
  // showValidating: true,

  // Privacy Policy and Terms of Use
  privacyUrl: '/terms-of-use#privacy',
  termsUrl: '/terms-of-use',

  // Redirects
  homeRoutePath: '/dashboard',
  redirectTimeout: 4000,
  //
  // // Hooks
  onLogoutHook: function () {
    Router.go('landingPage');
  },
  onSubmitHook: function (error, state) {
    console.log('state', state);
    if (state === 'signUp') {
      gtag('event', 'signup', {'event_category': 'user'});
      console.log('signup');
    }
    else if (state === 'signIn') {
      console.log('signin');
      gtag('event', 'login', {'event_category': 'user'})
    }
  },
  // preSignUpHook: myPreSubmitFunc,
  postSignUpHook: function () {
    // ga here.
  },

  // Texts
  texts: {
    button: {
      signUp: "Register!",
      signIn: "Log in"
    },
    socialSignUp: "Register",
    title: {
      forgotPwd: "Recover Your Password",
      signIn: "Log in",
      signUp: "Create an account",
      // enrollAccount: "Enroll Title",

    },

    signInLink_pre: "Already have an account?",
    signInLink_link: "Log in now!",
    signUpLink_pre: "Don't have an account already?",
    signUpLink_link: "Create one now!",
    errors: {
      loginForbidden: "Those details don't seem to be correct. Make sure your password is correct, or if you don't already have an account, you can create one now.",
      mustBeLoggedIn: "Please log in to continue.",
    }
  },
});

AccountsTemplates.configureRoute('signIn', {
  name: 'login',
  path: '/login',
  template: 'login',
  layoutTemplate: 'layout',
  redirect: '/dashboard',
});

AccountsTemplates.configureRoute('signUp', {
  name: 'signup',
  path: '/sign-up',
  template: 'login',
  layoutTemplate: 'layout',
  redirect: '/dashboard',
});

AccountsTemplates.configureRoute('resetPwd', {
  name: 'resetpwd',
  path: '/reset-password',
  template: 'login',
  layoutTemplate: 'layout',
  redirect: '/dashboard',
});

AccountsTemplates.configureRoute('changePwd', {
  name: 'changepwd',
  path: '/change-password',
  template: 'login',
  layoutTemplate: 'layout',
  redirect: '/dashboard',
});

var pwd = AccountsTemplates.removeField('password');
AccountsTemplates.removeField('email');
AccountsTemplates.addFields([
  {
    _id: "username",
    type: "text",
    // continuousValidation: true,
    negativeValidation: true,
    positiveValidation: true,
    negativeFeedback: false,
    positiveFeedback: false,
    showValidating: false,
    displayName: "username",
    required: true,
    minLength: 5,
    func: function (value) {
      if (Meteor.isClient) {
        // console.log("Validating username...");
        var self = this;
        self.setSuccess();
        Meteor.call("userExists", value, function (err, userExists) {
          if (!userExists) {
            self.setSuccess();
            return true;
          }
          else {
            self.setError("User already exists");
            return false;
          }
        });
      }
      if (Meteor.isServer) {
        return Meteor.call("userExists", value);
      }
    },
  },
  {
    _id: 'email',
    type: 'email',
    required: true,
    continuousValidation: true,
    negativeValidation: true,
    positiveValidation: true,
    negativeFeedback: false,
    positiveFeedback: false,
    showValidating: false,
    displayName: "email",
    re: /.+@(.+){2,}\.(.+){2,}/,
    errStr: 'Invalid email',
    func: function (value) {
      if (Meteor.isClient) {
        var self = this;
        Meteor.call("emailExists", value, function (err, userExists) {
          if (!userExists) {
            self.setSuccess();
            return true;
          }
          // self.setValidating(false);
          else {
            self.setError("Email already exists");
            return false;
          }
        });
      }
      // Server
      if (Meteor.isServer) {
        return Meteor.call("userExists", value);
      }
    },
  },
  pwd,
  {
    _id: 'institution',
    type: 'text',
    required: true,
    displayName: 'Institution Name',
    placeholder: 'e.g., University of Northeast Alaska, Eastwood Unified School District'
  },
  {
    _id: 'role',
    type: 'text',
    required: true,
    displayName: 'Role',
    placeholder: 'e.g. teacher, developer, classroom consultant...',
  },
  {
    _id: 'intended_use',
    type: 'text',
    required: true,
    displayName: 'What are you planning on using EQUIP for?',
    placeholder: 'e.g. reducing bias in my classroom...',
  },
  {
    _id: 'how_did_you_hear',
    type: 'text',
    required: true,
    displayName: 'How did you hear about EQUIP?',
    placeholder: 'e.g. colleague, conference...',
  },
]);

Template.login.events({
  'click .login-buttons__login': function (e) {
    e.preventDefault();
    AccountsTemplates.setState('signIn');
  },
  'click .login-buttons__register': function (e) {
    e.preventDefault();
    AccountsTemplates.setState('signUp');
  },
})
