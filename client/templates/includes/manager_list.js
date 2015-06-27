Template.managerList.helpers({
  managers: function() {
    if (isAdministrator()) {
      return Meteor.users.find();
    }
    var data = Template.parentData();
    if (!data || data && !data._id) {
      return [Meteor.user()];
    }
    return [];
  }
});

Template.managerList.onRendered(function() {
  var data = Template.parentData();
  console.log('data: ' + JSON.stringify(data));
  if (!data || data && !data.managerId) {
    return;
  }
  var manager = this.$('.manager-list [name=managerId]')[0];
  if (!manager) {
    return;
  }
  Meteor.call('getNameById', data.managerId, function(error, result) {
    if (!error) {
      //data.manager = result;
      //manager.val(result);
      manager.innerHTML = '<option value="' + data.managerId + '">' +
          result + '</option>';
      //console.log('manager: ' + JSON.stringify(data));
    } else {
      manager.innerHTML = '<option>未知</option>';
    }
  });
});

Template.managerListItem.helpers({
  isSelected: function(u, v) {
    return u == v ? 'selected' : '';
  }
});