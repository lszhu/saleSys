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