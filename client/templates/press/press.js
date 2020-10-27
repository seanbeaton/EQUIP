Template.press.helpers({
  pressContent: function () {
    return PressContent.find({'published': true}, {
      'sort': [['pressDateSort', 'desc'], ['weight', 'asc']]
    }).fetch();
  },
});
