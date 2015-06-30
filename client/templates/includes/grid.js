Template.delivery.onCreated(function () {
  data = [
    ['2009', 'gadsd', 2941, 4303, 354, 'CNY', 'gasdfa'],
    ['2010', 'gdasf', 2905, 2867, 412, 'CNY', 'gdkwer'],
    ['2011', 'ghagd', 2517, 4822, 552, 'CNY', 'twefcsef'],
    ['2012', 'uiasg', 2422, 5399, 776, 'CNY', 'iwedfs']
  ];
  //Session.set('data', data);
  container = document.createElement('div');
  hot = new Handsontable(container, {
    data: data,
    rowHeaders: true,
    colHeaders: [
      '产品编号', '产品名称', '数量',
      '单价', '总价', '货币类型', '序列号'
    ],
    //colWidths: [100, 100, 100, 100, 100, 100, 100],
    columns: [
      {}, {},
      {type: 'numeric'},
      {type: 'numeric', format: '0,0.00'},
      {type: 'numeric', format: '0,0.00'},
      {},
      {}//{renderer: 'safeHtmlRenderer'}
    ],
    stretchH: 'all',

    manualColumnResize: true,
    manualRowResize: true
  });

  //hot.addHook('afterLoadData', function() {
  //  hot.render();
  //})
});

Template.delivery.onRendered(function () {

  //var container = $('.grid')[0];
  var up_container = this.find('.grid');
  up_container.appendChild(container);
  //hot.render();
  //var hot;
  //var data = Session.get('data');

  //Meteor.setTimeout(function() {
  //  hot.render();
  //}, 120);
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

Template.delivery.events({
  'click .open-goods-list': function (e, t) {
    e.preventDefault();
    var show = $(t.find('.grid'));
    if (show.hasClass('hidden')) {
      show.removeClass('hidden');
      //hot.render();
    } else {
      show.addClass('hidden');
    }
    //hot.render();
  }
});