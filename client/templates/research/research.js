Template.research.helpers({
  researchContent: function () {
    return ResearchContent.find({'published': true}, {
      'sort': [['researchDateSort', 'desc'], ['weight', 'asc']]
    }).fetch();
  },
});
