import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/factory';

class SharedListsCollection extends Mongo.Collection {
  update(sharedList, callback) {
    console.log('update');
    // eslint-disable-next-line no-debugger
    debugger;

    const ourSharedList = sharedList;
    const sharedListToUpdate = { userId: ourSharedList.userToShare, lists: [ourSharedList.listId] };
    const existingSharedList = this.findOne({ userId: ourSharedList.userId });
    let result;
    if (!existingSharedList) {
      result = super.insert(sharedListToUpdate, callback);
    } else {
      sharedListToUpdate.lists = existingSharedList.lists.apend(ourSharedList.listId);
      result = super.update(sharedListToUpdate, callback);
    }

    return result;
  }

  remove(selector, callback) {
    return super.remove(selector, callback);
  }
}

export const SharedLists = new SharedListsCollection('SharedLists');

// Deny all client-side updates since we will be using methods to manage this collection
SharedLists.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

SharedLists.schema = new SimpleSchema({
  userId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
  lists: { type: Array(String) },
});

SharedLists.attachSchema(SharedLists.schema);

// This represents the keys from Lists objects that should be published
// to the client. If we add secret properties to List objects, don't list
// them here to keep them private to the server.
SharedLists.publicFields = {
  userId: 1,
  lists: 1,
};

Factory.define('SharedList', SharedLists, {});

SharedLists.helpers({
  // A list is considered to be private if it has a userId set
  isPrivate() {
    return !!this.userId;
  },
  isLastPublicList() {
    const publicListCount = SharedLists.find({ userId: { $exists: false } }).count();
    return !this.isPrivate() && publicListCount === 1;
  },
  editableBy(userId) {
    if (!this.userId) {
      return true;
    }

    return this.userId === userId;
  },
});
