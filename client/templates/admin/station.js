Template.station.helpers({
  temp: function() {}
});

Template.station.events({
  'click .edit-station': function(e) {
    e.preventDefault();
    $('#add-station').removeClass('hidden');
  },

  'submit .add-station': function(e) {
    e.preventDefault();

    var station = {
      code: $(e.target).find('[name=code]').val(),
      name: $(e.target).find('[name=name]').val(),
      manager: $(e.target).find('[name=manager]').val(),
      address: $(e.target).find('[name=address]').val(),
      comment: $(e.target).find('[name=comment]').val(),
      memo: $(e.target).find('[name=memo]').val()
    };
    console.log('station: ' + JSON.stringify(station));
    var overlap = $(e.target).find('[name=overlap]').prop('checked');
    console.log('overlap is: ' + overlap);
    Meteor.call('stationInsert', {station: station, overlap: overlap});
  }
});