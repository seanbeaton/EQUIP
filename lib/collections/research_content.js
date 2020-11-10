import SimpleSchema from "simpl-schema";

ResearchContent = new Mongo.Collection('research_content');

export const allowed_images = [
  'image_1.jpg',
  'image_2.jpg',
  'image_3.jpg',
  '',
]

const research_content_schema = {
  researchCitation: String,
  researchTitle: String,
  researchDateSort: String,
  researchDescription: String,
  researchLink: String,
  researchCategorization: String,
  published: Boolean,
  weight: Number,
  researchImage: {
    type: String,
    allowedValues: allowed_images
  },
}


Meteor.methods({
  researchContentInsert: function (postAttributes) {
    try {
      new SimpleSchema(research_content_schema).validate(postAttributes);
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

    let rpid = ResearchContent.insert(params);

    return {
      _id: rpid
    };
  },

  researchContentUpdate: function (postAttributes) {
    try {
      const edit_schema = _.clone(research_content_schema);
      new SimpleSchema(_.extend(edit_schema, {
        rpid: String
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

    ResearchContent.update({_id: params.rpid}, _.omit(postAttributes, 'rpid'));
  },

  researchContentDelete: function (postAttributes) {
    try {
      new SimpleSchema({'rpid': String}).validate(postAttributes);
    } catch (e) {
      throw new Meteor.Error('422', e.message)
    }

    let user = Meteor.user();
    if (!user || !Roles.userIsInRole(user, 'admin', 'site')) {
      throw new Meteor.Error('423', "You don't have permission to do that.")
    }

    ResearchContent.remove({_id: postAttributes.rpid});
  }
});
