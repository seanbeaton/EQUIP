Template.research.helpers({
  researchContentCategorized: function () {
    let content = ResearchContent.find({'published': true}, {
      'sort': [['researchDateSort', 'desc'], ['weight', 'asc']]
    }).fetch();

    let categories = [];
    content.forEach(function(ct) {
      let cat_index = categories.findIndex(cat => cat.category_name === ct.researchCategorization)
      if (cat_index === -1) {
        categories.push({
          'category_name': ct.researchCategorization,
          'children': [ct],
        })
      }
      else {
        categories[cat_index].children.push(ct)
      }
    })

    console.log('content', content);
    return categories.sort((a, b) => b.category_name < a.category_name);
  },
});
