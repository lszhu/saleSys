Template.notifications.helpers({
  notifications: function() {
    return Messages.find({receiverId: Meteor.userId(), read: false},
        {sort: {timestamp: -1}, limit: 10});
  },
  notificationCount: function(){
  	return Messages.find({receiverId: Meteor.userId(), read: false}).count();
  },
  getNameFromId: getNameFromId
});

Template.notifications.events({
  'click li.notification': function(e) {
    e.preventDefault();
    e.stopPropagation();

    var target = $(e.currentTarget);
    if (target.hasClass('hide-content')) {
      target.removeClass('hide-content');
    } else {
      Meteor.call('setMessageRead', this._id);
      //Messages.update(this._id, {$set: {read: true}});
    }
  }
});