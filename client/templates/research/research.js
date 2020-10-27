Template.research.helpers({
  researchContent: function () {
    return ResearchContent.find().fetch();
  },
});
