// 通过下拉方式显示$box（JQuery封装过）节点的内容
function showAddCustomerForm($box) {
  var timer = {};
  var $content = $box.children();
  var height = $content.css('height');
  height = height ? height.slice(0, -2) : '0';
  var delta = height / 10;
  var tmpHeight = delta;
  !function slideDown() {
    console.log('height: ' + tmpHeight);
    $box.css('height', tmpHeight + 'px');
    if (tmpHeight == height) {
      return;
    } else if (tmpHeight + delta > height) {
      tmpHeight = height;
    } else {
      tmpHeight += delta;
    }
    timer = Meteor.setTimeout(function () {
      slideDown();
    }, 20);
  }();
  return timer;
}

// 通过上拉方式隐藏$box（JQuery封装过）节点的内容
function hideAddCustomerForm($box) {
  var timer = {};
  var $content = $box.children();
  var height = $content.css('height');
  height = height ? height.slice(0, -2) : '0';
  //console.log('height: ' + height);
  var delta = height / 10;
  !function slideUp() {
    console.log('height: ' + height);
    $box.css('height', height + 'px');
    if (height == 0) {
      return;
    } else if (height - delta < 0) {
      height = 0;
    } else {
      height -= delta;
    }
    timer = Meteor.setTimeout(function () {
      slideUp();
    }, 20);
  }();
  return timer;
}
