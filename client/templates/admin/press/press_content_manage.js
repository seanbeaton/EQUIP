import {allowed_images} from "../../../../lib/collections/press_content";


Template.pressContentManage.helpers({
  pressContent: function () {
    return PressContent.find().fetch();
  },
  allowedImages: function() {
    return allowed_images.map(i => {return {path: `/press_images/${i}`, fileName: i}})
  },
  imageMatch: function(image, option) {
    return image === option
  }
});

Template.pressContentManage.events = {
  'click .press__add-new': function (e) {
    Meteor.call('pressContentInsert', {
      'pressPublication': '',
      'pressTitle': '',
      'pressDateSort': '',
      'pressDateDisplay': '',
      'pressDescription': '',
      'pressEmbed': '',
      'pressLink': '',
      'pressLinkText': 'Read More',
      'pressCategorization': '',
      'pressImage': '',
      'published': true,
      'weight': 0,
    })
  },
  'click .press__save': function (e) {
    const pcid = $(e.target).attr('data-save-id');
    Meteor.call('pressContentUpdate', {
      'pressPublication': $('#press__publication--' + pcid).val(),
      'pressTitle': $('#press__title--' + pcid).val(),
      'pressDateSort': $('#press__date-sort--' + pcid).val(),
      'pressDateDisplay': $('#press__date-display--' + pcid).val(),
      'pressDescription': $('#press__content--' + pcid).val(),
      'pressEmbed': $('#press__embed--' + pcid).val(),
      'pressLink': $('#press__link--' + pcid).val(),
      'pressLinkText': $('#press__link-text--' + pcid).val(),
      'pressCategorization': $('#press__categorization--' + pcid).val(),
      'pressImage': $('input[name="press__image--' + pcid + '"]:checked').val(),
      'published': $('#press__published--' + pcid).is(':checked'),
      'weight' : parseInt($('#press__weight--' + pcid).val()),
      'pcid': pcid,
    })
  },
  'click .press__delete': function (e) {
    const pcid = $(e.target).attr('data-save-id');
    if (!confirm('Are you sure you want to delete this content?')) {
      return;
    }
    Meteor.call('pressContentDelete', {
      'pcid': pcid
    })
  },
}
