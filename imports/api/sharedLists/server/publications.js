/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';

import { SharedLists } from '../sharedLists.js';

Meteor.publish('SharedLists.public', function sharedListsPublic() {
  return SharedLists.find({
    // userId: { $exists: false },
  }, {
    fields: SharedLists.publicFields,
  });
});

Meteor.publish('SharedLists.private', function sharedListsPrivate() {
  if (!this.userId) {
    return this.ready();
  }

  return SharedLists.find({
    // userId: this.userId,
  }, {
    fields: SharedLists.publicFields,
  });
});
