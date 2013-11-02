! function($) {

  "use strict"; // jshint ;_;

  var region_data,
    loading = false,
    callbacks = $.Callbacks("once"),
    Region = function(element, options) {
      this.$element = $(element)
      this.options = $.extend({}, $.fn.region.defaults, options)
      this.remote = this.options.remote || this.remote

      this.target = $(this.options.target || this.target)
      this.target.css('cursor','pointer').attr('readonly', true)
      this._value = this.target.length > 0 ? this.target.val() : this.$element.data('value')


      this.$menu = $('<ul data-index="0"></ul><ul data-index="1"></ul><ul data-index="2"></ul>')
      this.$element.prepend(this.$menu)
      this.$detail = this.$element.find('input')
      this.lazy = this.options.lazy || this.lazy

      if (!this.lazy) {
        this.load()
      }
      this.listen()
    }

  Region.prototype = {

    constructor: Region

    ,
    load: function() {
      if (!region_data) {
        if (!this.lazy) callbacks.add($.proxy(this.render, this))
        if (!loading) {
          loading = true
          $.getJSON(this.remote, function(json, textStatus) {
            region_data = json
            callbacks.fire()
          });
        }
      } else {
        if (!this.lazy) this.render()
      }
    }

    ,
    val: function(val) {
      if (val === undefined) {
        this._value = []
        for (var i = 0; i < 3; i++) {
          var _d = this._value_index[i.toString()]
          if (_d === undefined || _d == null)
            break
          else
            this._value.push(this._getData(i)[_d])
        }
        var v = this.$detail.val()
        this._value = this._value.join(',') + (v ? ',' + v : '')
        return this._value
      } else {
        this._value = val
        this.target.val(val)
        this.render()
      }
    }

    ,
    _render: function(items, index, val) {
      var that = this,
        _str = ''

      $.each(items, function(i, item) {
        var active = '>'
        if (item == val) {
          active = ' class="active">'
          that._value_index[index.toString()] = i
        }
        _str += '<li data-index="' + i + '"' + active + item + '</li>'
      })
      return _str
    }

    ,
    _getData: function(index) {
      if (index > 2) return []
      var data = region_data,
        _i = index
      for (var i = 0; i <= index; i++) {
        data = data[_i]
        _i = this._value_index[i.toString()]
        if (_i === undefined || _i == null)
          break;
      }
      return data
    }

    ,
    render: function() {
      if (!region_data) {
        this.load();
      } else {
        var that = this,
          _vs = (that._value || '').split(','),
          _m = that.$menu.hide()

          that.$detail.val('')

          this._value_index = {}

        $.each(_vs, function(i, v) {
          var _ul = _m.get(i)
          if (i < 3) {
            var h = that._render(that._getData(i), i, v)
            if (h) $(_ul).html(h).show()
            if (that._value_index[i.toString()] === undefined) {
              that.$detail.val(v);
              return false
            }
          } else {
            that.$detail.val(v);
            return false
          }
        })
      }
    }

    ,
    listen: function() {
      var that = this
      this.target.on('click', function() {
        that.val(that.target.val())
      })

      this.$detail.on('change',function(){
        that.target.val(that.val())
      })

      this.$menu
        .on('click', 'li', $.proxy(this.click, this))
    }

    ,
    click: function(e) {
      var $li = $(e.target),
        $ul = $li.parent(),
        i1 = parseInt($li.data('index')),
        i2 = $ul.data('index');

      $ul.children().removeClass('active')
      $li.addClass('active')
      $ul.nextAll('ul').hide()

      this._value_index[i2.toString()] = i1
      var i2 = parseInt(i2) + 1
      for (var i = i2; i < 3; i++) {
          this._value_index[i.toString()] = null   
      }

      var data = this._getData(i2)
      if (data.length == 0) {
        this.$detail.focus()
      } else {
        $ul.next().html(this._render(data)).show()
      }
      this.target.val(this.val())
    }
  }

  var old = $.fn.region

  $.fn.region = function(option) {
    return this.each(function() {
      var $this = $(this),
        data = $this.data('region'),
        options = typeof option == 'object' && option
      if (!data) $this.data('region', (data = new Region(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.region.defaults = {
    lazy: true,
    remote: '',
    target: ''
  }

  $.fn.region.Constructor = Region

  $.fn.region.noConflict = function() {
    $.fn.region = old
    return this
  }

  $(window).on('load', function() {
    $('[data-region]').each(function() {
      var $region = $(this)
      $region.region($region.data())
    })
  })

  $(document).on('click.dropdown.data-api', '.region', function(e) {
    e.stopPropagation()
  })

}(window.jQuery);