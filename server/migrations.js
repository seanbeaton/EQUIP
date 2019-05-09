
Meteor.startup(function() {
  Migrations.migrateTo('latest');
});


Migrations.add({
  version: 1,
  name: 'Adds date field to all observations',
  up: function () {
    Observations.find().forEach(function(res) {
      console.log('res', res);
      if (typeof res.observationDate === 'undefined') {
        let subDate = new Date(Date.parse(res.submitted));
        console.log('subDate', subDate);
        function pad(number) {
          if (number < 10) {
            return '0' + number;
          }
          return number;
        }

        res.observationDate = subDate.getFullYear() + '-' +
          pad(subDate.getMonth() + 1) + '-' +
          pad(subDate.getDate());

        Observations.update({'_id': res._id}, {$set: {'lastModified': new Date(), 'observationDate': res.observationDate}});
      }

    })
  },
});

Migrations.add({
  version: 2,
  name: 'Adds observation type field to all observations',
  up: function () {
    Observations.update({}, {$set: {"observationType": 'whole_class'}}, {multi:true});
  },
});

Migrations.add({
  version: 3,
  name: 'Adds either the absent or small_group arrays to observations',
  up: function () {
    Observations.update({observationType: 'whole_class'}, {$set: {"absent": []}}, {multi:true});
    Observations.update({observationType: 'small_group'}, {$set: {"small_group": []}}, {multi:true});
  },
});
