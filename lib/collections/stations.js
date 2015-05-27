Stations = new Mongo.Collection('stations');

Meteor.methods({
  stationInsert: function(stationAttributes) {
    //check(this.userId, String);
    check(stationAttributes, {
      code: String,
      name: String,
      address: String,
      manager: String
    });

    var user = Meteor.user();
    //var post = Posts.findOne(stationAttributes.postId);

    if (!user)
      throw new Meteor.Error('invalid-station', '销售分部信息有误');

    var exist = Stations.findOne({name: stationAttributes.name});
    if (exist) {
      throw new Meteor.Error('exist_station', '销售分部重名');
    }

    var station = _.extend(stationAttributes, {
      timestamp: new Date()
    });

    // create the station, save the id
    station._id = Stations.insert(station);

    return station._id;
  }
});
