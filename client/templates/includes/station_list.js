Template.stationSelect.helpers({
  stations: function() {
    return Stations.find();
  }
});

Template.stationSelectItem.helpers({
  // todo 需要根据登录用户的偏好设置来确定
  isDefaultStation: function() {
    return this.name == '广州店';
  }
});