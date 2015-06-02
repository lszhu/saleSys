var error_key = 'signinError';

Template.login.onCreated(function() {
  Session.set(error_key, {});
});

Template.login.helpers({
  errorMessage: function() {
    return _.values(Session.get(error_key));
  },
  errorClass: function(key) {
    return Session.get(error_key)[key] && 'error';
  }
});

Template.login.events({
  'submit': function(e, t) {
    event.preventDefault();

    var username = t.$('[name=username]').val();
    var password = t.$('[name=password]').val();

    var errors = {};

    if (! username) {
      errors.username = '必须输入用户名';
    }
    if (! password) {
      errors.password = '必须输入密码';
    }

    Session.set(error_key, errors);
    if (_.keys(errors).length) {
      return;
    }

    Meteor.loginWithPassword(username, password, function(err) {
      if (err) {
        return Session.set(error_key, {none: err.reason});
      }
      Router.go('/');
    });
  }
});
