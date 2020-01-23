import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';

import { SharedLists } from './sharedLists.js';


export const share = new ValidatedMethod({
  name: 'sharedLists.share',
  validate: new SimpleSchema({
    userToShare: { type: String },
    listId: { type: String },
  }).validator(),
  run({ userToShare, listId }) {
    console.log('sharedLists.share');
    /*    const list = Lists.findOne(listId);

    if (!list.editableBy(this.userId)) {
      throw new Meteor.Error(
        'api.lists.remove.accessDenied',
        'You don\'t have permission to share this list.',
      );
    }
*/
    // XXX the security check above is not atomic, so in theory a race condition could
    // result in exposing private data

    const userIdToShare = Meteor.call('findUserByEmail', userToShare);

    if (userIdToShare) {
      SharedLists.update({ userIdToShare, listId });
    } else {
      throw new Meteor.Error(' You didn\'t intro a valid email of an existing user');
    }
  },
});


// Get list of all method names on Lists
const LISTS_METHODS = _.pluck([
  share,
], 'name');

if (Meteor.isServer) {
  // Only allow 5 list operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(LISTS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 5, 1000);
}
