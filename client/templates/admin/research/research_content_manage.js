import {allowed_images} from "../../../../lib/collections/research_content";


Template.researchContentManage.helpers({
  researchContent: function () {
    return ResearchContent.find().fetch();
  },
  allowedImages: function() {
    return allowed_images.map(i => {return {path: `/research_images/${i}`, fileName: i}})
  },
  imageMatch: function(image, option) {
    return image === option
  }
});

Template.researchContentManage.events = {
  'click .research__add-new': function (e) {
    Meteor.call('researchContentInsert', {
      'researchAuthor': '',
      'researchTitle': '',
      'researchDateSort': '',
      'researchDateDisplay': '',
      'researchDescription': '',
      'researchLink': '',
      'researchCategorization': '',
      'researchImage': '',
      'published': true,
      'weight': 0,
    })
  },
  'click .research__save': function (e) {
    const rpid = $(e.target).attr('data-save-id');
    Meteor.call('researchContentUpdate', {
      'researchAuthor': $('#research__authors--' + rpid).val(),
      'researchTitle': $('#research__title--' + rpid).val(),
      'researchDateSort': $('#research__date-sort--' + rpid).val(),
      'researchDateDisplay': $('#research__date-display--' + rpid).val(),
      'researchDescription': $('#research__content--' + rpid).val(),
      'researchLink': $('#research__link--' + rpid).val(),
      'researchCategorization': $('#research__categorization--' + rpid).val(),
      'researchImage': $('input[name="research__image--' + rpid + '"]:checked').val(),
      'published': $('#research__published--' + rpid).is(':checked'),
      'weight' : parseInt($('#research__weight--' + rpid).val()),
      'rpid': rpid,
    })
  },
  'click .research__delete': function (e) {
    const rpid = $(e.target).attr('data-save-id');
    if (!confirm('Are you sure you want to delete this content?')) {
      return;
    }
    Meteor.call('researchContentDelete', {
      'rpid': rpid
    })
  },
}
