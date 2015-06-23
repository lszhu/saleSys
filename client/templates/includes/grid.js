Template.delivery.onCreated(function () {
  var data = [
    ['', 'Maserati', 'Mazda', 'Mercedes', 'Mini', 'Mitsubishi'],
    ['2009', 0, 2941, 4303, 354, 5814],
    ['2010', 3, 2905, 2867, 412, 5284],
    ['2011', 4, 2517, 4822, 552, 6127],
    ['2012', 2, 2422, 5399, 776, 4151]
  ];
  Session.set('data', data);
});

Template.delivery.onRendered(function() {

  //var container = $('.grid')[0];
  var container = this.find('.grid');
  var hot;
  var data = Session.get('data');

  hot = new Handsontable(container, {
    data: data,
    rowHeaders: true,
    colHeaders: ['产品编号', '产品名称', '数量', '单价', '总价', '序列号'],

    stretchH: 'all',

    manualColumnResize: true,
    manualRowResize: true
  });

  /*
  function bindDumpButton() {
    if (typeof Handsontable === "undefined") {
      return;
    }

    Handsontable.Dom.addEvent(document.body, 'click', function (e) {

      var element = e.target || e.srcElement;

      if (element.nodeName == "BUTTON" && element.name == 'dump') {
        var name = element.getAttribute('data-dump');
        var instance = element.getAttribute('data-instance');
        var hot = window[instance];
        console.log('data of ' + name, hot.getData());
      }
    });
  }

  //bindDumpButton();
*/
});
