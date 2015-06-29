Template.stationSelect.helpers({
  stations: function() {
    return Stations.find();
  }
});

Template.stationSelectItem.helpers({
  isDefaultStation: function() {
    return this._id == defaultStationId();
  }
});

Template.currentStation.helpers({
  stations: function() {
    if (isAdministrator()) {
      //console.log('user level: ' + 'administrator');
      return Stations.find();
    }
    var data = Template.parentData();
    //console.log('data: ' + JSON.stringify(data));
    if (data && data._id) {
      return Stations.find(data.stationId);
    }
    var user = Meteor.user();
    return Stations.find(user && user.stationId);
  }
});

Template.currentStationItem.helpers({
  isDefaultStation: function() {
    return this._id == defaultStationId();
  },
  isSelected: function() {
    if (!Template.parentData()) {
      return false;
    }
    var stationId = Template.parentData().selection;
    //console.log('stationId: ' + stationId);
    if (stationId) {
      return stationId == this._id;
    } else {
      return this._id == defaultStationId();
    }
  }
});

