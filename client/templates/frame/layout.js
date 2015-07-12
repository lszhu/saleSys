Template.layout.onRendered(function () {
  this.find('#main')._uihooks = {
    insertElement: function (node, next) {
      $(node)
          .hide()
          .insertBefore(next)
        //.fadeIn();
          .slideDown();
    },
    removeElement: function (node) {
      $(node).slideUp(function () {
        $(this).remove();
      });
    }
  }
});