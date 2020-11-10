import SimpleSchema from "simpl-schema";

class PressItem {
  constructor(doc) {
    _.extend(this, doc);
  }
  get pressDateDisplay() {
    let date = new Date(this.pressDateSort)
    return date.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
}

PressContent = new Mongo.Collection('press_content', {
  transform: (doc) => new PressItem(doc)
});

export const allowed_images = [
  'AcademicMinute.png',
  'ams_logo.png',
  'calstate_logo.png',
  'KPBS_RGB.png',
  'math_ed_podcast_logo.jpg',
  'mir-logo__1_.jpg',
  'SDSU_newscenter.gif',
  '',
]

const press_content_schema = {
  pressPublication: String,
  pressTitle: String,
  pressDateSort: String,
  pressDescription: String,
  pressEmbed: String,
  pressLink: String,
  pressLinkText: String,
  pressCategorization: String,
  pressImage: {
    type: String,
    allowedValues: allowed_images
  },
  published: Boolean,
  weight: Number,
}


Meteor.methods({
  pressContentInsert: function (postAttributes) {
    try {
      console.log('press_content_schema', press_content_schema);
      new SimpleSchema(press_content_schema).validate(postAttributes);
    } catch (e) {
      throw new Meteor.Error('422', e.message)
    }

    let user = Meteor.user();
    if (!user || !Roles.userIsInRole(user, 'admin', 'site')) {
      throw new Meteor.Error('423', "You don't have permission to do that.")
    }

    let params = _.extend(postAttributes, {
      submitted: new Date(),
      lastModified: new Date(),
    });

    let pcid = PressContent.insert(params);

    return {
      _id: pcid
    };
  },

  pressContentUpdate: function (postAttributes) {
    try {
      const edit_schema = _.clone(press_content_schema);
      new SimpleSchema(_.extend(edit_schema, {
        pcid: String
      })).validate(postAttributes);
    } catch (e) {
      throw new Meteor.Error('422', e.message)
    }

    let user = Meteor.user();
    if (!user || !Roles.userIsInRole(user, 'admin', 'site')) {
      throw new Meteor.Error('423', "You don't have permission to do that.")
    }

    let params = _.extend(postAttributes, {
      submitted: new Date(),
      lastModified: new Date(),
    });

    PressContent.update({_id: postAttributes.pcid}, _.omit(params, 'pcid'));
  },

  pressContentDelete: function (postAttributes) {
    try {
      new SimpleSchema({'pcid': String}).validate(postAttributes);
    } catch (e) {
      throw new Meteor.Error('422', e.message)
    }

    let user = Meteor.user();
    if (!user || !Roles.userIsInRole(user, 'admin', 'site')) {
      throw new Meteor.Error('423', "You don't have permission to do that.")
    }

    PressContent.remove({_id: postAttributes.pcid});
  }
});
