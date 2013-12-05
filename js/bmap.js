+ function($) {

  "use strict";

  var BaiduMap = function(element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.bmap.defaults, options)
    this.options.scrollWheelZoom = this.options.scrollWheelZoom == 'true'
    this.options.navigation = this.options.navigation == 'true'
    this.options.overviewMap = this.options.overviewMap == 'true'
    this.options.scale = this.options.scale == 'true'
    this.options.zoom = parseInt(this.options.zoom)
    this.value = this.options.value || this.value || ''
    if (this.value) {
      this._init()
    } else {
      var that = this
      var myCity = new BMap.LocalCity()
      myCity.get(function(local) {
        that.value = local.center.lng + ',' + local.center.lat
        that._init()
      })
    }

    return this
  }

  BaiduMap.prototype = {

    constructor: BaiduMap

    ,
    _init: function() {
      this.map = new BMap.Map(this.$element.attr("id"))
      this.val(this.value)
      this._config()
    }

    ,
    _config: function() {
      this.map.setDefaultCursor("pointer");
      if (this.options.scrollWheelZoom) {
        this.map.enableScrollWheelZoom()
      }
      if (this.options.navigation) {
        this.map.addControl(new BMap.NavigationControl())
      }
      if (this.options.overviewMap) {
        this.map.addControl(new BMap.OverviewMapControl())
      }
      if (this.options.scale) {
        this.map.addControl(new BMap.ScaleControl())
      }
      if (this.menus)
        this.map.addContextMenu(this.menus)
      var that = this
      this.map.addEventListener("click", function(e) {
        that._locate(e.point)
        that._trigger(e.point.lng + ',' + e.point.lat)
      })
    }

    ,
    _search: function(address) {
      var myGeo = new BMap.Geocoder(),
        that = this;
      myGeo.getPoint(address, function(point) {
        if (point) {
          that._locate(point)
        } else {
          that.value = ''
          that._trigger()
        }
      }, address)
    }

    ,
    _locate: function(point) {
      this.map.clearOverlays()
      var resultMarker = new BMap.Marker(point)
      this.map.centerAndZoom(point, this.options.zoom || this.map.getZoom())
      this.options.zoom = 0
      this.map.addOverlay(resultMarker)
      resultMarker.setAnimation(BMAP_ANIMATION_BOUNCE)
      this.value = point.lng + ',' + point.lat
      this._trigger()
    }

    ,
    _trigger: function(point) {
      var e
      if (point !== undefined) {
        e = $.Event('clickmap.bmap', {
          point: point
        })
      } else {
        if (this.value === '') {
          e = $.Event('notfind.bmap')
        } else {
          e = $.Event('find.bmap', {
            point: this.value
          })
        }
      }
      this.$element.trigger(e)
    }

    ,
    val: function(address) {
      if (address === undefined) {
        return this.value
      } else {
        if (address == null || address.trim() == '') {
          this.value = ''
          this._trigger()
        } else {
          var point = address.split(',')
          if (point.length === 2) {
            this._locate(new BMap.Point(point[0], point[1]))
          } else {
            this._search(address)
          }
        }
        return this
      }
    }

    ,
    /**
     * 添加右键菜单
     * @param menus
     *            菜单配置项，值为对象数组，每个对象有text,fn两个参数，text值为‘-’时表示菜单项的分隔符<br/>
     *            exp. [{text:'',fn:function(point){}}]
     */
    addMenu: function(menus) {
      var contextMenu = new BMap.ContextMenu();
      $.each(menus, function(index, menu) {
        if (menu.text === "-") {
          // 添加分隔线
          contextMenu.addSeparator()
        } else {
          contextMenu.addItem(new BMap.MenuItem(menu.text, menu.fn))
        }
      })
      this.menus = contextMenu
      return this
    }
  }

  var old = $.fn.bmap

  $.fn.bmap = function(option) {
    var options = typeof option == 'object' && option
    this.each(function() {
      var $this = $(this),
        data = $this.data('bmap'),
        options = typeof option == 'object' && option
      if (!data) $this.data('bmap', (data = new BaiduMap(this, options)))
    })
    if (options.instance)
      return $(this).data('bmap')
    return this
  }

  $.fn.bmap.defaults = {
    zoom: 16, // 缩放级别 15:500 16:200 20:50 
    scrollWheelZoom: 'true', // 启用鼠标滚轮缩放
    navigation: 'true', // 启用平移缩放控件
    overviewMap: 'false', // 启用缩略地图控件
    scale: 'true' // 比例尺控件
  }

  $.fn.bmap.Constructor = BaiduMap

  $.fn.bmap.noConflict = function() {
    $.fn.bmap = old
    return this
  }

  $(window).on('load', function() {
    $('[data-bmap]').each(function() {
      var $bmap = $(this)
      $bmap.bmap($bmap.data())
    })
  })

}(jQuery);