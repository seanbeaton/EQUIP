// Template.environmentSelect.helpers({
//   environments: function() {
//     let envs = Environments.find().fetch();
//     // let default_set = false;
//     envs = envs.map(function(env) {
//       let obsOpts = getObsOptions(env._id);
//       //console.log('obs_opts', obsOpts);
//       if (obsOpts.length === 0) {
//         env.envName += ' (no observations)';
//         env.disabled = 'disabled';
//       }
//       else if (obsOpts.length < 2) {
//         env.envName += ' (' + obsOpts.length + ')';
//         env.disabled = 'disabled';
//       }
//       // else if (!default_set) {
//       // default_set = true;
//       // env.default = 'selected';
//       // }
//       return env
//     });
//     return envs;
//   },
// })
//
//
// let getObsOptions = function(envId) {
//   if (!!envId) {
//     let obs = Observations.find({envId: envId}).fetch();
//     return Observations.find({envId: envId}).fetch();
//   }
//   else {
//     return false;
//   }
// }