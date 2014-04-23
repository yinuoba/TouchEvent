;(function($, window, undefined) {
  /**
   * @description 触摸事件
   * @param {HTMLElement} [options.element = document] 需添加touch事件的节点，默认为document
   * @param {HTMLElement} [options.targetSelector] 需要做事件委托处理时，通过targetSelector传需要添加事件的节点
   * @param {Function} [options.startCallback = function(){}] touchstart事件的回调函数
   * @param {Function} [options.moveCallback = function(){}] touchmove事件的回调函数
   * @param {Function} [options.endCallback = function(){}] touchend事件的回调函数
   * @param {[Boolean]} options.debug 是否开启debug模式，默认为不开启
   * @return {[null]}
   * @example
   *  // 企业列表、证据、材料
      var touchEvent = new $.TouchEvent({
        targetSelector: '#searchCorpListTouch, #ajaxContent_getCorpEvList, #ajaxContent_getCorpFileList',
        endCallback: function(){
          var _this = this;
          // 找出当前页
          var $currentPage = $('.pAjax span.current');
          var $prevPage = $currentPage.prev();
          var $nextPage = $currentPage.next();

          if($currentPage.length){
            if (_this.endY - _this.startY > 100) { // 往下拉
              if ($prevPage.length) { // 出来上一页的数据
                $prevPage.trigger('click');
              }
            }

            if (_this.endY - _this.startY < -100) { // 往上拉
              if ($nextPage.length) { // 出来下一页的数据
                $nextPage.trigger('click');
              }
            }
          }
        }
      });
   */
  "use strict";
  var TouchEvent = function(options) {
    var _this = this;
    // 定义静态属性
    _this.opts = options;
    _this.element = options.element || document;
    _this.targetSelector = options.targetSelector;

    _this.startCallback = options.startCallback || function() {};
    _this.moveCallback = options.moveCallback || function() {};
    _this.endCallback = options.endCallback || function() {};

    // 定义静态属性，相对touchListener方法为全局
    _this.startX = 0;
    _this.startY = 0;
    _this.moveX = 0;
    _this.moveY = 0;
    _this.endX = 0;
    _this.endY = 0;

    // 是否开启debug模式，默认为不开启
    _this.debug = options.debug;

    // 检测Function是否有bind方法，若无，则扩展
    _this.bind();

    _this.init();
  };

  TouchEvent.prototype = {
    constructor: TouchEvent,
    init: function() {
      var _this = this;

      // 注册事件，并把时间的this对象换成_this
      _this.element.addEventListener('touchstart', _this.touchListener.bind(_this), false);
      _this.element.addEventListener('touchmove', _this.touchListener.bind(_this), false);
      _this.element.addEventListener('touchend', _this.touchListener.bind(_this), false);
    },
    touchListener: function(event) {
      var _this = this;
      if (_this.targetSelector && _this.getChildrenAndSelf($(_this.targetSelector)).indexOf(event.target) === -1) { // 处理事件委托
        return false;
      }
      switch (event.type) { // 根据触摸过程中的不同事件类型，做不同的处理
        case "touchstart":
          // 取得当前坐标
          _this.startX = event.touches[0].clientX;
          _this.startY = event.touches[0].clientY;

          // 触摸开始，触发回调
          _this.startCallback.call(_this, _this.startX, _this.startY, event);
          break;

        case "touchend":
          // 取得当前坐标
          _this.endX = event.changedTouches[0].clientX;
          _this.endY = event.changedTouches[0].clientY;

          // 停止触摸时的回调函数
          _this.endCallback.call(_this, _this.endX, _this.endY, event);

          break;

        case "touchmove":
          // 移动的时候阻止默认事件
          event.preventDefault();

          // 取得当前坐标
          _this.moveX = event.touches[0].clientX;
          _this.moveY = event.touches[0].clientY;
          // 停止触摸时的回调函数
          _this.moveCallback.call(_this, _this.moveX, _this.moveY, event);

          break;
      }
    },
    getChildrenAndSelf: function(element) { // 找出节点下的所有节点数组
      var arr = [];
      var $elements = $(element);
      $elements.each(function() {
        var children = this.getElementsByTagName('*');
        for (var i = children.length - 1; i >= 0; i--) {
          arr.push(children[i]);
        }
        arr.push(this)
      });
      return arr;
    },
    bind: function() { // 若原生不支持bind方法，则扩展
      if (!Function.prototype.bind) {
        Function.prototype.bind = function(obj) {
          if (arguments.length < 2 && !arguments[0]) {
            return this;
          }
          var fn = this,
            slice = Array.prototype.slice,
            args = slice.call(arguments, 1);
          // 返回一function，以obj为this，bind中传入的参数加上当前function中参数为参数
          return function() {
            // 后面继续连上arguments，给返回的function传入参数
            return fn.apply(obj, args.concat(slice.call(arguments)))
          }
        }
      }
    },
    console: function(msg) { // 输出错误信息到错误控制台
      var _this = this;
      if (window.console && _this.debug) {
        console.error(msg);
      }
    }
  };
  // 注入到jQuery这一namespace下
  jQuery.TouchEvent = TouchEvent;
})(jQuery, window);