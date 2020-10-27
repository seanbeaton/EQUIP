import {allowed_images} from "../../../../lib/collections/research_content";


Template.researchContentManage.helpers({
  researchContent: function () {
    return ResearchContent.find().fetch();
  },
  allowedImages: function() {
    return allowed_images.map(i => `/research_images/${i}`)
  },
  imageIsActive: function(image, option) {
    return "/research_images/" + image === option
  }
});

Template.researchContentManage.events = {
  'click .research__add-new': function (e) {
    Meteor.call('researchContentInsert', {
      'researchAuthor': '',
      'researchTitle': '',
      'researchDescription': '',
      'researchLink': '',
      'researchCategorization': '',
      'researchImage': 'image_1.jpg',
    })
  },
  'click .research__save': function (e) {
    const rpid = $(e.target).attr('data-save-id');
    Meteor.call('researchContentUpdate', {
      'researchAuthor': $('#research__authors--' + rpid).val(),
      'researchTitle': $('#research__title--' + rpid).val(),
      'researchDescription': $('#research__content--' + rpid).val(),
      'researchLink': $('#research__link--' + rpid).val(),
      'researchCategorization': $('#research__categorization--' + rpid).val(),
      'researchImage': 'image_1.jpg',
      'rpid': rpid,
    })
  },
  'click .research__delete': function (e) {
    const rpid = $(e.target).attr('data-save-id');
    if (!Window.confirm('Are you sure you want to delete this content?')) {
      return;
    }
    Meteor.call('researchContentDelete', {
      'rpid': rpid
    })
  },
}
