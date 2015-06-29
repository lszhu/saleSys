Template.managerList.helpers({
  managers: function() {
    var data = Template.parentData();
    //console.log('stationId: ' + JSON.stringify(data && data.stationId));
    if (isSuperUser()) {
      return data.getManagers();
    } else {
      if (data && data._id) {
        return data.getManagers();
      } else {
        return [Meteor.user()];
      }
    }
  }
});

Template.managerListItem.helpers({
  isSelected: function(v) {
    var u = Template.parentData().selection;
    console.log('selection: ' + JSON.stringify(u));
    return u == v ? 'selected' : '';
  }
});