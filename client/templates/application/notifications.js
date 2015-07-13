Template.notifications.helpers({
  notifications: function() {
    return Messages.find({receiverId: Meteor.userId(), read: false});
  },
  notificationCount: function(){
  	return Messages.find({receiverId: Meteor.userId(), read: false}).count();
  }
});

Template.notificationItem.helpers({
  notificationPostPath: function() {
    return Router.routes.postPage.path({_id: this.postId});
  }
})

Template.notificationItem.events({
  'click a': function() {
    Messages.update(this._id, {$set: {read: true}});
  }
})