Template.station.helpers({
  temp: function() {}
});

Template.station.events({
  'click .add-station': function(e) {
    e.preventDefault();
    $('#add-station').removeClass('hidden');
  }
})